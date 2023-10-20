require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pgp = require('pg-promise')();
const crypto = require('crypto');
const { as } = require('pg-promise');

const dbConfig = {
    host: 'localhost',
    port: 5432,
    database: 'employee_attendance',
    user: 'postgres',
    password: process.env.POSTGRES_PASSWORD
};
const db = pgp(dbConfig);
const router = express.Router();
const saltRounds = 10;

// Login employee
// Generates JWT and refresh tokens, sent as cookies
router.post('/api/employees/login', async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const employee = await db.oneOrNone('SELECT * FROM employees WHERE email = $1', [email]);
        
        if (employee && await bcrypt.compare(password, employee.password)) {        

            // Generate JWT token from unique employee id
            const payload = {
                employee_id: employee.employee_id // Use 'id' instead of '_id'
            };
            
            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

            // Generate refresh token and insert into db w/ corresponding employee_id
            const refreshToken = crypto.randomBytes(64).toString('hex');
            await db.none(
                'INSERT INTO refresh_tokens (token, employee_id) VALUES ($1, $2)',
                [refreshToken, employee.employee_id]
            );
            
            // Send tokens as cookies
            res.cookie('token', token, {
                httpOnly: true,
                sameSite: 'None',
                secure: true,
                maxAge: 3600000  // 1 hr
            });
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                sameSite: 'None',
                secure: true,
                maxAge: 7 * 24 * 3600000 // 1 week
            });
            
            const { password: _, ...employeeData } = employee;  // Exclude password from response
            res.status(200).json({ message: 'Login successful', employee: employeeData });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        next(error);
    }
});

// Create new employee
router.post('/api/employees/signup', async (req, res, next) => {
    const { firstName, lastName, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    try {
        const newEmployee = await db.one('INSERT INTO employees(first_name, last_name, email, password) VALUES($1, $2, $3, $4) RETURNING *', [firstName, lastName, email, hashedPassword]);
        res.status(200).json({ message: 'Employee registered', newEmployee });
    } catch (error) {
        if (error.code === '23505') { // Unique violation in PostgreSQL
            return res.status(400).json({ message: 'An account with this email already exists' });
        }
        console.error(error);
        next(error);  
    }
});

// Logout current employee
router.post('/api/employees/logout', async (req, res) => {
    // Clear JWT and refresh token cookies
    res.clearCookie('token');
    res.clearCookie('refreshToken');

    const { refreshToken } = req.cookies;
    if (refreshToken) {
        await db.none('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
    }

    res.status(200).json({ message: 'Logged out successfully' });
});

// Get current employee's data
router.get('/api/employees/employee', async (req, res, next) => {
    const employee_id = req.employee ? req.employee.employee_id : null;
    
    try {
        
        // Get employee data
        const employeeData = await db.oneOrNone(
            'SELECT * FROM employees WHERE employee_id = $1',
            [employee_id]
        );
            
        // Check if employee was found in the database
        if (!employeeData) {
            return res.status(404).json({ error: 'Employee not found' });
        };
            
        const {password, ...employeeWithoutPassword } = employeeData;
        res.json({ employee: employeeWithoutPassword });
    } catch (error) {
        console.log(error);
        if (error.message.includes('Not authenticated') || error.message.includes('Employee not found')) {
            res.status(401).json({ error: error.message });
        } else {
            next(error);
        }
    }
});

// Get an employee's work entry data
router.get('/api/work_entries/:employee_id', async (req, res, next) => {
    const employee_id = req.params.employee_id;

    try {
        const entries = await db.any(
            'SELECT * FROM work_entries WHERE employee_id = $1 ORDER BY entry_id DESC', 
            [employee_id]
        );

        res.json(entries);
    } catch (error) {
        console.error('Error fetching work entries:', error);
        res.status(500).json({ error: 'Failed to fetch work entries' });
    }
});

// Clock current employee in
router.post('/api/work_entries/clock_in', async (req, res, next) => {
    const { employee_id, currentTime, location, coordinates } = req.body;
    const coordinatesPoint = `(${coordinates.latitude}, ${coordinates.longitude})`;

    try {
        // Check for an incomplete entry for the employee
        const incompleteEntry = await db.oneOrNone(
            'SELECT * FROM work_entries WHERE employee_id = $1 AND clock_out_time IS NULL',
            [employee_id]
        );

        if (incompleteEntry) {
            // If incomplete entry found, prevent clock-in
            return res.status(400).json({ message: 'You need to clock out before clocking in again.' });
        }

        const clockEntry = await db.one(
            'INSERT INTO work_entries(employee_id, clock_in_time, clock_in_location, clock_in_coordinates) VALUES($1, $2, $3, $4) RETURNING *',
            [employee_id, currentTime, location, coordinatesPoint]
        );

        const employeeData = await db.oneOrNone(
            `SELECT * FROM employees WHERE employee_id = $1`
        , [employee_id]);

        const {password, ...employee} = employeeData

        res.status(200).json({ message: 'Clocked in', clockEntry, employee });
    } catch (error) {
        console.error(error);
        next(error);
    }
});

// Clock current employee out
router.post('/api/work_entries/clock_out', async (req, res, next) => {
    const { employee_id, currentTime, location, coordinates, tasks } = req.body;
    const coordinatesPoint = `(${coordinates.latitude}, ${coordinates.longitude})`;

    try {
        const clockEntry = await db.oneOrNone(
            `UPDATE work_entries 
             SET clock_out_time = $2, clock_out_location = $3, clock_out_coordinates = $4, tasks = $5
             WHERE employee_id = $1 AND clock_out_time IS NULL
             RETURNING *`,
            [employee_id, currentTime, location, coordinatesPoint, tasks]
        );

        const employeeData = await db.oneOrNone(
            `SELECT * FROM employees WHERE employee_id = $1`, 
            [employee_id]
        );

        if (!clockEntry) {
            return res.status(400).json({ message: 'No active session to clock out from.' });
        }

        // Remove password
        const { password, ...employee } = employeeData;

        res.status(200).json({ message: 'Clocked out', clockEntry, employee });
    } catch (error) {
        console.error(error);
        next(error);
    }
});

// Change current employee's password
router.post('/api/employees/employee/change_password', async (req, res, next) => {
    const employee_id = req.employee.employee_id;
    const { oldPassword, newPassword } = req.body;

    try {        
        const employee = await db.oneOrNone('SELECT * FROM employees WHERE employee_id = $1', [employee_id]);

        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        const match = await bcrypt.compare(oldPassword, employee.password);

        if (!match) {
            return res.status(401).json({ message: 'The entered password does not match your current password.' });
        }

        // Hash the new password and update it in the database
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        await db.none('UPDATE employees SET password = $1 WHERE employee_id = $2', [hashedPassword, employee_id]);

        // Respond with a success message
        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error changing password: ', error);
        next(error);
    }
});

// ADMIN ROUTES

// Get all employees
router.get('/api/employees', async (req, res, next) => {
    try {
        // Query the database to retrieve all employees
        const employees = await db.any('SELECT * FROM employees');

        // Respond with the list of employees
        res.status(200).json(employees);
    } catch (error) {
        // Handle errors, e.g., database errors
        console.error('Error fetching employees:', error);
        res.status(500).json({ error: 'Failed to fetch employees' });
    }
});

// Refresh token
router.post('/api/refresh_tokens/refresh', async (req, res, next) => {
    const { refreshToken } = req.cookies;
    
    const storedToken = await db.oneOrNone('SELECT employee_id FROM refresh_tokens WHERE token = $1', [refreshToken]);

    if (storedToken) {
        const payload = {
            employee_id: storedToken.employee_id
        };
        const newToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.cookie('token', newToken, {
            httpOnly: true,
            sameSite: 'None',
            secure: true,
            maxAge: 3600000 
        });

        res.status(200).json({ message: 'Token refreshed successfully' });
    } else {
        res.status(401).json({ message: 'Invalid refresh token' });
    }
});

// Export the router
module.exports = router;

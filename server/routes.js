require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Employee, RefreshToken, WorkEntry } = require('./db');

const router = express.Router();

// Login employee
// Generates JWT and refresh tokens, sent as cookies
router.post('/employees/login', async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const employee = await Employee.findOne({ email: email });
        
        if (employee && await bcrypt.compare(password, employee.password)) {
            const payload = { employeeId: employee._id };
            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
            const refreshToken = crypto.randomBytes(64).toString('hex');

            const newRefreshToken = new RefreshToken({ token: refreshToken, employee: employee._id });
            await newRefreshToken.save();

            res.cookie('token', token, { httpOnly: true, sameSite: 'None', secure: true, maxAge: 3600000 });
            res.cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'None', secure: true, maxAge: 7 * 24 * 3600000 });

            const { password: _, ...employeeData } = employee.toObject();
            res.status(200).json({ message: 'Login successful', employee: employeeData });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        next(error);
    }
});

// Create new employee
router.post('/employees/signup', async (req, res, next) => {
    const { firstName, lastName, email, password } = req.body;
    try {
        const newEmployee = new Employee({ firstName, lastName, email, password });
        await newEmployee.save();

        const { password: _, ...employeeData } = newEmployee.toObject();
        res.status(200).json({ message: 'Employee registered', employee: employeeData });
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ message: 'An account with this email already exists' });
        } else {
            console.error(error);
            next(error);
        }
    }
});


// Logout current employee
router.post('/employees/logout', async (req, res) => {
    res.clearCookie('token');
    res.clearCookie('refreshToken');
    const { refreshToken } = req.cookies;
    if (refreshToken) {
        await RefreshToken.deleteOne({ token: refreshToken });
    }
    res.status(200).json({ message: 'Logged out successfully' });
});

// Get current employee's data
router.get('/employees/employee', async (req, res, next) => {
    const employeeId = req.employee ? req.employee.employeeId : null;
    
    try {
        const employeeData = await Employee.findById(employeeId).select('-password');
        
        if (!employeeData) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        
        res.json({ employee: employeeData });
    } catch (error) {
        console.error(error);
        next(error);
    }
});


// Get an employee's work entry data
router.get('/work_entries/:employee_id', async (req, res, next) => {
    const employeeId = req.params.employee_id;

    try {
        const entries = await WorkEntry.find({ employeeId: employeeId }).sort({ clockInTime: -1 });
        res.json(entries);
    } catch (error) {
        console.error('Error fetching work entries:', error);
        res.status(500).json({ error: 'Failed to fetch work entries' });
    }
});


// Clock current employee in
router.post('/work_entries/clock_in', async (req, res, next) => {
    const { employee_id, currentTime, location, coordinates } = req.body;
    console.log("employee_id", employee_id)
    const coordinatesPoint = { latitude: coordinates.latitude, longitude: coordinates.longitude };

    try {
        // Check for an incomplete entry for the employee
        const incompleteEntry = await WorkEntry.findOne({
            employeeId: employee_id,
            clockOutTime: { $exists: false }
        });

        if (incompleteEntry) {
            return res.status(400).json({ message: 'You need to clock out before clocking in again.' });
        }

        const clockEntry = new WorkEntry({
            employeeId: employee_id,
            clockInTime: currentTime,
            clockInLocation: location,
            clockInCoordinates: coordinatesPoint
        });

        await clockEntry.save();
        res.status(200).json({ message: 'Clocked in', clockEntry });
    } catch (error) {
        console.error(error);
        next(error);
    }
});


// Clock current employee out
router.post('/work_entries/clock_out', async (req, res, next) => {
    const { employee_id, currentTime, location, coordinates, tasks } = req.body;
    const coordinatesPoint = { latitude: coordinates.latitude, longitude: coordinates.longitude };

    try {
        const clockEntry = await WorkEntry.findOneAndUpdate(
            { employeeId: employee_id, clockOutTime: { $exists: false } },
            {
                clockOutTime: currentTime,
                clockOutLocation: location,
                clockOutCoordinates: coordinatesPoint,
                tasks: tasks
            },
            { new: true }
        );

        if (!clockEntry) {
            return res.status(400).json({ message: 'No active session to clock out from.' });
        }

        res.status(200).json({ message: 'Clocked out', clockEntry });
    } catch (error) {
        console.error(error);
        next(error);
    }
});


// Change current employee's password
router.post('/employees/employee/change_password', async (req, res, next) => {
    const employeeId = req.employee.employeeId; // Adjusted to match the MongoDB ID
    const { oldPassword, newPassword } = req.body;

    try {
        const employee = await Employee.findById(employeeId);

        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        const match = await bcrypt.compare(oldPassword, employee.password);

        if (!match) {
            return res.status(401).json({ message: 'The entered password does not match your current password.' });
        }

        // Hash the new password and update it in the database
        employee.password = newPassword;
        await employee.save();

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error changing password: ', error);
        next(error);
    }
});


// ADMIN ROUTES

// Get all employees
router.get('/employees', async (req, res, next) => {
    try {
        const employees = await Employee.find().select('-password'); // Excluding password field

        res.status(200).json(employees);
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ error: 'Failed to fetch employees' });
    }
});

// Get specific employee's data
router.get('/employees/:employee_id', async (req, res, next) => {
    const employeeId = req.params.employee_id;
    
    try {
        const employeeData = await Employee.findById(employeeId).select('-password'); // Excludes password from the result
        
        if (!employeeData) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        
        res.json({ employee: employeeData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Refresh token
router.post('/refresh_tokens/refresh', async (req, res, next) => {
    const { refreshToken } = req.cookies;
    
    try {
        const storedToken = await RefreshToken.findOne({ token: refreshToken }).populate('employee');

        if (storedToken) {
            const payload = {
                employee_id: storedToken.employee._id
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
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Export the router
module.exports = router;

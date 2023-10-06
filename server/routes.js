require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pgp = require('pg-promise')();

const dbConfig = {
    host: 'localhost',
    port: 5432,
    database: 'employee_attendance',
    user: 'postgres',
    password: process.env.POSTGRES_PASSWORD
};
const db = pgp(dbConfig);
const saltRounds = 10;

const router = express.Router();

// Test route
router.get('/api/test', (req, res) => {
    res.send('Server is working!');
});

// New user creation
router.post('/api/signup', async (req, res, next) => {
    const { firstName, lastName, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    try {
        const newUser = await db.one('INSERT INTO employees(first_name, last_name, email, password) VALUES($1, $2, $3, $4) RETURNING *', [firstName, lastName, email, hashedPassword]);
        res.status(200).json({ message: 'User registered', newUser });
    } catch (error) {
        if (error.code === '23505') { // Unique violation in PostgreSQL
            return res.status(400).json({ message: 'An account with this email already exists' });
        }
        console.error(error);
        next(error);  
    }
});

// Login verification and JWT authentication and authorization
router.post('/api/login', async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const user = await db.oneOrNone('SELECT * FROM employees WHERE email = $1', [email]);
        
        if (user && await bcrypt.compare(password, user.password)) {
            // Create JWT token from unique user id
            const payload = {
                userId: user.id // Use 'id' instead of '_id'
            };
            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
            
            // Send token as a cookie to the client
            const isSecure = process.env.NODE_ENV === 'production';
            res.cookie('token', token, { httpOnly: true, secure: isSecure, maxAge: 3600000 });
            
            const { password: _, ...userData } = user;  // Exclude password from response
            res.status(200).json({ message: 'Login successful', user: userData });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        next(error);
    }
});

// Logout - NEED TO UPDATE CLIENT-SIDE HANDLING
router.post('/api/logout', (req, res) => {
    // Clear the JWT cookie
    res.clearCookie('token');
    res.status(200).json({ message: 'Logged out successfully' });
});

// Get user account data if logged in
router.get('/api/account', async (req, res, next) => {
    try {
        const user = await db.oneOrNone('SELECT * FROM employees WHERE id = $1', [req.user.userId]);
        const { password, ...userData } = user; 
        res.json({ user: userData });
    } catch (error) {
        console.log(error);
        next(error);
    }
});

router.post('/api/work_entries/clock_in', async (req, res, next) => {
    const { employee_id, clock_in_location } = req.body;
    console.log('received...');

    try {
        const clockInEntry = await db.one('INSERT INTO work_entries(employee_id, clock_in, clock_in_location) VALUES($1, NOW(), $2) RETURNING *', [employee_id, clock_in_location]);
        res.status(200).json({ message: 'Clocked in successfully', clockInEntry });
    } catch (error) {
        console.error(error);
        next(error);
    }
});

// Clock-out route
router.post('/api/work_entries/clock_out', async (req, res, next) => {
    const { entry_id, clock_out_location, tasks } = req.body;
    console.log('received...');

    try {
        const clockOutEntry = await db.one('UPDATE work_entries SET clock_out = NOW(), clock_out_location = $2, tasks = $3 WHERE entry_id = $1 RETURNING *', [entry_id, clock_out_location, tasks]);
        res.status(200).json({ message: 'Clocked out successfully', clockOutEntry });
    } catch (error) {
        console.error(error);
        next(error);
    }
});

// Export the router
module.exports = router;

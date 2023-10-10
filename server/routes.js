require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pgp = require('pg-promise')();
const crypto = require('crypto');

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

// Login verification and JWT authentication and authorization
router.post('/api/login', async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const user = await db.oneOrNone('SELECT * FROM users WHERE email = $1', [email]);
        
        if (user && await bcrypt.compare(password, user.password)) {
            
            // Generate JWT token from unique user id
            const payload = {
                userId: user.user_id // Use 'id' instead of '_id'
            };
            
            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

            // Generate refresh token and insert into db w/ corresponding userid
            const refreshToken = crypto.randomBytes(64).toString('hex');
            await db.none(
                'INSERT INTO refresh_tokens (token, user_id) VALUES ($1, $2)',
                [refreshToken, user.user_id]
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
            
            const { password: _, ...userData } = user;  // Exclude password from response
            res.status(200).json({ message: 'Login successful', user: userData });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        next(error);
    }
});

// New user creation
router.post('/api/signup', async (req, res, next) => {
    const { firstName, lastName, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    try {
        const newUser = await db.one('INSERT INTO users(first_name, last_name, email, password) VALUES($1, $2, $3, $4) RETURNING *', [firstName, lastName, email, hashedPassword]);
        res.status(200).json({ message: 'User registered', newUser });
    } catch (error) {
        if (error.code === '23505') { // Unique violation in PostgreSQL
            return res.status(400).json({ message: 'An account with this email already exists' });
        }
        console.error(error);
        next(error);  
    }
});

// Logout
router.post('/api/logout', async (req, res) => {
    // Clear JWT and refresh token cookies
    res.clearCookie('token');
    res.clearCookie('refreshToken');

    const { refreshToken } = req.cookies;
    if (refreshToken) {
        await db.none('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
    }

    res.status(200).json({ message: 'Logged out successfully' });
});

// Get user account data if logged in
router.get('/api/account', async (req, res, next) => {
    const userId = req.user ? req.user.userId : null;

    try {
        // Check if user is authenticated
        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        // Get user data
        const userData = await db.oneOrNone(
            'SELECT user_id, first_name, last_name, email FROM users WHERE user_id = $1',
            [userId]
        );
        
        // Check if user was found in the database
        if (!userData) {
            return res.status(404).json({ error: 'User not found' });
        };

        // Get last clocked in data
        const lastClockIn = await db.oneOrNone(
            `SELECT * FROM work_entries WHERE user_id = $1 ORDER BY entry_id DESC LIMIT 1`,
            [userId]
        );

        // Determine if user currently clocked in
        const currentlyClockedIn = lastClockIn && !lastClockIn.clock_out_time;

        res.json({ user: userData, isClockedIn: currentlyClockedIn });
    } catch (error) {
        console.log(error);
        if (error.message.includes('Not authenticated') || error.message.includes('User not found')) {
            res.status(401).json({ error: error.message });
        } else {
            next(error);
        }
    }
});

// Clock in
router.post('/api/clock_in', async (req, res, next) => {
    const { userId, currentTime, location } = req.body;
    const locationPoint = `(${location.latitude}, ${location.longitude})`;

    try {
        // Check for an incomplete entry for the user
        const incompleteEntry = await db.oneOrNone(
            'SELECT * FROM work_entries WHERE user_id = $1 AND clock_out_time IS NULL',
            [userId]
        );

        if (incompleteEntry) {
            // If incomplete entry found, prevent clock-in
            return res.status(400).json({ message: 'You need to clock out before clocking in again.' });
        }

        const clockInEntry = await db.one(
            'INSERT INTO work_entries(user_id, clock_in_time, clock_in_location) VALUES($1, $2, $3) RETURNING *',
            [userId, currentTime, locationPoint]
        );
        res.status(200).json({ message: 'Clocked in successfully', clockInEntry, isClockedIn: true });
    } catch (error) {
        console.error(error);
        next(error);
    }
});

// Clock-out
router.post('/api/clock_out', async (req, res, next) => {
    const { userId, currentTime, location } = req.body;
    const locationPoint = `(${location.latitude}, ${location.longitude})`;
    const tasks = "Example tasks";

    try {
        const clockOutEntry = await db.oneOrNone(
            `UPDATE work_entries 
             SET clock_out_time = $2, clock_out_location = $3, tasks = $4
             WHERE user_id = $1 AND clock_out_time IS NULL
             RETURNING *`,
            [userId, currentTime, locationPoint, tasks]
        );

        if (!clockOutEntry) {
            return res.status(400).json({ message: 'No active session to clock out from.' });
        }

        res.status(200).json({ message: 'Clocked out successfully', clockOutEntry, isClockedIn: false });
    } catch (error) {
        console.error(error);
        next(error);
    }
});

// Refresh token
router.post('/api/token/refresh', async (req, res, next) => {
    const { refreshToken } = req.cookies;
    
    const storedToken = await db.oneOrNone('SELECT user_id FROM refresh_tokens WHERE token = $1', [refreshToken]);

    if (storedToken) {
        const payload = {
            userId: storedToken.user_id
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

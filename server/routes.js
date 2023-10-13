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
router.post('/api/users/login', async (req, res, next) => {
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
router.post('/api/users/signup', async (req, res, next) => {
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
router.post('/api/users/logout', async (req, res) => {
    // Clear JWT and refresh token cookies
    res.clearCookie('token');
    res.clearCookie('refreshToken');

    const { refreshToken } = req.cookies;
    if (refreshToken) {
        await db.none('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
    }

    res.status(200).json({ message: 'Logged out successfully' });
});

// Get user user data if logged in
router.get('/api/users/user', async (req, res, next) => {
    const userId = req.user ? req.user.userId : null;

    try {

        // Get user data
        const userData = await db.oneOrNone(
            'SELECT * FROM users WHERE user_id = $1',
            [userId]
        );
        
        // Check if user was found in the database
        if (!userData) {
            return res.status(404).json({ error: 'User not found' });
        };

        const {password, ...userWithoutPassword } = userData;
        res.json({ user: userWithoutPassword });
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
router.post('/api/work_entries/clock_in', async (req, res, next) => {
    const { userId, currentTime, location, coordinates } = req.body;
    const coordinatesPoint = `(${coordinates.latitude}, ${coordinates.longitude})`;

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

        const clockEntry = await db.one(
            'INSERT INTO work_entries(user_id, clock_in_time, clock_in_location, clock_in_coordinates) VALUES($1, $2, $3, $4) RETURNING *',
            [userId, currentTime, location, coordinatesPoint]
        );

        const userData = await db.oneOrNone(
            `SELECT * FROM users WHERE user_id = $1`
        , [userId]);

        const {password, ...user} = userData

        res.status(200).json({ message: 'Clocked in', clockEntry, user });
    } catch (error) {
        console.error(error);
        next(error);
    }
});

// Clock-out
router.post('/api/work_entries/clock_out', async (req, res, next) => {
    const { userId, currentTime, location, coordinates, tasks } = req.body;
    const coordinatesPoint = `(${coordinates.latitude}, ${coordinates.longitude})`;

    try {
        const clockEntry = await db.oneOrNone(
            `UPDATE work_entries 
             SET clock_out_time = $2, clock_out_location = $3, clock_out_coordinates = $4, tasks = $5
             WHERE user_id = $1 AND clock_out_time IS NULL
             RETURNING *`,
            [userId, currentTime, location, coordinatesPoint, tasks]
        );

        const userData = await db.oneOrNone(
            `SELECT * FROM users WHERE user_id = $1`, 
            [userId]
        );

        if (!clockEntry) {
            return res.status(400).json({ message: 'No active session to clock out from.' });
        }

        // Remove password
        const { password, ...user } = userData;

        res.status(200).json({ message: 'Clocked out', clockEntry, user });
    } catch (error) {
        console.error(error);
        next(error);
    }
});

// Get user's work entries
router.get('/api/work_entries/user', async (req, res, next) => {
    const userId = req.user.userId;

    try {
        const entries = await db.any(
            'SELECT * FROM work_entries WHERE user_id = $1 ORDER BY entry_id DESC', 
            [userId]
        );

        res.json(entries);
    } catch (error) {
        console.error('Error fetching work entries:', error);
        res.status(500).json({ error: 'Failed to fetch work entries' });
    }
});

// ADMIN ROUTES

// Get all work_entries
router.get('/api/admin/work_entries', async (req, res, next) => {
    try {
        const entries = await db.any('SELECT * FROM work_entries ORDER BY entry_id DESC');
        res.json(entries);
    } catch (error) {
        console.error('Error fetching all work entries:', error);
        res.status(500).json({ error: 'Failed to fetch work entries' });
    }
});

// Create new work entry
router.post('/api/admin/work_entries', async (req, res, next) => {
    const { user_id, clock_in_time, clock_out_time, tasks, clock_in_coordinates, clock_out_coordinates, hours_worked } = req.body;

    try {
        await db.none(
            'INSERT INTO work_entries (user_id, clock_in_time, clock_out_time, tasks, clock_in_coordinates, clock_out_coordinates, hours_worked) VALUES ($1, $2, $3, $4, $5, $6, $7)', 
            [user_id, clock_in_time, clock_out_time, tasks, clock_in_coordinates, clock_out_coordinates, hours_worked]
        );

        res.json({ message: 'Work entry created successfully.' });
    } catch (error) {
        console.error('Error inserting work entry:', error);
        res.status(500).json({ error: 'Failed to create work entry' });
    }
});

// Update work entry
router.put('/api/work_entries/:entry_id', async (req, res, next) => {
    const entryId = req.params.entry_id;
    const { user_id, clock_in_time, clock_out_time, tasks, clock_in_coordinates, clock_out_coordinates, hours_worked } = req.body;

    try {
        await db.none(
            'UPDATE work_entries SET user_id=$1, clock_in_time=$2, clock_out_time=$3, tasks=$4, clock_in_coordinates=$5, clock_out_coordinates=$6, hours_worked=$7 WHERE entry_id=$8',
            [user_id, clock_in_time, clock_out_time, tasks, clock_in_coordinates, clock_out_coordinates, hours_worked, entryId]
        );

        res.json({ message: 'Work entry updated successfully.' });
    } catch (error) {
        console.error('Error updating work entry:', error);
        res.status(500).json({ error: 'Failed to update work entry' });
    }
});


// Delete a work entry
router.delete('/api/admin/work_entries/:entry_id', async (req, res, next) => {
    const entryId = req.params.entry_id;

    try {
        await db.none('DELETE FROM work_entries WHERE entry_id=$1', [entryId]);
        res.json({ message: 'Work entry deleted successfully.' });
    } catch (error) {
        console.error('Error deleting work entry:', error);
        res.status(500).json({ error: 'Failed to delete work entry' });
    }
});


// Refresh token
router.post('/api/refresh_tokens/refresh', async (req, res, next) => {
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

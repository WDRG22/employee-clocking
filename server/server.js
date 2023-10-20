require('dotenv').config();
const path = require('path');
const express = require('express');
const https = require('https');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const app = express();
const routes = require('./routes.js');

// Log incoming requests
app.use((req, res, next) => {
    console.log(`Received request: ${req.method} ${req.path}`);
    next();
});

// Process JSON data
app.use(cookieParser());
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, '../client/build')));

const sendErrorResponse = (res, message, statusCode = 401) => {
    console.error(message);
    return res.status(statusCode).json({ message });
};

// JWT token for authentication
const jwt = require('jsonwebtoken');

const jwtMiddleware = (req, res, next) => {
    const token = req.cookies.token;
    const fullPath = req.baseUrl + req.path;
    const excludedPaths = [
        '/api/employees/login',
        '/api/employees/signup', 
        '/api/refresh_tokens/refresh'
    ];

    console.log(`Incoming request to: ${fullPath}`);

    if (!excludedPaths.includes(fullPath)) {
        if (!token) {
            return sendErrorResponse(res, `No token provided for: ${fullPath}`);
        }

        try {
            if (!process.env.JWT_SECRET) {
                throw new Error("JWT_SECRET environment variable is required");
            }            
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.employee = decoded;
            next();
        } catch (err) {
            console.error("JWT error:", err);
            return sendErrorResponse(res, 'Invalid or expired token');
        }
    } else {
        console.log(`Bypassing JWT middleware for: ${fullPath}`);
        next();
    }
};

// Use the JWT middleware for API server routes
app.use('/api', jwtMiddleware, routes);

// Serve SPA for client-side routes (fallback for any routes not caught by express)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

// Error-handling middleware
app.use((error, req, res, next) => {
    if (error.name === "UnauthorizedError") {
        return res.status(401).json({ message: 'Token verification failed', error: error.message });
    }
    
    if (res.headersSent) {
        return next(error);
    }
    console.error("Unhandled error:", error.message, error.stack);
    res.status(500).json({ message: 'Internal server error', error: error.message });
});

// Https
const httpsOptions = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
};

const server = https.createServer(httpsOptions, app).listen(8080, () => {
    console.log(`Listening on this port: ${server.address().port}`);
});

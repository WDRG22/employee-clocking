require('dotenv').config();
const path = require('path');
const express = require('express');
const https = require('https');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const app = express();
const routes = require('./routes.js');

// Process JSON data
app.use(cookieParser());
app.use(express.json());

// Manual jwt verification. Decodes token to 'req.user' for use in routes
const jwt = require('jsonwebtoken');
app.use((req, res, next) => {
    const token = req.cookies.token;

    // List of paths that don't require authentication
    const excludedPaths = ['/api/users/login', '/api/users/signup', '/api/refresh_tokens/refresh'];

    // If the request path is not in the excluded list
    if (!excludedPaths.includes(req.path)) {
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                req.user = decoded;
                next();
            } catch (err) {
                // Invalid token
                return res.status(401).json({ message: 'Invalid or expired token' });
            }
        } else {
            // No token provided
            return res.status(401).json({ message: 'Authentication token is required' });
        }
    } else {
        // For excluded paths, continue without checking for a token
        next();
    }
});

  
// JWT middleware fails to verify token for some reason
// app.use(expressjwt({
//     secret: process.env.JWT_SECRET,
//     algorithms: ['HS256'],
//     getToken: req => req.cookies ? req.cookies.token : null
// }).unless({
// path: ['/api/login', '/api/signup', /^\/(?!api\/).*/]
// }));

// Hit defined routes
app.use(routes);

// Serve static files
app.use(express.static(path.join(__dirname, '../client/build')));

// Serve SPA for client-side routes
app.get(['/login', '/signup'], (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

// Catch-all for 404
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', '404.html'));
});

// Error-handling middleware
app.use((error, req, res, next) => {
    if (error.name === "UnauthorizedError") {  // Check if it's a JWT error
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

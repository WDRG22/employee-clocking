require('dotenv').config();
const path = require('path');
const express = require('express');
const https = require('https');
const fs = require('fs');
const { expressjwt } = require('express-jwt');
const cookieParser = require('cookie-parser');
const app = express();
const routes = require('./routes.js');


// Process JSON data
app.use(cookieParser());
app.use(express.json());

// Manual jwt verification
const jwt = require('jsonwebtoken');
app.use((req, res, next) => {
    const token = req.cookies.token;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            next();
        } catch (err) {
            // handle the error (invalid token, etc.)
            next(err);
        }
    } else {
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

// If no routes hit, serve static file
app.use(express.static(path.join(__dirname, '../client/build')));

// If no static file, serve index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
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

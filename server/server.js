require('dotenv').config();
const path = require('path');
const express = require('express');
const https = require('https');
const fs = require('fs');
const { expressjwt } = require('express-jwt');
const cookieParser = require('cookie-parser');
const app = express();
const routes = require('./routes.js');

// Middleware
app.use(express.json());
app.use(routes);

// Serve front-end build from server w/ express.static
app.use(express.static(path.join(__dirname, '../client/build')));
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });

// JWT
app.use(cookieParser());
app.use((req, res, next) => {
    console.log('Cookies:', req.cookies);
    next();
});
app.use(expressjwt({
    secret: process.env.JWT_SECRET,
    algorithms: ['HS256'],
    getToken: req => req.cookies ? req.cookies.token : null
}).unless({
    path: ['/api/login', '/api/signup', /^\/static\/.*/]
}));

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

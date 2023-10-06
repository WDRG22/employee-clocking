require('dotenv').config();
const express = require('express');
const cors = require('cors');
const https = require('https');
const fs = require('fs');
const { expressjwt } = require('express-jwt');
const cookieParser = require('cookie-parser');
const app = express();
const routes = require('./routes.js');

// Middleware
app.use(cookieParser());
app.use(cors({
    origin: ["https://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));
app.use(express.json());
app.use(expressjwt({
    secret: process.env.JWT_SECRET,
    algorithms: ['HS256'],
    getToken: req => req.cookies ? req.cookies.token : null
}).unless({
    path: ['/api/employees/login', '/api/employees/signup', '/api/employees/test']
}));

// Use imported routes
app.use(routes);

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

const httpsOptions = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
};

const server = https.createServer(httpsOptions, app).listen(8080, () => {
    console.log(`Listening on this port: ${server.address().port}`);
});

require('dotenv').config();
const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const newRouter = require('./router.js');
const cors = require('cors');
const bcrypt = require('bcrypt');
const https = require('https');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const { expressjwt } = require('express-jwt');
const cookieParser = require('cookie-parser');
const app = express();
const saltRounds = 10;
let employeesCollection, attendanceCollection;

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

// Routes to be initialized after DB connection
const initRoutes = () => {
    const employeesRouter = newRouter(employeesCollection);
    const attendanceRouter = newRouter(attendanceCollection);

    // Test route
    app.get('/api/test', (req, res) => {
        res.send('Server is working!');
    });

    // New user creation
    app.post('/api/employees/signup', async (req, res, next) => {
        const { firstName, lastName, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        try {
            const newUser = await employeesCollection.insertOne({ firstName, lastName, email, password: hashedPassword });
            res.status(200).json({ message: 'User registered', newUser });
        } catch (error) {
            // Check for duplicate email error from MongoDB
            if (error.code === 11000) {
                return res.status(400).json({ message: 'An account with this email already exists' });
            }
            console.error(error);
            next(error);  // Pass the error to the next middleware
        }
    });

    // Login verification and JWT authentication and authorization
    app.post('/api/employees/login', async (req, res, next) => {
        const { email, password } = req.body;
        try {
            const user = await employeesCollection.findOne({ email });
    
            if (user && await bcrypt.compare(password, user.password)) {
                // Create JWT token from unique user id
                const payload = {
                    userId: user._id
                };
                const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    
                // Send token as a cookie to the client
                const isSecure = process.env.NODE_ENV === 'production';
                res.cookie('token', token, { httpOnly: true, secure: isSecure, sameSite: 'none', maxAge: 3600000 });
    
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
    app.post('/api/employees/logout', (req, res) => {
        // Clear the JWT cookie
        res.clearCookie('token');
        res.status(200).json({ message: 'Logged out successfully' });
    });

    // Get user account data if logged in
    app.get('/api/account', async (req, res, next) => {
        try {
            const user = await employeesCollection.findOne({ _id: req.user.userId });
            const { password, ...userData} = user; // Remove password from payload
            res.json({ user: userData });
        } catch (error) {
            console.log(error);
            next(error);
        }
    });

    app.use('/api/employees', employeesRouter);
    app.use('/api/attendance', attendanceRouter);
}

// Connect to database
const maxRetries = 5;
let retryCount = 0;
const connectToMongo = () => {    
    MongoClient.connect('mongodb://localhost:27017', { connectTimeoutMS: 5000, socketTimeoutMS: 5000 })
        .then(client => {
            console.log("Successfully connected to database")
            const db = client.db('clocking_system');
            employeesCollection = db.collection('employees');
            attendanceCollection = db.collection('attendance');
            initRoutes();            
        })
        .catch(error => {
            console.error(`Failed to connect to MongoDB (Attempt ${retryCount + 1}):`, error.message);
            retryCount++;

            if (retryCount < maxRetries) {
                setTimeout(connectToMongo, 5000);  // Retry after 5 seconds
            } else {
                console.error("Max retries reached. Exiting...");
                process.exit(1);
            }
        });
}

// Initial MongoDB connection attempt
connectToMongo();

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

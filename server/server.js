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
const app = express();
const saltRounds = 10;
let employeesCollection, attendanceCollection;

// Middleware
app.use(cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));
app.use(expressjwt({
    secret: process.env.JWT_SECRET,
    algorithms: ['HS256'],
    getToken: req => req.cookies.token
}).unless({
    path: ['/login', '/signup']
}));
app.use(express.json());

// Connect to database
const maxRetries = 5;
let retryCount = 0;
const connectToMongo = () => {    
    MongoClient.connect('mongodb://localhost:27017', { connectTimeoutMS: 5000, socketTimeoutMS: 5000 })
        .then(client => {
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

const initRoutes = () => {
    const employeesRouter = newRouter(employeesCollection);
    const attendanceRouter = newRouter(attendanceCollection);

    // New user creation
    app.post('/api/employees/signup', async (req, res, next) => {
        const { email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        try {
            const newUser = await employeesCollection.insertOne({ email, password: hashedPassword });
            res.status(200).json({ message: 'User registered', newUser });
        } catch (err) {
            // Check for duplicate email error from MongoDB
            if (err.code === 11000) {
                return res.status(400).json({ message: 'Email already registered' });
            }
            console.error(err);
            next(err);  // Pass the error to the next middleware
        }
    });


    // Login verification and JWT authentication and authorization
    app.post('/api/employees/login', async (req, res, next) => {
        const { email, password } = req.body;
        try {
            const user = await employeesCollection.findOne({ email });

            // User found                
            if (user && await bcrypt.compare(password, user.password)) {

                // Create JWT token from unique user id
                const payload = {
                    userId: user._id
                };
                const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

                // Send token as a cookie to the client
                // httpOnly prevents client access to prevent XSS
                // sameSite causes cookie to be sent back only if from same origin as request 
                // to mitigate CSRF attacks
                res.cookie('token', token, { httpOnly: true, sameSite: 'strict' });
                res.status(200).json({ message: 'Login successful', user });
                
            // User not found
            } else {
                res.status(401).json({ message: 'Invalid email or password' });
            }
        // Server error
        } catch (err) {
            console.error(err); // logs err to end user
            next(err);  // Pass the error to the next middleware
        }
    });

    // Logout - NEED TO UPDATE CLIENT-SIDE HANDLING
    app.post('/api/employees/logout', (req, res) => {
        // Clear the JWT cookie
        res.clearCookie('token');
        res.status(200).json({ message: 'Logged out successfully' });
    });

    app.use('/api/employees', employeesRouter);
    app.use('/api/attendance', attendanceRouter);
}

// Initial MongoDB connection attempt
connectToMongo();

// Error handling middleware
app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }
    res.status(500).json({ message: 'Internal server error', error: err.message });
});

const httpsOptions = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
};

const server = https.createServer(httpsOptions, app).listen(8080, () => {
    console.log(`Listening on this port: ${server.address().port}`);
});

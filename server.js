require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const customersRouter = require('./routes/customers');
const addCustomerRouter = require('./routes/addCustomer'); // Importing the addCustomer router correctly
const payfastRouter = require('./routes/payfast');
const cron = require('node-cron');
const Customer = require('./models/customer');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Session middleware with 5-minute timeout
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false, httpOnly: true, maxAge: 5 * 60 * 1000 } // 5 minutes in milliseconds
    })
);

// Middleware to track user activity and refresh session expiration time
app.use((req, res, next) => {
    if (req.session.isAuthenticated) {
        req.session._garbage = Date();
        req.session.touch(); // Refresh session to prevent immediate expiration
    }
    next();
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

// Middleware to check authentication
function isAuthenticated(req, res, next) {
    if (req.session.isAuthenticated) {
        return next();
    }
    res.redirect('/login');
}

// Allow /customers/add route without authentication
app.use('/customers/add', addCustomerRouter); // Use the correct router for the add customer route

// Routes that require authentication
app.use('/customers', isAuthenticated, customersRouter);
app.use('/api/payfast', payfastRouter);

// Home Route
app.get('/', (req, res) => {
    res.redirect('/customers');
});

// Login Route
app.get('/login', (req, res) => {
    res.render('login'); // Render a simple login form (login.ejs)
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const isMatch = await bcrypt.compare(password, process.env.ADMIN_PASSWORD);
    if (username === process.env.ADMIN_USERNAME && isMatch) {
        req.session.isAuthenticated = true;
        return res.redirect('/customers');
    } else {
        res.status(401).send('Invalid credentials');
    }
});

// Logout Route
app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error logging out:', err);
        }
        res.redirect('/login');
    });
});

// Email sending function
async function sendEmail(to, subject, text) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text
    };

    return transporter.sendMail(mailOptions);
}

// Schedule daily checks for expiring subscriptions
cron.schedule('0 9 * * *', async () => {
    const currentDate = new Date();
    const reminderDate = new Date();
    reminderDate.setDate(currentDate.getDate() + 7);

    try {
        const expiringCustomers = await Customer.find({
            expiryDate: { $lte: reminderDate, $gt: currentDate },
            paymentStatus: 'unpaid'
        });

        expiringCustomers.forEach(async (customer) => {
            await sendEmail(customer.email, 'Subscription Renewal Reminder', `
                Hi ${customer.fullName},

                Your subscription for ${customer.package} is about to expire on ${customer.expiryDate.toDateString()}. Please ensure you have enough funds ready to renew your subscription.

                Thank you!
            `);
        });
    } catch (err) {
        console.error('Error fetching expiring customers:', err);
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

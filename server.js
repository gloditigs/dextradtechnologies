// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const cron = require('node-cron'); // For scheduling tasks
const nodemailer = require('nodemailer'); // For sending emails
const customersRouter = require('./routes/customers');
const Customer = require('./models/Customer'); // Import Customer model

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the public folder

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Serve index.html as the landing page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html')); // Serve index.html on the root route
});

// Routes
app.use('/customers', customersRouter);

// Configure Nodemailer for sending emails
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Scheduled Job for Invoicing and Status Update
cron.schedule('0 9 * * *', async () => {  // Runs every day at 9:00 AM server time
    const today = new Date();
    const reminderDate = new Date(today);
    reminderDate.setDate(today.getDate() + 7);

    try {
        // Find customers whose subscriptions expire in 7 days and are marked as 'paid'
        const expiringCustomers = await Customer.find({
            expiryDate: { $lte: reminderDate, $gt: today },
            paymentStatus: 'paid'
        });

        // Send reminder email to each expiring customer
        expiringCustomers.forEach(async (customer) => {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: customer.email,
                subject: 'Subscription Renewal Reminder',
                text: `
                    Dear ${customer.fullName},

                    Your subscription package "${customer.package}" is due to expire on ${new Date(customer.expiryDate).toLocaleDateString()}.

                    Please ensure to renew your package be it expires to continue enjoying our services. 
                    
                    If you pay for your subscription via EFT, Kindly Whatsapp your proof of payment to 074 877 4314

                    Regards,
                    Dextrad Technologies Team
                `
            };

            await transporter.sendMail(mailOptions);
            console.log(`Reminder email sent to ${customer.email}`);
        });

        // Update customers whose subscriptions expire today to 'unpaid' status
        const expiredCustomers = await Customer.find({
            expiryDate: { $lte: today },
            paymentStatus: 'paid'
        });

        expiredCustomers.forEach(async (customer) => {
            customer.paymentStatus = 'unpaid';
            await customer.save();
            console.log(`Subscription expired and marked unpaid for customer: ${customer.email}`);
        });
    } catch (err) {
        console.error('Error processing expiration checks:', err);
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

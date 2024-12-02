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

// Scheduled Job for Expiry Date Renewal and Status Update
cron.schedule('0 0 * * *', async () => {  // Runs every day at midnight
    try {
        const today = new Date();

        // Find all customers whose expiry date has passed
        const expiringCustomers = await Customer.find({
            expiryDate: { $lte: today }
        });

        expiringCustomers.forEach(async (customer) => {
            // Mark users as unpaid if expiry date has passed
            if (customer.expiryDate <= today) {
                customer.paymentStatus = 'unpaid';
                customer.isActive = false;
                console.log(`Marked ${customer.email} as unpaid and deactivated.`);
            }

            // Renew expiry date if user is active
            if (customer.isActive) {
                let newExpiryDate = new Date(customer.expiryDate);

                switch (customer.package) {
                    case 'mfc-premium-780':
                    case 'wp-user-1-770':
                    case 'wp-user-2-1300':
                    case 'wp-user-4-2200':
                        newExpiryDate.setFullYear(newExpiryDate.getFullYear() + 1); // Add 12 months
                        break;

                    case 'mfc-standard-420':
                    case 'wp-premium-390':
                        newExpiryDate.setMonth(newExpiryDate.getMonth() + 6); // Add 6 months
                        break;

                    case 'wp-standard-195':
                        newExpiryDate.setMonth(newExpiryDate.getMonth() + 3); // Add 3 months
                        break;

                    case 'mfc-basic-74':
                    case 'mfc-2-accounts':
                    case 'mfc-3-accounts':
                    case 'mfc-4-accounts':
                    case 'wp-basic-74':
                    case 'wp-devices-1-74':
                    case 'wp-devices-2-140':
                    case 'wp-devices-3-210':
                    case 'wp-devices-4-270':
                        newExpiryDate.setMonth(newExpiryDate.getMonth() + 1); // Add 1 month
                        break;

                    default:
                        console.error(`Unknown package: ${customer.package}`);
                        return;
                }

                customer.expiryDate = newExpiryDate;
                console.log(`Renewed expiry date for ${customer.email} to ${newExpiryDate}`);
            }

            await customer.save();
        });
    } catch (err) {
        console.error('Error during expiry date handling:', err);
    }
});

// Scheduled Job for Sending Expiry Reminders
cron.schedule('0 9 * * *', async () => {  // Runs every day at 9:00 AM server time
    const today = new Date();
    const reminderDate = new Date(today);
    reminderDate.setDate(today.getDate() + 7);

    try {
        // Find customers whose subscriptions expire in 7 days
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

                    Please ensure to renew your package before it expires to continue enjoying our services. 

                    If you pay for your subscription via EFT, kindly Whatsapp your proof of payment to 074 877 4314.

                    Regards,
                    Dextrad Technologies Team
                `
            };

            await transporter.sendMail(mailOptions);
            console.log(`Reminder email sent to ${customer.email}`);
        });
    } catch (err) {
        console.error('Error sending reminder emails:', err);
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// routes/addCustomer.js
const express = require('express');
const router = express.Router();
const Customer = require('../models/customer');

// Route to add a new customer (no authentication required)
router.post('/', async (req, res) => {
    try {
        // Destructure the request body
        const { fullName, email, whatsappNumber, uids, accounts, package } = req.body;

        // Calculate the expiry date based on the package duration
        let expiryDate = new Date();
        switch (package) {
            case 'mfc-premium-780':
                expiryDate.setFullYear(expiryDate.getFullYear() + 1); // 12 months duration
                break;
            // Add more cases for other packages
            default:
                expiryDate.setMonth(expiryDate.getMonth() + 1); // Default to 1 month if unknown package
        }

        // Create a new customer instance with the data
        const newCustomer = new Customer({
            fullName,
            email,
            whatsappNumber,
            uids,
            accounts,
            package,
            expiryDate,
            paymentStatus: 'unpaid',
            source: 'website'
        });

        // Save the customer to the database
        await newCustomer.save();

        // Respond with the PayFast link to redirect the user
        let payfastLink = ''; // Set your PayFast link based on package
        res.status(201).json({ message: 'Customer added successfully', payfastLink });
    } catch (err) {
        console.error('Error saving customer:', err);
        res.status(500).json({ message: 'Error saving customer' });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const Customer = require('../models/customer');

// Route to add a new customer
router.post('/add', async (req, res) => {
    try {
        // Destructure the request body
        const { fullName, email, whatsappNumber, uids, accounts, package, source } = req.body;

        // Validate required fields
        if (!fullName || !email || !whatsappNumber || !package) {
            return res.status(400).json({ message: 'Missing required fields. Make sure all fields are filled correctly.' });
        }

        // Calculate the expiry date based on the package duration
        let expiryDate = new Date();
        switch (package) {
            case 'mfc-premium-780':
                expiryDate.setFullYear(expiryDate.getFullYear() + 1); // 12 months duration
                break;
            case 'mfc-standard-420':
                expiryDate.setMonth(expiryDate.getMonth() + 6); // 6 months duration
                break;
            case 'mfc-basic-74':
                expiryDate.setMonth(expiryDate.getMonth() + 1); // 1 month duration
                break;
            case 'wp-premium-390':
                expiryDate.setMonth(expiryDate.getMonth() + 6); // 6 months duration
                break;
            case 'wp-standard-195':
                expiryDate.setMonth(expiryDate.getMonth() + 3); // 3 months duration
                break;
            case 'wp-basic-74':
                expiryDate.setMonth(expiryDate.getMonth() + 1); // 1 month duration
                break;
            default:
                return res.status(400).json({ message: 'Invalid package selected' });
        }

        // Create a new customer instance with the data
        const newCustomer = new Customer({
            fullName,
            email,
            whatsappNumber,
            uids: uids || [], // Expecting an array from the frontend, default to an empty array
            accounts: accounts || [], // Expecting an array from the frontend, default to an empty array
            package,
            source: source || 'website', // Default to 'website' if not provided
            expiryDate,
            paymentStatus: source === 'manual' ? 'paid' : 'unpaid' // Set as 'paid' if added manually
        });

        // Save the customer to the database
        await newCustomer.save();

        // Determine the PayFast link based on the package
        let payfastLink = '';
        switch (package) {
            case 'mfc-premium-780':
                payfastLink = 'https://payment.payfast.io/eng/process?cmd=_paynow&receiver=21701622&item_name=My+Family+Cinema&amount=780';
                break;
            case 'mfc-standard-420':
                payfastLink = 'https://payment.payfast.io/eng/process?cmd=_paynow&receiver=21701622&item_name=My+Family+Cinema&amount=420';
                break;
            case 'mfc-basic-74':
                payfastLink = 'https://payment.payfast.io/eng/process?cmd=_paynow&receiver=21701622&item_name=My+Family+Cinema&amount=74';
                break;
            case 'wp-premium-390':
                payfastLink = 'https://payment.payfast.io/eng/process?cmd=_paynow&receiver=21701622&item_name=Watchlist+Pro+Premium&amount=390';
                break;
            case 'wp-standard-195':
                payfastLink = 'https://payment.payfast.io/eng/process?cmd=_paynow&receiver=21701622&item_name=Watchlist+Pro+Standard&amount=195';
                break;
            case 'wp-basic-74':
                payfastLink = 'https://payment.payfast.io/eng/process?cmd=_paynow&receiver=21701622&item_name=Watchlist+Pro+Basic&amount=74';
                break;
            default:
                payfastLink = ''; // Default case if no matching package
        }

        // Respond with the PayFast link to redirect the user
        if (source !== 'manual') {
            return res.status(201).json({ message: 'Customer added successfully', payfastLink });
        } else {
            return res.status(201).json({ message: 'Customer added manually' });
        }
    } catch (err) {
        console.error('Error saving customer:', err);
        return res.status(500).json({ message: 'Error saving customer', error: err.message });
    }
});

module.exports = router;

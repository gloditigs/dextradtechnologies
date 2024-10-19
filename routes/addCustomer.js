// routes/addCustomer.js
const express = require('express');
const router = express.Router();
const Customer = require('../models/customer');

// Route to add a new customer (no authentication required)
router.post('/', async (req, res) => {
    try {
        // Destructure the request body
        const { fullName, email, whatsappNumber, uids, accounts, package } = req.body;

        // Validate required fields
        if (!fullName || !email || !whatsappNumber || !package) {
            return res.status(400).json({ message: 'Missing required fields.' });
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

      // Helper function to determine PayFast link
function determinePayFastLink(package) {
    switch (package) {
        case 'mfc-premium-780':
            return 'https://payment.payfast.io/eng/process?cmd=_paynow&receiver=21701622&item_name=My+Family+Cinema+Premium&amount=780';
        case 'mfc-standard-420':
            return 'https://payment.payfast.io/eng/process?cmd=_paynow&receiver=21701622&item_name=My+Family+Cinema+Standard&amount=420';
        case 'mfc-basic-74':
            return 'https://payment.payfast.io/eng/process?cmd=_paynow&receiver=21701622&item_name=My+Family+Cinema+Basic&amount=74';
        case 'wp-premium-390':
            return 'https://payment.payfast.io/eng/process?cmd=_paynow&receiver=21701622&item_name=Watchlist+Pro+Premium&amount=390';
        case 'wp-standard-195':
            return 'https://payment.payfast.io/eng/process?cmd=_paynow&receiver=21701622&item_name=Watchlist+Pro+Standard&amount=195';
        case 'wp-basic-74':
            return 'https://payment.payfast.io/eng/process?cmd=_paynow&receiver=21701622&item_name=Watchlist+Pro+Basic&amount=74';
        default:
            return ''; // Return an empty string if no matching package
    }
}

        // Check if a valid PayFast link was generated
        if (payfastLink) {
            return res.status(201).json({ message: 'Customer added successfully', payfastLink });
        } else {
            console.error('No valid payment link found for the selected package.');
            return res.status(400).json({ message: 'No valid payment link found for the selected package.' });
        }
    } catch (err) {
        console.error('Error saving customer:', err);
        return res.status(500).json({ message: 'Error saving customer', error: err.message });
    }
});



module.exports = router;

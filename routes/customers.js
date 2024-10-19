const express = require('express');
const router = express.Router();
const Customer = require('../models/customer');

// Route to add a new customer
router.post('/add', async (req, res) => {
    try {
        // Destructure the request body
        const { fullName, email, whatsappNumber, uids, accounts, package, source } = req.body;

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
            case 'mfc-2-accounts':
                expiryDate.setMonth(expiryDate.getMonth() + 1); // 1 month duration
                break;
            case 'mfc-3-accounts':
                expiryDate.setMonth(expiryDate.getMonth() + 1); // 1 month duration
                break;
            case 'mfc-4-accounts':
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
            case 'wp-devices-1-74':
                expiryDate.setMonth(expiryDate.getMonth() + 1); // 1 month duration
                break;
            case 'wp-devices-2-140':
                expiryDate.setMonth(expiryDate.getMonth() + 1); // 1 month duration
                break;
            case 'wp-devices-3-210':
                expiryDate.setMonth(expiryDate.getMonth() + 1); // 1 month duration
                break;
            case 'wp-devices-4-270':
                expiryDate.setMonth(expiryDate.getMonth() + 1); // 1 month duration
                break;
            case 'wp-user-1-770':
                expiryDate.setFullYear(expiryDate.getFullYear() + 1); // 12 months duration
                break;
            case 'wp-user-2-1300':
                expiryDate.setFullYear(expiryDate.getFullYear() + 1); // 12 months duration
                break;
            case 'wp-user-4-2200':
                expiryDate.setFullYear(expiryDate.getFullYear() + 1); // 12 months duration
                break;
            default:
                console.warn('Unknown package type:', package);
        }

        // Create a new customer instance with the data
        const newCustomer = new Customer({
            fullName,
            email,
            whatsappNumber,
            uids, // Expecting an array from the frontend
            accounts, // Expecting an array from the frontend
            package,
            source: source || 'website', // Default to 'website' if not provided
            expiryDate,
            paymentStatus: source === 'manual' ? 'paid' : 'unpaid' // Set as 'paid' if added manually
        });

        // Save the customer to the database
        await newCustomer.save();

        // Determine the PayFast link based on the package
        const payfastLink = determinePayFastLink(package);

        // Respond with the PayFast link if saving is successful
        res.status(201).json({ message: 'Customer added successfully', payfastLink });
    } catch (err) {
        console.error('Error saving customer:', err);
        res.status(500).json({ message: 'Error saving customer' });
    }
});

// Helper function to determine PayFast link
function determinePayFastLink(package) {
    switch (package) {
        case 'mfc-premium-780':
            return 'https://payment.payfast.io/eng/process?cmd=_paynow&receiver=21701622&item_name=My+Family+Cinema&amount=780&subscription_type=1';
        case 'mfc-standard-420':
            return 'https://payment.payfast.io/eng/process?cmd=_paynow&receiver=21701622&item_name=My+Family+Cinema&amount=420&subscription_type=1';
        case 'wp-basic-74':
            return 'https://payment.payfast.io/eng/process?cmd=_paynow&receiver=21701622&item_name=Watchlist-Pro&amount=74&subscription_type=1';
        // Add other cases here...
        default:
            return ''; // Return an empty string if no matching package
    }
}

// ITN endpoint for PayFast
router.post('/payfast/itn', async (req, res) => {
    try {
        const itnData = req.body;

        // Verify the PayFast signature (mock function for demonstration)
        const isValidSignature = verifyPayFastSignature(itnData);
        if (!isValidSignature) {
            console.error('Invalid PayFast signature');
            return res.status(400).send('Invalid signature');
        }

        if (itnData.payment_status === 'COMPLETE') {
            const email = itnData.email_address;
            const customer = await Customer.findOne({ email });

            if (customer) {
                customer.paymentStatus = 'paid';
                await customer.save();
                console.log(`Payment successful for customer: ${customer.email}`);
            }
        }

        res.status(200).send('ITN Received');
    } catch (err) {
        console.error('Error processing ITN:', err);
        res.status(500).send('Error processing ITN');
    }
});

function verifyPayFastSignature(data) {
    // Implement PayFast signature verification
    return true; // Placeholder
}

// Route to get all customers with search and filter options
router.get('/', async (req, res) => {
    const { search, platform } = req.query;
    const query = {};

    // Search logic
    if (search) {
        query.$or = [
            { fullName: { $regex: search, $options: 'i' } }, // Case-insensitive search
            { email: { $regex: search, $options: 'i' } },
            { 'uids': { $regex: search, $options: 'i' } },
            { 'accounts': { $regex: search, $options: 'i' } }
        ];
    }

    // Platform filter logic
    if (platform) {
        if (platform === 'wp') {
            query.package = { $regex: '^wp-', $options: 'i' }; // Search for all Watchlist Pro packages
        } else if (platform === 'mfc') {
            query.package = { $regex: '^mfc-', $options: 'i' }; // Search for all My Family Cinema packages
        }
    }

    try {
        const customers = await Customer.find(query);
        res.render('customers', { customers, searchTerm: search, platformFilter: platform });
    } catch (err) {
        console.error('Error fetching customers:', err);
        res.status(500).send('Error fetching customers');
    }
});

// Route to delete a customer
router.post('/delete/:id', async (req, res) => {
    try {
        await Customer.findByIdAndDelete(req.params.id);
        res.redirect('/customers');
    } catch (err) {
        console.error('Error deleting customer:', err);
        res.status(500).send('Error deleting customer');
    }
});

module.exports = router;

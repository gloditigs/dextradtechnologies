// routes/customers.js
const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const crypto = require('crypto');

// Create PayFast signature for ITN verification
function verifyPayFastSignature(data, passphrase) {
    const sortedKeys = Object.keys(data).sort();
    const signatureString = sortedKeys
        .map((key) => `${key}=${encodeURIComponent(data[key])}`)
        .join('&') + '&passphrase=' + passphrase;
    return crypto.createHash('md5').update(signatureString).digest('hex');
}

// Route to add a new customer from the form
router.post('/add', async (req, res) => {
    try {
        // Destructure the request body
        const { whatsapp, user_email, first_name, last_name, uid, uid2, uid3, uid4, account, account2, account3, account4, subscription_plans } = req.body;

        // Check if all required fields are present
        if (!whatsapp || !user_email || !first_name || !last_name || !uid || !account || !subscription_plans) {
            return res.status(400).json({ message: 'Missing required fields.' });
        }

        // Collect UIDs and accounts
        const uids = [uid, uid2, uid3, uid4].filter(Boolean);
        const accounts = [account, account2, account3, account4].filter(Boolean);

        // Calculate expiry date based on the package
        let expiryDate = new Date();
        switch (subscription_plans) {
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
            default:
                return res.status(400).json({ message: 'Invalid package selected.' });
        }

        // Create new customer instance
        const newCustomer = new Customer({
            fullName: `${first_name} ${last_name}`,
            email: user_email,
            whatsappNumber: whatsapp,
            uids,
            accounts,
            package: subscription_plans,
            expiryDate,
            paymentStatus: 'unpaid',
            source: 'website'
        });

        // Save the new customer to the database
        await newCustomer.save();

        // Generate PayFast link based on the selected package
        const payfastLink = generatePayFastLink(subscription_plans);
        if (!payfastLink) {
            return res.status(400).json({ message: 'Unable to generate payment link.' });
        }

        // Respond with the PayFast link for redirection
        res.status(201).json({ message: 'Customer added successfully', payfastLink });
    } catch (error) {
        res.status(500).json({ message: 'Error adding customer.', error: error.message });
    }
});

// Function to generate PayFast link based on the package
function generatePayFastLink(package) {
    const basePayFastLink = 'https://payment.payfast.io/eng/process?cmd=_paynow&receiver=21701622&email_confirmation=1&confirmation_address=sales@dextradtechnologies.co.za';
    switch (package) {
        case 'mfc-premium-780':
            return `${basePayFastLink}&item_name=My%20Family%20Cinema%20Premium&amount=780`;
        case 'mfc-standard-420':
            return `${basePayFastLink}&item_name=My%20Family%20Cinema%20Standard&amount=420`;
        case 'mfc-basic-74':
            return `${basePayFastLink}&item_name=My%20Family%20Cinema%20Basic&amount=74`;
        case 'mfc-2-accounts':
            return `${basePayFastLink}&item_name=My%20Family%20Cinema%202%20Accounts&amount=148`;
        case 'mfc-3-accounts':
            return `${basePayFastLink}&item_name=My%20Family%20Cinema%203%20Accounts&amount=222`;
        case 'mfc-4-accounts':
            return `${basePayFastLink}&item_name=My%20Family%20Cinema%204%20Accounts&amount=296`;
        default:
            return ''; // Return empty string if no matching package
    }
}

// PayFast ITN (Instant Transaction Notification) verification endpoint
router.post('/payfast/itn', async (req, res) => {
    try {
        const data = req.body;
        const payfastSignature = verifyPayFastSignature(data, process.env.PAYFAST_PASSPHRASE);
        
        if (data.signature !== payfastSignature) {
            return res.status(400).send('Invalid PayFast signature.');
        }

        if (data.payment_status === 'COMPLETE') {
            const customer = await Customer.findOne({ email: data.email_address });
            if (customer) {
                customer.paymentStatus = 'paid';
                await customer.save();
                console.log(`Payment successful for customer: ${customer.email}`);
            }
        }

        res.status(200).send('ITN received.');
    } catch (error) {
        res.status(500).send('Error processing ITN.');
    }
});

// Route to display all customers with search and filters
router.get('/', async (req, res) => {
    const { search, platform } = req.query;
    const query = {};

    if (search) {
        query.$or = [
            { fullName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { uids: { $regex: search, $options: 'i' } },
            { accounts: { $regex: search, $options: 'i' } },
        ];
    }

    if (platform) {
        query.package = new RegExp(platform, 'i');
    }

    try {
        const customers = await Customer.find(query);
        res.render('customers', { customers, search, platform });
    } catch (error) {
        res.status(500).send('Error fetching customers.');
    }
});

module.exports = router;

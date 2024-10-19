const express = require('express');
const router = express.Router();
const Customer = require('../models/customer');

// Route to add a new customer
router.post('/', async (req, res) => {
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
        let payfastLink = '';
        switch (package) {
            case 'mfc-premium-780':
                payfastLink = 'https://payment.payfast.io/eng/process?cmd=_paynow&receiver=21701622&item_name=My+Family+Cinema&email_confirmation=1&confirmation_address=sales@dextradtechnologies.co.za&item_description=+Premium++12+Months&amount=780&subscription_type=1&recurring_amount=780&cycles=0&frequency=6';
                break;
            case 'mfc-standard-420':
                payfastLink = 'https://payment.payfast.io/eng/process?cmd=_paynow&receiver=21701622&item_name=My+Family+Cinema+-++6+Months&email_confirmation=1&confirmation_address=sales@dextradtechnologies.co.za&item_description=+Standard++6+Months&amount=420&subscription_type=1&recurring_amount=420&cycles=0&frequency=5';
                break;
            case 'mfc-basic-74':
                payfastLink = 'https://payment.payfast.io/eng/process?cmd=_paynow&receiver=21701622&item_name=My+Family+Cinema+-+Monthly&email_confirmation=1&confirmation_address=sales@dextradtechnologies.co.za&item_description=Basic+Monthly&amount=75&subscription_type=1&recurring_amount=75&cycles=0&frequency=3';
                break;
            case 'wp-premium-390':
                payfastLink = 'https://payment.payfast.io/eng/process?cmd=_paynow&receiver=21701622&item_name=Watchlist-Pro+-++6+Months&email_confirmation=1&confirmation_address=sales@dextradtechnologies.co.za&item_description=6+Months&amount=390&subscription_type=1&recurring_amount=390&cycles=0&frequency=5';
                break;
            case 'wp-standard-195':
                payfastLink = 'https://payment.payfast.io/eng/process?cmd=_paynow&receiver=21701622&item_name=Watchlist-Pro+-++3+Months&email_confirmation=1&confirmation_address=sales@dextradtechnologies.co.za&item_description=3+Months&amount=195&subscription_type=1&recurring_amount=195&cycles=0&frequency=4';
                break;
            case 'wp-basic-74':
                payfastLink = 'https://payment.payfast.io/eng/process?cmd=_paynow&receiver=21701622&item_name=Watchlist-Pro+-++Monthly&email_confirmation=1&confirmation_address=sales@dextradtechnologies.co.za&item_description=Monthly&amount=74&subscription_type=1&recurring_amount=74&cycles=0&frequency=3';
                break;
            case 'wp-devices-1-74':
                payfastLink = 'https://payment.payfast.io/eng/process?cmd=_paynow&receiver=21701622&item_name=Watchlist-Pro+-++1+Device+Monthly&email_confirmation=1&confirmation_address=sales@dextradtechnologies.co.za&item_description=1+Device++Monthly&amount=74&subscription_type=1&recurring_amount=74&cycles=0&frequency=3';
                break;
            case 'wp-devices-2-140':
                payfastLink = 'https://payment.payfast.io/eng/process?cmd=_paynow&receiver=21701622&item_name=Watchlist-Pro+-++2+Devices&email_confirmation=1&confirmation_address=sales@dextradtechnologies.co.za&item_description=2+Devices+&amount=140&subscription_type=1&recurring_amount=140&cycles=0&frequency=3';
                break;
            case 'wp-devices-3-210':
                payfastLink = 'https://payment.payfast.io/eng/process?cmd=_paynow&receiver=21701622&item_name=Watchlist-Pro+-++3+Devices&email_confirmation=1&confirmation_address=sales@dextradtechnologies.co.za&item_description=3+Devices&amount=210&subscription_type=1&recurring_amount=210&cycles=0&frequency=3';
                break;
            case 'wp-devices-4-270':
                payfastLink = 'https://payment.payfast.io/eng/process?cmd=_paynow&receiver=21701622&item_name=Watchlist-Pro+-++4+Devices&email_confirmation=1&confirmation_address=sales@dextradtechnologies.co.za&item_description=4+Devices&amount=270&subscription_type=1&recurring_amount=270&cycles=0&frequency=3';
                break;
            case 'wp-user-1-770':
                payfastLink = 'https://payment.payfast.io/eng/process?cmd=_paynow&receiver=21701622&item_name=Watchlist-Pro+-+1+User+Yearly&email_confirmation=1&confirmation_address=sales@dextradtechnologies.co.za&item_description=1+User+&amount=770&subscription_type=1&recurring_amount=770&cycles=0&frequency=6';
                break;
            case 'wp-user-2-1300':
                payfastLink = 'https://payment.payfast.io/eng/process?cmd=_paynow&receiver=21701622&item_name=Watchlist-Pro+-+2+Users+(Duo)&email_confirmation=1&confirmation_address=sales@dextradtechnologies.co.za&item_description=2+Users+(Duo)&amount=1300&subscription_type=1&recurring_amount=1300&cycles=0&frequency=6';
                break;
            case 'wp-2user-140':
                payfastLink = 'https://payment.payfast.io/eng/process?cmd=_paynow&receiver=21701622&item_name=Watchlist-Pro+-++2+Users+R140++Month&email_confirmation=1&confirmation_address=sales@dextradtechnologies.co.za&item_description=+2+Users+R140++Month&amount=140&subscription_type=1&recurring_amount=140&cycles=0&frequency=3';
                break;
            case 'wp-3user-210':
                payfastLink = 'https://payment.payfast.io/eng/process?cmd=_paynow&receiver=21701622&item_name=Watchlist-Pro+-++3+Users+R210++Month&email_confirmation=1&confirmation_address=sales@dextradtechnologies.co.za&item_description=3+Users+R210++Month&amount=210&subscription_type=1&recurring_amount=210&cycles=0&frequency=3';
                break;
            case 'wp-4user-270':
                payfastLink = 'https://payment.payfast.io/eng/process?cmd=_paynow&receiver=21701622&item_name=Watchlist-Pro+-++4+Users+R270+Month&email_confirmation=1&confirmation_address=sales@dextradtechnologies.co.za&item_description=4+Users+R270++Month&amount=270&subscription_type=1&recurring_amount=270&cycles=0&frequency=3';
                break;
            case 'wp-user-4-2200':
                payfastLink = 'https://payment.payfast.io/eng/process?cmd=_paynow&receiver=21701622&item_name=Watchlist-Pro+-+4+Users+(Family+Package)&email_confirmation=1&confirmation_address=sales@dextradtechnologies.co.za&item_description=4+Users+(Family+Package)&amount=2200&subscription_type=1&recurring_amount=2200&cycles=0&frequency=6';
                break;
            case 'mfc-2-accounts':
                payfastLink = 'https://payment.payfast.io/eng/process?cmd=_paynow&receiver=21701622&item_name=2+Accounts+-+My+Family+Cinema&email_confirmation=1&confirmation_address=sales@dextradtechnologies.co.za&item_description=2+Accounts&amount=148&subscription_type=1&recurring_amount=148&cycles=0&frequency=3';
                break;
            case 'mfc-3-accounts':
                payfastLink = 'https://payment.payfast.io/eng/process?cmd=_paynow&receiver=21701622&item_name=3+Accounts+-+My+Family+Cinema&email_confirmation=1&confirmation_address=sales@dextradtechnologies.co.za&item_description=3+Accounts&amount=222&subscription_type=1&recurring_amount=222&cycles=0&frequency=3';
                break;
            case 'mfc-4-accounts':
                payfastLink = 'https://payment.payfast.io/eng/process?cmd=_paynow&receiver=21701622&item_name=4+Accounts+-+My+Family+Cinema&email_confirmation=1&confirmation_address=sales@dextradtechnologies.co.za&item_description=4+Accounts&amount=296&subscription_type=1&recurring_amount=296&cycles=0&frequency=3';
                break;
            default:
                payfastLink = ''; // Default case if no matching package
        }

        // Respond with the PayFast link to redirect the user
         if (source !== 'manual') {
            res.status(201).json({ message: 'Customer added successfully', payfastLink });
        } else {
            res.status(201).json({ message: 'Customer added manually' });
        }
    } catch (err) {
        console.error('Error saving customer:', err);
        res.status(500).json({ message: 'Error saving customer' });
    }
});

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

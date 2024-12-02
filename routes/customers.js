// routes/customers.js
const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer'); // Ensure this path is correct
const crypto = require('crypto');

// Create PayFast signature for ITN verification
function verifyPayFastSignature(data, passphrase) {
    const sortedKeys = Object.keys(data).sort();
    const signatureString = sortedKeys
        .map((key) => `${key}=${encodeURIComponent(data[key])}`)
        .join('&') + '&passphrase=' + passphrase;
    return crypto.createHash('md5').update(signatureString).digest('hex');
}

// Scheduled job for updating expiry dates and marking customers as unpaid
async function handleExpiryUpdates() {
    const today = new Date();

    try {
        // Find customers with expired subscriptions
        const expiredCustomers = await Customer.find({ expiryDate: { $lte: today } });

        expiredCustomers.forEach(async (customer) => {
            // Mark expired users as unpaid
            customer.paymentStatus = 'unpaid';
            customer.isActive = false;

            // Renew expiry date for active packages
            if (customer.package) {
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
        console.error('Error updating expiry dates:', err);
    }
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
                return res.status(400).json({ message: 'Invalid package selected.' });
        }
         // Set source as "manual" if not specified, defaulting to "website" if undefined
         const source = req.body.source || 'website';

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
            source
        });

        // Save the new customer to the database
        await newCustomer.save();

        // Generate PayFast link based on the selected package
        const payfastLink = generatePayFastLink(subscription_plans);
        if (!payfastLink) {
            return res.status(400).json({ message: 'Unable to generate payment link.' });
        }

        // Respond with the PayFast link for redirection
      
        res.redirect(payfastLink);
    } catch (error) {
        res.status(500).json({ message: 'Error adding customer.', error: error.message });
    }
});

// Function to generate PayFast link based on the package
function generatePayFastLink(package) {
    const basePayFastLink = 'https://payment.payfast.io/eng/process?cmd=_paynow&receiver=21701622&email_confirmation=1&confirmation_address=sales@dextradtechnologies.co.za';
    switch (package) {
        case 'mfc-premium-780':
            return `https://payment.payfast.io/eng/process?cmd=_paynow&receiver=21701622&item_name=My+Family+Cinema&email_confirmation=1&confirmation_address=sales@dextradtechnologies.co.za&item_description=+Premium++12+Months&amount=780&subscription_type=1&recurring_amount=780&cycles=0&frequency=6`;
        case 'mfc-standard-420':
            return `https://payment.payfast.io/eng/process?cmd=_paynow&receiver=21701622&item_name=My+Family+Cinema+-++6+Months&email_confirmation=1&confirmation_address=sales@dextradtechnologies.co.za&item_description=+Standard++6+Months&amount=420&subscription_type=1&recurring_amount=420&cycles=0&frequency=5`;
        case 'mfc-basic-74':
            return `https://payment.payfast.io/eng/process?cmd=_paynow&receiver=21701622&item_name=MFC+-+Basic+Package&email_confirmation=1&confirmation_address=sales@dextradtechnologies.co.za&item_description=R75+-+Monthly&amount=75&subscription_type=1&recurring_amount=75&cycles=0&frequency=3`;
        case 'mfc-2-accounts':
            return `https://payment.payfast.io/eng/process?cmd=_paynow&receiver=21701622&item_name=MFC+-+2+Accounts&email_confirmation=1&confirmation_address=sales@dextradtechnologies.co.za&item_description=R148+-+Monthly&amount=148&subscription_type=1&recurring_amount=148&cycles=0&frequency=3`;
        case 'mfc-3-accounts':
            return `https://payment.payfast.io/eng/process?cmd=_paynow&receiver=21701622&item_name=MFC+-+3+Accounts&email_confirmation=1&confirmation_address=sales@dextradtechnologies.co.za&item_description=R222+-+Monthly&amount=222&subscription_type=1&recurring_amount=222&cycles=0&frequency=3`;
        case 'mfc-4-accounts':
            return `https://payment.payfast.io/eng/process?cmd=_paynow&receiver=21701622&item_name=MFC+-+4+Accounts&email_confirmation=1&confirmation_address=sales@dextradtechnologies.co.za&item_description=R296+-+Monthly&amount=296&subscription_type=1&recurring_amount=296&cycles=0&frequency=3`;
        case 'wp-premium-390':
                return `https://payment.payfast.io/eng/process?cmd=_paynow&receiver=21701622&item_name=Watchlist-Pro+-++6+Months&email_confirmation=1&confirmation_address=sales@dextradtechnologies.co.za&item_description=6+Months&amount=390&subscription_type=1&recurring_amount=390&cycles=0&frequency=5`;
        case 'wp-premium-390':
                return `https://payment.payfast.io/eng/process?cmd=_paynow&receiver=21701622&item_name=Watchlist-Pro+-++6+Months&email_confirmation=1&confirmation_address=sales@dextradtechnologies.co.za&item_description=6+Months&amount=390&subscription_type=1&recurring_amount=390&cycles=0&frequency=5`;
                case 'wp-standard-195':
                    return `https://payment.payfast.io/eng/process?cmd=_paynow&receiver=21701622&item_name=Watchlist-Pro+-++3+Months&email_confirmation=1&confirmation_address=sales@dextradtechnologies.co.za&item_description=3+Months&amount=195&subscription_type=1&recurring_amount=195&cycles=0&frequency=4`;
                
                case 'wp-basic-74':
                    return `https://payment.payfast.io/eng/process?cmd=_paynow&receiver=21701622&item_name=Watchlist-Pro+-+Basic+Package&email_confirmation=1&confirmation_address=sales@dextradtechnologies.co.za&item_description=R74+-+Monthly&amount=74&subscription_type=1&recurring_amount=74&cycles=0&frequency=3`;
                
                case 'wp-devices-1-74':
                    return `https://payment.payfast.io/eng/process?cmd=_paynow&receiver=21701622&item_name=Watchlist-Pro+-+Basic+Package&email_confirmation=1&confirmation_address=sales@dextradtechnologies.co.za&item_description=R74+-+Monthly&amount=74&subscription_type=1&recurring_amount=74&cycles=0&frequency=3`;
                
                case 'wp-devices-2-140':
                    return `https://payment.payfast.io/eng/process?cmd=_paynow&receiver=21701622&item_name=Watchlist-Pro+-++2+Devices&email_confirmation=1&confirmation_address=sales@dextradtechnologies.co.za&item_description=2+Devices+&amount=140&subscription_type=1&recurring_amount=140&cycles=0&frequency=3`;
                
                case 'wp-devices-3-210':
                    return `https://payment.payfast.io/eng/process?cmd=_paynow&receiver=21701622&item_name=Watchlist-Pro+-++3+Devices&email_confirmation=1&confirmation_address=sales@dextradtechnologies.co.za&item_description=3+Devices&amount=210&subscription_type=1&recurring_amount=210&cycles=0&frequency=3`;
                
                case 'wp-devices-4-270':
                    return `https://payment.payfast.io/eng/process?cmd=_paynow&receiver=21701622&item_name=Watchlist-Pro+-++4+Devices&email_confirmation=1&confirmation_address=sales@dextradtechnologies.co.za&item_description=4+Devices&amount=270&subscription_type=1&recurring_amount=270&cycles=0&frequency=3`;
                
                case 'wp-user-1-770':
                    return `https://payment.payfast.io/eng/process?cmd=_paynow&receiver=21701622&item_name=Watchlist-Pro+-+1+User+Yearly&email_confirmation=1&confirmation_address=sales@dextradtechnologies.co.za&item_description=1+User+&amount=770&subscription_type=1&recurring_amount=770&cycles=0&frequency=6`;
                
                case 'wp-user-2-1300':
                    return `https://payment.payfast.io/eng/process?cmd=_paynow&receiver=21701622&item_name=Watchlist-Pro+-+2+Users+(Duo)&email_confirmation=1&confirmation_address=sales@dextradtechnologies.co.za&item_description=2+Users+(Duo)&amount=1300&subscription_type=1&recurring_amount=1300&cycles=0&frequency=6`;
                
                case 'wp-2user-140':
                    return `https://payment.payfast.io/eng/process?cmd=_paynow&receiver=21701622&item_name=Watchlist-Pro+-++2+Users+R140++Month&email_confirmation=1&confirmation_address=sales@dextradtechnologies.co.za&item_description=+2+Users+R140++Month&amount=140&subscription_type=1&recurring_amount=140&cycles=0&frequency=3`;
                
                case 'wp-3user-210':
                    return `https://payment.payfast.io/eng/process?cmd=_paynow&receiver=21701622&item_name=Watchlist-Pro+-++3+Users+R210++Month&email_confirmation=1&confirmation_address=sales@dextradtechnologies.co.za&item_description=3+Users+R210++Month&amount=210&subscription_type=1&recurring_amount=210&cycles=0&frequency=3`;
                
                case 'wp-4user-270':
                    return `https://payment.payfast.io/eng/process?cmd=_paynow&receiver=21701622&item_name=Watchlist-Pro+-++4+Users+R270+Month&email_confirmation=1&confirmation_address=sales@dextradtechnologies.co.za&item_description=4+Users+R270++Month&amount=270&subscription_type=1&recurring_amount=270&cycles=0&frequency=3`;
                
                case 'wp-user-4-2200':
                    return `https://payment.payfast.io/eng/process?cmd=_paynow&receiver=21701622&item_name=Watchlist-Pro+-+4+Users+(Family+Package)&email_confirmation=1&confirmation_address=sales@dextradtechnologies.co.za&item_description=4+Users+(Family+Package)&amount=2200&subscription_type=1&recurring_amount=2200&cycles=0&frequency=6`;
        
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

// Route to display all customers with filters
router.get('/', async (req, res) => {
    const { search, platform, cloud, paymentStatus } = req.query;
    const query = {};

    // Search logic for name, email, UIDs, or accounts
    if (search) {
        query.$or = [
            { fullName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { uids: { $regex: search, $options: 'i' } },
            { accounts: { $regex: search, $options: 'i' } },
            { whatsappNumber: { $regex: search, $options: 'i' } } // Add this line to search by WhatsApp number
        ];
    }

    // Filter by platform
    if (platform) {
        query.package = new RegExp(`^${platform}`, 'i');
    }

    // Filter by cloud status
    if (cloud) {
        query.cloud = cloud === 'checked'; // Filter only active or inactive based on cloud parameter
    }

    // Filter by payment status
    if (paymentStatus) {
    query.paymentStatus = paymentStatus;
    }

    try {
        const customers = await Customer.find(query);
        res.render('customers', { customers, searchTerm: search, platformFilter: platform, cloudFilter: cloud, paymentStatusFilter: paymentStatus });
    } catch (error) {
        console.error('Error fetching customers:', error);
        res.status(500).send('Error fetching customers');
    }
});

// Toggle payment status
router.post('/toggle-payment/:id', async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (customer) {
            // Toggle between 'paid' and 'unpaid'
            customer.paymentStatus = customer.paymentStatus === 'paid' ? 'unpaid' : 'paid';
            await customer.save();
        }
        res.redirect('/customers'); // Redirect back to customer list
    } catch (err) {
        console.error('Error toggling payment status:', err);
        res.status(500).send('Error toggling payment status.');
    }
});

// Toggle cloud status
router.post('/toggle-cloud/:id', async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (customer) {
            // Toggle the cloud status
            customer.cloud = !customer.cloud;
            await customer.save();
        }
        res.redirect('/customers'); // Redirect back to the customer list
    } catch (err) {
        console.error('Error toggling cloud status:', err);
        res.status(500).send('Error toggling cloud status.');
    }
});

// Delete a customer
router.post('/delete/:id', async (req, res) => {
    try {
        await Customer.findByIdAndDelete(req.params.id);
        res.redirect('/customers'); // Redirect back to customer list after deletion
    } catch (err) {
        console.error('Error deleting customer:', err);
        res.status(500).send('Error deleting customer.');
    }
});


// Update customer information
router.post('/edit', async (req, res) => {
    const { id, fullName, email, package, uids, accounts, whatsappNumber, expiryDate } = req.body;
    try {
        await Customer.findByIdAndUpdate(id, {
            fullName,
            email,
            package,
            uids: uids.split(',').map(uid => uid.trim()), // Convert comma-separated string to array
            accounts: accounts.split(',').map(account => account.trim()), // Convert comma-separated string to array
            whatsappNumber,
            expiryDate: new Date(expiryDate)
        });
        res.redirect('/customers'); // Redirect to customer list page after editing
    } catch (error) {
        console.error('Error updating customer:', error);
        res.status(500).send('Error updating customer');
    }
});




module.exports = router;

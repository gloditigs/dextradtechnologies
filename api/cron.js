const Customer = require('../models/Customer');
const sgMail = require('@sendgrid/mail');
require('dotenv').config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendExpiryReminder(customer) {
    const msg = {
        to: customer.email,
        from: 'your_email@yourdomain.com', // Replace with your verified SendGrid sender email
        subject: 'Subscription Expiry Reminder',
        text: `
            Dear ${customer.fullName},
            
            Your subscription package "${customer.package}" is expiring on ${new Date(customer.expiryDate).toLocaleDateString()}.

            Please have the funds ready to renew and avoid interruptions.

            Regards,
            Dextrad Technologies Team
        `,
    };

    try {
        await sgMail.send(msg);
        console.log(`Reminder email sent to ${customer.email}`);
    } catch (error) {
        console.error('Error sending email:', error.response ? error.response.body : error);
    }
}

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    try {
        const now = new Date();
        const reminderDate = new Date();
        reminderDate.setDate(now.getDate() + 1); // 1 day before expiry

        console.log(`Cron job started at ${now.toISOString()}`);

        // Handle expiry date updates and mark as unpaid
        const expiredCustomers = await Customer.find({ expiryDate: { $lte: now } });
        console.log(`Found ${expiredCustomers.length} expired customers`);

        for (const customer of expiredCustomers) {
            // Mark expired customers as unpaid and reset checked_by_extension
            if (customer.paymentStatus === 'paid') {
                customer.paymentStatus = 'unpaid';
                customer.isActive = false;
                customer.checked_by_extension = false; // Reset for reactivation
                console.log(`Marked ${customer.email} as unpaid and reset checked_by_extension.`);
            }

            // Renew expiry date based on package
            let newExpiryDate = new Date(customer.expiryDate); // Start from the previous expiry date
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

                default:
                    newExpiryDate.setMonth(newExpiryDate.getMonth() + 1); // Add 1 month for basic packages
                    break;
            }

            customer.expiryDate = newExpiryDate;
            await customer.save();
            console.log(`Updated expiry date for ${customer.email} to ${newExpiryDate}`);
        }

        // Find customers whose subscriptions expire tomorrow
        const expiringCustomers = await Customer.find({
            expiryDate: { $lte: reminderDate, $gt: now },
            paymentStatus: 'paid',
        });

        console.log(`Found ${expiringCustomers.length} customers to notify.`);

        for (const customer of expiringCustomers) {
            await sendExpiryReminder(customer); // Send email
        }

        res.status(200).send('Cron job executed successfully.');
    } catch (err) {
        console.error('Error in cron job:', err);
        res.status(500).send('Cron job failed.');
    }
};

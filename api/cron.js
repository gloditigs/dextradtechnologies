import Customer from '../../models/Customer';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    try {
        const now = new Date();

        // Handle expiry date updates and mark as unpaid
        const expiredCustomers = await Customer.find({ expiryDate: { $lte: now } });

        for (const customer of expiredCustomers) {
            // Mark expired customers as unpaid
            if (customer.paymentStatus === 'paid') {
                customer.paymentStatus = 'unpaid';
                customer.isActive = false; // Optionally deactivate the user
                console.log(`Marked ${customer.email} as unpaid.`);
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
            console.log(`Updated expiry date for ${customer.email} to ${newExpiryDate}.`);
        }

        // Send reminder emails to customers whose subscriptions expire in 7 days
        const reminderDate = new Date(now);
        reminderDate.setDate(now.getDate() + 7);

        const expiringSoonCustomers = await Customer.find({
            expiryDate: { $lte: reminderDate, $gt: now },
            paymentStatus: 'paid',
        });

        for (const customer of expiringSoonCustomers) {
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
                `,
            };

            await transporter.sendMail(mailOptions);
            console.log(`Reminder email sent to ${customer.email}`);
        }

        res.status(200).send('Cron job executed successfully.');
    } catch (err) {
        console.error('Error in cron job:', err);
        res.status(500).send('Cron job failed.');
    }
}

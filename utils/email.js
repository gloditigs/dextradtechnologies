const sgMail = require('@sendgrid/mail');
require('dotenv').config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Sends a subscription expiry reminder email to the customer.
 * @param {Object} customer - The customer object containing email, name, and package info.
 */
async function sendExpiryReminder(customer) {
    const msg = {
        to: customer.email,
        from: 'your_email@yourdomain.com', // Replace with your verified sender
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
console.log('SendGrid API Key:', process.env.SENDGRID_API_KEY);


module.exports = { sendExpiryReminder };

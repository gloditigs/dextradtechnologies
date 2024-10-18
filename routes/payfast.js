const express = require('express');
const router = express.Router();
const Customer = require('../models/customer');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const qs = require('querystring'); // To properly format and parse query strings

// ITN Endpoint
router.post('/itn', async (req, res) => {
    try {
        // PayFast ITN data
        const itnData = req.body;

        // Verify the PayFast signature
        const isValidSignature = verifyPayFastSignature(itnData);
        if (!isValidSignature) {
            console.error('Invalid PayFast signature');
            return res.status(400).send('Invalid signature');
        }

        // Check if payment status is complete
        if (itnData.payment_status === 'COMPLETE') {
            const email = itnData.email_address; // Use the appropriate field to identify the customer
            
            // Find and update the customer payment status
            const customer = await Customer.findOne({ email });
            if (customer) {
                customer.paymentStatus = 'paid';
                await customer.save();
                console.log(`Payment successful for customer: ${customer.email}`);

                // Send confirmation email to the customer
                const subject = 'Payment Successful';
                const text = `Dear ${customer.fullName},\n\nYour payment has been successfully processed. Thank you for your subscription!`;
                await sendEmail(customer.email, subject, text);
            } else {
                console.error(`Customer with email ${email} not found`);
            }
        }

        res.status(200).send('ITN Received');
    } catch (err) {
        console.error('Error processing ITN:', err);
        res.status(500).send('Error processing ITN');
    }
});

// Function to verify PayFast signature
function verifyPayFastSignature(data) {
    // Remove the signature from the data
    const { signature, ...paramsWithoutSignature } = data;
    
    // Sort the parameters alphabetically
    const sortedParams = Object.keys(paramsWithoutSignature)
        .sort()
        .map(key => `${key}=${encodeURIComponent(paramsWithoutSignature[key])}`)
        .join('&');

    // Generate the signature using the merchant's passphrase (replace 'your_passphrase' with your actual passphrase)
    const generatedSignature = crypto
        .createHash('md5')
        .update(sortedParams + '&passphrase=' + process.env.PAYFAST_PASSPHRASE) // PAYFAST_PASSPHRASE should be stored securely in your .env file
        .digest('hex');

    return generatedSignature === signature;
}

// Function to send emails using Nodemailer
async function sendEmail(to, subject, text) {
    const transporter = nodemailer.createTransport({
        service: 'gmail', // Use your email service provider
        auth: {
            user: process.env.EMAIL_USER, // Your email
            pass: process.env.EMAIL_PASS // Your email password or app password
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${to}`);
    } catch (error) {
        console.error(`Error sending email to ${to}:`, error);
    }
}

module.exports = router;

// models/Customer.js
const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    whatsappNumber: { type: String, required: true },
    uids: { type: [String], required: true },
    accounts: { type: [String], required: true },
    package: { type: String, required: true },
    expiryDate: { type: Date, required: true },
    paymentStatus: { type: String, default: 'unpaid' },
    cloud: { type: Boolean, default: false }, // Ensure cloud field is here
    source: { type: String, default: 'website' }
});

module.exports = mongoose.model('Customer', CustomerSchema);
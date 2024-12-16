/* const mongoose = require('mongoose');
const Customer = require('./models/Customer'); // Ensure the path is correct
require('dotenv').config();

async function updateCheckedByExtension() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');

        // Update all users marked as paid
        const result = await Customer.updateMany(
            { paymentStatus: 'paid' }, // Filter: All users marked as paid
            { $set: { checked_by_extension: true } } // Update: Set checked_by_extension to true
        );

        console.log(`${result.modifiedCount} users updated.`);
        mongoose.connection.close();
    } catch (error) {
        console.error('Error updating checked_by_extension:', error);
        mongoose.connection.close();
    }
}

updateCheckedByExtension();

*/
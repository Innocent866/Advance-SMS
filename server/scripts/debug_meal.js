const mongoose = require('mongoose');
const MealTracking = require('./models/MealTracking');
const User = require('./models/User');
const dotenv = require('dotenv');
dotenv.config();

async function checkRecords() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');
        
        const records = await MealTracking.find().populate('markedBy', 'role name');
        console.log('Total records:', records.length);
        
        if (records.length > 0) {
            console.log('Sample Record (First 5):');
            records.slice(0, 5).forEach(r => {
                console.log(`Student: ${r.studentId}, Date: ${r.date}, Meal: ${r.mealType}, MarkedBy: ${r.markedBy?.name} (${r.markedBy?.role})`);
            });
        } else {
            console.log('No records found in MealTracking');
        }
        
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.connection.close();
    }
}

checkRecords();

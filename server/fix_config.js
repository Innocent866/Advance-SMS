const mongoose = require('mongoose');
const dotenv = require('dotenv');
const AssessmentConfig = require('./models/AssessmentConfig');

dotenv.config();

const fixConfig = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const config = await AssessmentConfig.findOne({ session: '2025/2026', term: 'First Term' });
        
        if (config) {
            console.log('Fixing config...');
            // Reset to safe default
            config.components = [
                { name: 'CA1', maxScore: 20 },
                { name: 'Test', maxScore: 20 },
                { name: 'Exam', maxScore: 60 }
            ];
            config.totalMaxScore = 100;
            await config.save();
            console.log('Config reset to safe defaults: CA1 (20), Test (20), Exam (60).');
        } else {
            console.log('No config found to fix.');
        }

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

fixConfig();

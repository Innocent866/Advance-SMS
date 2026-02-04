const mongoose = require('mongoose');
const dotenv = require('dotenv');
const AssessmentConfig = require('./models/AssessmentConfig');

dotenv.config();

const checkConfig = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const configs = await AssessmentConfig.find({});
        console.log('Found', configs.length, 'configs');

        configs.forEach(c => {
            console.log(`\nConfig for ${c.session} - ${c.term}:`);
            c.components.forEach(comp => {
                console.log(` - ${comp.name} (Max: ${comp.maxScore})`);
            });
            
            // Check duplicates
            const names = c.components.map(comp => comp.name);
            const verifiedNames = new Set(names);
            if (names.length !== verifiedNames.size) {
                 console.log('!!! DUPLICATE NAMES DETECTED !!!');
            } else {
                console.log('No duplicates found.');
            }
        });

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkConfig();

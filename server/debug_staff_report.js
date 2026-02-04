const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db'); // Use existing DB config

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Mock Middleware if DB fails, or use real one
// We will try to use the real one first.
// If connectDB fails (e.g. strict query warning), we might see it.

try {
    // connectDB(); // Optional for just checking route loading, but better to skip if we don't want to mess with active DB connections of the bad process.
    // Actually, models need a connection to work fully, but for *starting* the server, usually lazy connection is fine.
    // Let's skip connectDB for now to avoid port/resource conflicts, just test Route mounting.
    
    console.log('Mounting routes...');
    app.use('/api/staff-reports', require('./routes/staffReport.routes'));
    console.log('Routes mounted.');

    const PORT = 5001;
    const server = app.listen(PORT, () => {
        console.log(`Test Server running on port ${PORT}`);
        server.close(); // Close immediately if successful
        console.log('Test Server started and closed successfully.');
    });
    
} catch (error) {
    console.error('SERVER STARTUP ERROR:', error);
    process.exit(1);
}

const express = require('express'); // Server entry point - Restart Triggered

const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

// Basic Route
app.get('/', (req, res) => {
    res.send('API is running...');
});

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/schools', require('./routes/school.routes'));
app.use('/api/teachers', require('./routes/teacher.routes'));
app.use('/api/students', require('./routes/student.routes'));
app.use('/api/videos', require('./routes/video.routes'));
app.use('/api/quizzes', require('./routes/quiz.routes'));
app.use('/api/parents', require('./routes/parent.routes'));
app.use('/api/academic', require('./routes/academic.routes'));
app.use('/api/lessons', require('./routes/lesson.routes'));
app.use('/api/marking', require('./routes/marking.routes'));
app.use('/api/payments', require('./routes/payment.routes'));
app.use('/api/webhooks', require('./routes/webhook.routes'));
app.use('/api/learning', require('./routes/learning.routes'));
app.use('/api/admin/content', require('./routes/adminContent.routes'));
app.use('/api/admin/analytics', require('./routes/analytics.routes'));
app.use('/api/superadmin', require('./routes/superadmin.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));
app.use('/api/assessment-config', require('./routes/assessment.routes'));
app.use('/api/results', require('./routes/result.routes'));
app.use('/api/attendance', require('./routes/attendance.routes'));
app.use('/api/staff-reports', require('./routes/staffReport.routes'));
app.use('/api/learning-materials', require('./routes/learningMaterial.routes'));
app.use('/api/upload', require('./routes/upload.routes'));

// Error Middleware
const { errorHandler } = require('./middleware/error.middleware');
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

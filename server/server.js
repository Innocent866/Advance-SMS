const express = require('express'); // Server entry point - Restart Triggered

const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const mongoSanitize = require('@exortek/express-mongo-sanitize');
const { xss } = require('express-xss-sanitizer');
const compression = require('compression'); // Performance: Payload compression

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// 0. Compression - MUST BE EARLY
app.use(compression());

// 1. CORS - MUST BE FIRST to handle preflight (OPTIONS) requests
app.use(cors());

// 2. Security Headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://js.paystack.co"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            imgSrc: ["'self'", "data:", "https:", "http:"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            connectSrc: ["'self'", "https://api.paystack.co", "https://checkout.paystack.com"],
            frameSrc: ["'self'", "https://checkout.paystack.com"],
            videoSrc: ["'self'", "blob:", "https:", "http:"]
        }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// 3. Body Parser & Static
app.use(express.json());

// Performance: Cache static assets for 1 year (Immutable)
app.use('/uploads', express.static('uploads', {
    maxAge: '1y',
    etag: true,
    lastModified: true
}));

// 4. Sanitization Middleware (After body parser)
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(xss()); // Prevent XSS attacks
app.use(hpp()); // Prevent HTTP Parameter Pollution

// 5. Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // Increased from 100 to 1000 to prevent 429 during normal dashboard/payment usage
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/', limiter);

// 6. Targeted Rate Limiting for Auth (Stricter)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20, // Stricter limit for login/register
    message: 'Too many login attempts, please try again after 15 minutes'
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register-school', authLimiter);

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

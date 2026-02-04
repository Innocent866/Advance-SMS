const ErrorLog = require('../models/ErrorLog');

const errorHandler = async (err, req, res, next) => {
    const statusCode = res.statusCode ? res.statusCode : 500;

    // Log to console
    console.error('Error Middleware Caught:', err.message);
    if (process.env.NODE_ENV === 'development') {
        console.error(err.stack);
    }

    // Log to Database (Async - don't await/block response)
    try {
        // Sanitize body (remove passwords etc) - Simple example
        const safeBody = { ...req.body };
        if (safeBody.password) safeBody.password = '***';

        ErrorLog.create({
            message: err.message,
            stack: err.stack,
            statusCode: statusCode,
            path: req.originalUrl,
            method: req.method,
            user: req.user ? req.user._id : null,
            body: safeBody
        }).catch(e => console.error('Failed to save ErrorLog:', e));
    } catch (logError) {
        console.error('Error logging to DB:', logError);
    }

    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
};

module.exports = { errorHandler };

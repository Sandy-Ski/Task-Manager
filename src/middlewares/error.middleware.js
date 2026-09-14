const config = require("../config/env");

const errorHandler = (error, req, res, next) => {
    const statusCode = error.statusCode || 500;

    console.error({
        timestamp: new Date().toISOString(),
        requestId: req.requestId,
        method: req.method,
        url: req.originalUrl,
        statusCode,
        errorName: error.name,
        message: error.message
    });

    if (error.name === "ValidationError") {
        const messages = Object.values(error.errors).map((err) => {
            if (err.path === "priority" && err.kind === "enum") {
                return "Priority must be low, medium, or high";
            }

            return err.message;
        });

        return res.status(400).json({
            success: false,
            statusCode: 400,
            message: messages.join(", "),
            data: null
        });
    }

    const message =
        config.environment === "production"
            ? "Internal server error"
            : error.message || "Server error";

    res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        data: null
    });
};

module.exports = errorHandler;
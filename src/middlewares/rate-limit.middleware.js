const rateLimit = require("express-rate-limit");

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,

    limit: process.env.NODE_ENV === "test" ? 1000 : 100,

    message: {
        success: false,
        message: "Too many requests, please try again later"
    }
});

const authLimiter = rateLimit({

    windowMs: 15 * 60 * 1000,

    limit: process.env.NODE_ENV === "test" ? 1000 : 10,

    message: {

        success: false,

        message: "Too many authentication attempts, please try again later"

    }

});

module.exports = {
    apiLimiter,
    authLimiter
};
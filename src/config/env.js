const dotenv = require("dotenv");

const environment = process.env.NODE_ENV || "development";

if (environment === "test") {
    dotenv.config({
        path: ".env.test"
    });
} else {
    dotenv.config({
        path: ".env"
    });
}

const requiredVariables = [
    "MONGODB_URI",
    "JWT_SECRET",
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_USER",
    "SMTP_PASSWORD",
    "EMAIL_FROM"
];

const missingVariables = requiredVariables.filter(
    (variable) => !process.env[variable]
);

if (missingVariables.length > 0) {
    throw new Error(
        `Missing required environment variables: ${missingVariables.join(", ")}`
    );
}

const config = {
    environment,

    port: process.env.PORT || 5000,

    mongoUri: process.env.MONGODB_URI,

    jwtSecret: process.env.JWT_SECRET,

    corsOrigin:
        process.env.CORS_ORIGIN || "http://localhost:5173",

    smtpHost: process.env.SMTP_HOST,

    smtpPort: Number(process.env.SMTP_PORT),

    smtpSecure: process.env.SMTP_SECURE === "true",

    smtpUser: process.env.SMTP_USER,

    smtpPassword: process.env.SMTP_PASSWORD,

    emailFrom: process.env.EMAIL_FROM
};

module.exports = config;
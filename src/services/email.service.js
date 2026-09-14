const nodemailer = require("nodemailer");
const config = require("../config/env");

const transporter = nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpSecure,

    auth: {
        user: config.smtpUser,
        pass: config.smtpPassword
    }
});

const sendPasswordResetEmail = async ({
    to,
    resetUrl
}) => {

   const info =  await transporter.sendMail({
        from: config.emailFrom,
        to,
        subject: "Reset your Task Manager password",

        html: `
            <h2>Password Reset</h2>

            <p>
                We received a request to reset your Task Manager password.
            </p>

            <p>
                Click the link below to reset your password:
            </p>

            <p>
                <a href="${resetUrl}">
                    Reset Password
                </a>
            </p>

            <p>
                This link will expire in 15 minutes.
            </p>

            <p>
                If you did not request a password reset, you can safely ignore this email.
            </p>
        `
    });

    console.log("Password reset email sent:", info.messageId);
};

module.exports = {
    sendPasswordResetEmail
};
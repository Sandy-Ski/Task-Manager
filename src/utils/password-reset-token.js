const crypto = require("crypto");

const generatePasswordResetToken = () => {
    return crypto.randomBytes(32).toString("hex");
};

const hashPasswordResetToken = (token) => {
    return crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
};

module.exports = {
    generatePasswordResetToken,
    hashPasswordResetToken
};
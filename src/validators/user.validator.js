const registerValidation = (req) => {

    const { name, email, password } = req.body || {};

    if (
        typeof name !== "string" ||
        !name.trim()
    ) {
        return {
            statusCode: 400,
            message: "Name is required and must be a string"
        };
    }

    if (
        typeof email !== "string" ||
        !email.trim()
    ) {
        return {
            statusCode: 400,
            message: "Email is required and must be a string"
        };
    }

    if (
        typeof password !== "string" ||
        !password.trim()
    ) {
        return {
            statusCode: 400,
            message: "Password is required and must be a string"
        };
    }

    const normalizedEmail = email.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
        return {
            statusCode: 400,
            message: "Invalid email format"
        };
    }

    if (password.length < 6) {
        return {
            statusCode: 400,
            message: "Password must be at least 6 characters"
        };
    }

    return null;
};

const loginValidation = (req) => {

    const { email, password, sessionName } = req.body || {};

    if (
        typeof email !== "string" ||
        !email.trim() ||
        typeof password !== "string" ||
        !password.trim()
    ) {
        return {
            statusCode: 400,
            message: "Email and password are required"
        };
    }

    if (
        sessionName !== undefined &&
        typeof sessionName !== "string"
    ) {
        return {
            statusCode: 400,
            message: "Session name must be a string"
        };
    }

    return null;
};

const changePasswordValidation = (req) => {

    const {
        currentPassword,
        newPassword
    } = req.body || {};

    if (
        typeof currentPassword !== "string" ||
        !currentPassword.trim()
    ) {
        return {
            statusCode: 400,
            message: "Current password is required"
        };
    }

    if (
        typeof newPassword !== "string" ||
        !newPassword.trim()
    ) {
        return {
            statusCode: 400,
            message: "New password is required"
        };
    }

    if (newPassword.length < 6) {
        return {
            statusCode: 400,
            message: "New password must be at least 6 characters"
        };
    }

    return null;
};

const forgotPasswordValidation = (req) => {

    const { email } = req.body || {};

    if (
        typeof email !== "string" ||
        !email.trim()
    ) {
        return {
            statusCode: 400,
            message: "Email is required"
        };
    }

    const normalizedEmail = email.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
        return {
            statusCode: 400,
            message: "Invalid email format"
        };
    }

    return null;
};

const resetPasswordValidation = (req) => {

    const {
        resetToken,
        newPassword
    } = req.body || {};

    if (
        typeof resetToken !== "string" ||
        !resetToken.trim()
    ) {
        return {
            statusCode: 400,
            message: "Reset token is required"
        };
    }

    if (
        typeof newPassword !== "string" ||
        !newPassword.trim()
    ) {
        return {
            statusCode: 400,
            message: "New password is required"
        };
    }

    if (newPassword.length < 6) {
        return {
            statusCode: 400,
            message: "New password must be at least 6 characters"
        };
    }

    return null;
};

const refreshTokenValidation = (req) => {

    const { refreshToken } = req.body || {};

    if (
        typeof refreshToken !== "string" ||
        !refreshToken.trim()
    ) {
        return {
            statusCode: 400,
            message: "Refresh token is required"
        };
    }

    return null;
};

const logoutValidation = (req) => {

    const { refreshToken } = req.body || {};

    if (
        typeof refreshToken !== "string" ||
        !refreshToken.trim()
    ) {
        return {
            statusCode: 400,
            message: "Refresh token is required"
        };
    }

    return null;
};

module.exports = {
    registerValidation,
    loginValidation,
    changePasswordValidation,
    forgotPasswordValidation,
    resetPasswordValidation,
    refreshTokenValidation,
    logoutValidation
};
const bcrypt = require("bcrypt");
const User = require("../models/user.model");
const ApiError = require("../utils/api-error");
const generateToken = require("../utils/jwt");
const {
    sendPasswordResetEmail
} = require("./email.service");

const {
    generateRefreshToken,
    hashRefreshToken
} = require("../utils/refresh-token");

const RefreshToken = require("../models/refresh-token.model");

const PasswordResetToken = require("../models/password-reset-token.model");

const {
    generatePasswordResetToken,
    hashPasswordResetToken
} = require("../utils/password-reset-token");



const registerUserService = async ({
    name,
    email,
    password
}) => {

    const existingUser = await User.findOne({
        email
    });

    if (existingUser) {
        throw new ApiError(
            409,
            "Email is already registered"
        );
    }

    const hashedPassword = await bcrypt.hash(
        password,
        10
    );

    const user = await User.create({
        name,
        email,
        password: hashedPassword
    });

    return {
        user
    };
};

const loginUserService = async ({
    email,
    password,
    sessionName
}) => {

    const user = await User.findOne({
        email
    });

    if (!user) {
        throw new ApiError(
            401,
            "Invalid email or password"
        );
    }

    const isPasswordCorrect = await bcrypt.compare(
        password,
        user.password
    );

    if (!isPasswordCorrect) {
        throw new ApiError(
            401,
            "Invalid email or password"
        );
    }

    const token = generateToken(user._id, user.tokenVersion);

    const refreshToken = generateRefreshToken();

    const refreshTokenHash = hashRefreshToken(
        refreshToken
    );

    await RefreshToken.create({
        user: user._id,
        sessionName,
        tokenHash: refreshTokenHash,
        expiresAt: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
        )
    });

    return {
        user,
        token,
        refreshToken
    };
};

const refreshAccessTokenService = async ({
    refreshToken
}) => {

    const refreshTokenHash = hashRefreshToken(
        refreshToken
    );

    const storedToken = await RefreshToken.findOne({
        tokenHash: refreshTokenHash
    });

    if (!storedToken) {
        throw new ApiError(
            401,
            "Invalid or expired refresh token"
        );
    }

    if (
        storedToken.revoked ||
        storedToken.expiresAt <= new Date()
    ) {
        throw new ApiError(
            401,
            "Invalid or expired refresh token"
        );
    }

    const newAccessToken = generateToken(
        storedToken.user
    );

    const newRefreshToken = generateRefreshToken();

    const newRefreshTokenHash = hashRefreshToken(
        newRefreshToken
    );

    storedToken.revoked = true;
    await storedToken.save();

    await RefreshToken.create({
        user: storedToken.user,
        tokenHash: newRefreshTokenHash,
        expiresAt: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
        )
    });

    return {
        token: newAccessToken,
        refreshToken: newRefreshToken
    };
};

const logoutUserService = async ({
    refreshToken
}) => {

    const refreshTokenHash = hashRefreshToken(
        refreshToken
    );

    const storedToken = await RefreshToken.findOne({
        tokenHash: refreshTokenHash,
        revoked: false
    });

    if (!storedToken) {
        throw new ApiError(
            401,
            "Invalid refresh token"
        );
    }

    storedToken.revoked = true;
    await storedToken.save();

    return;
};

const changePasswordService = async ({
    userId,
    currentPassword,
    newPassword
}) => {

    const user = await User.findById(userId);

    const isCurrentPasswordCorrect = await bcrypt.compare(
        currentPassword,
        user.password
    );

    if (!isCurrentPasswordCorrect) {
        throw new ApiError(
            401,
            "Current password is incorrect"
        );
    }

    const isSamePassword = await bcrypt.compare(
        newPassword,
        user.password
    );

    if (isSamePassword) {
        throw new ApiError(
            400,
            "New password must be different from the current password"
        );
    }

    const hashedPassword = await bcrypt.hash(
        newPassword,
        10
    );

    user.password = hashedPassword;
    user.tokenVersion += 1;

    await user.save();

    await RefreshToken.updateMany(
        {
            user: user._id,
            revoked: false
        },
        {
            $set: {
                revoked: true
            }
        }
    );
};

const forgotPasswordService = async ({
    email
}) => {

    const user = await User.findOne({
        email
    });

    if (!user) {
        return {
            resetToken: null
        };
    }

    const resetToken = generatePasswordResetToken();

    const resetTokenHash = hashPasswordResetToken(
        resetToken
    );

    await PasswordResetToken.create({
        user: user._id,
        tokenHash: resetTokenHash,
        expiresAt: new Date(
            Date.now() + 15 * 60 * 1000
        )
    });

    const resetUrl =
        `http://localhost:5173/reset-password?token=${resetToken}`;

    await sendPasswordResetEmail({
        to: user.email,
        resetUrl
    });

    return {
        resetToken: null
    };
};

const resetPasswordService = async ({
    resetToken,
    newPassword
}) => {

    const tokenHash = hashPasswordResetToken(
        resetToken
    );

    const storedToken = await PasswordResetToken.findOne({
        tokenHash
    });

    if (!storedToken) {
        throw new ApiError(
            401,
            "Invalid or expired reset token"
        );
    }

    if (
        storedToken.used ||
        storedToken.expiresAt <= new Date()
    ) {
        throw new ApiError(
            401,
            "Invalid or expired reset token"
        );
    }

    const user = await User.findById(
        storedToken.user
    );

    if (!user) {
        throw new ApiError(
            404,
            "User not found"
        );
    }

    const isSamePassword = await bcrypt.compare(
        newPassword,
        user.password
    );

    if (isSamePassword) {
        throw new ApiError(
            400,
            "New password must be different from the current password"
        );
    }


    const hashedPassword = await bcrypt.hash(
        newPassword,
        10
    );

    user.password = hashedPassword;
    user.tokenVersion += 1;

    await user.save();

    storedToken.used = true;

    await storedToken.save();

    await RefreshToken.updateMany(
        {
            user: user._id,
            revoked: false
        },
        {
            $set: {
                revoked: true
            }
        }
    );
};

const getCurrentUserService = async ({
    userId
}) => {

    const user = await User.findById(userId)
        .select("-password");

    if (!user) {
        throw new ApiError(
            404,
            "User not found"
        );
    }

    return user;
};

const getSessionsService = async ({
    userId
}) => {

    const sessions = await RefreshToken.find({
        user: userId,
        revoked: false,
        expiresAt: {
            $gt: new Date()
        }
    })
    .select("-tokenHash")
    .sort({ createdAt: -1 });

    return sessions;
};

const revokeSessionService = async ({
    sessionId,
    userId
}) => {

    const session = await RefreshToken.findOne({
        _id: sessionId,
        user: userId,
        revoked: false
    });

    if (!session) {
        throw new ApiError(
            404,
            "Session not found"
        );
    }

    session.revoked = true;

    await session.save();
};

const revokeAllSessionsService = async ({
    userId
}) => {

    await RefreshToken.updateMany(
        {
            user: userId,
            revoked: false
        },
        {
            $set: {
                revoked: true
            }
        }
    );
};

module.exports = {
    registerUserService,
    loginUserService,
    refreshAccessTokenService,
    logoutUserService,
    changePasswordService,
    forgotPasswordService,
    resetPasswordService,
    getCurrentUserService,
    getSessionsService,
    revokeSessionService,
    revokeAllSessionsService

};
const asyncHandler = require("../utils/async-handler");
const ApiError = require("../utils/api-error");
const mongoose = require("mongoose");
const ApiResponse = require("../utils/api-response");
const {
    sendPasswordResetEmail
} = require("../services/email.service");

const {
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
} = require("../services/user.service");



const registerUser = asyncHandler(async(req, res) => {

    const { name, email, password } = req.body;

    const normalizedEmail = email.trim().toLowerCase();

    const { user } = await registerUserService({
        name: name.trim(),
        email: normalizedEmail,
        password
    });

    res.status(201).json(
        new ApiResponse(
            201,
            {
                id: user._id,
                name: user.name,
                email: user.email
            },
            "User registered successfully"
        )
    );



});


const loginUser = asyncHandler(async (req, res) => {

    const { email, password, sessionName} = req.body || {};

    const normalizedSessionName =
        sessionName?.trim() || "Unknown device";



    const normalizedEmail = email.trim().toLowerCase();

    const {
        user,
        token,
        refreshToken
    } = await loginUserService({
        email: normalizedEmail,
        password,
        sessionName: normalizedSessionName
    });

    res.status(200).json(
        new ApiResponse(
            200,
            {
                token,
                refreshToken,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email
                }
            },
            "Login successful"
        )
    );
});

const refreshAccessToken = asyncHandler(async (req, res) => {

    const { refreshToken } = req.body;

    const {
        token,
        refreshToken: newRefreshToken
    } = await refreshAccessTokenService({
        refreshToken
    });

    res.status(200).json(
        new ApiResponse(
            200,
            {
                token,
                refreshToken: newRefreshToken
            },
            "Access token refreshed successfully"
        )
    );

});

const logoutUser = asyncHandler(async (req, res) => {

    const { refreshToken } = req.body;

    await logoutUserService({
        refreshToken
    });

    res.status(200).json(
        new ApiResponse(
            200,
            null,
            "Logout successful"
        )
    );

});

const changePassword = asyncHandler(async (req, res) => {

    const { currentPassword, newPassword } = req.body;

    await changePasswordService({
        userId: req.user.userId,
        currentPassword,
        newPassword
    });

    res.status(200).json(
        new ApiResponse(
            200,
            null,
            "Password changed successfully"
        )
    );

});

const forgotPassword = asyncHandler(async (req, res) => {

    const { email } = req.body || {};

    const normalizedEmail = email.trim().toLowerCase();

    await forgotPasswordService({
        email: normalizedEmail
    });

    res.status(200).json(
        new ApiResponse(
            200,
            null,
            "If an account exists, a password reset link has been sent"
        )
    );
});

const resetPassword = asyncHandler(async (req, res) => {

    const { resetToken, newPassword } = req.body;

    await resetPasswordService({
        resetToken,
        newPassword
    });

    res.status(200).json(
        new ApiResponse(
            200,
            null,
            "Password reset successfully"
        )
    );
});

const getCurrentUser = asyncHandler(async (req, res) => {

    const user = await getCurrentUserService({
        userId: req.user.userId
    });

    res.status(200).json(
        new ApiResponse(
            200,
            user,
            "User fetched successfully"
        )
    );
});

const getSessions = asyncHandler(async (req, res) => {

    const sessions = await getSessionsService({
        userId: req.user.userId
    });

    res.status(200).json(
        new ApiResponse(
            200,
            sessions,
            "Sessions retrieved successfully"
        )
    );
});

const revokeSession = asyncHandler(async (req, res) => {

    const { sessionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
        throw new ApiError(
            400,
            "Invalid session ID"
        );
    }

    await revokeSessionService({
        sessionId,
        userId: req.user.userId
    });

    res.status(200).json(
        new ApiResponse(
            200,
            null,
            "Session revoked successfully"
        )
    );
});

const revokeAllSessions = asyncHandler(async (req, res) => {

    await revokeAllSessionsService({
        userId: req.user.userId
    });

    res.status(200).json(
        new ApiResponse(
            200,
            null,
            "All sessions revoked successfully"
        )
    );
});


module.exports = {

    registerUser,
    loginUser,
    getCurrentUser,
    refreshAccessToken,
    logoutUser,
    changePassword,
    forgotPassword,
    resetPassword,
    getSessions,
    revokeSession,
    revokeAllSessions
};
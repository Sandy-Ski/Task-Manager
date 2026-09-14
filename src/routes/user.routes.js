const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const {
    authLimiter  
} = require("../middlewares/rate-limit.middleware");

const router = express.Router();


const { registerUser, loginUser, getCurrentUser, refreshAccessToken, 
    logoutUser, changePassword, forgotPassword, resetPassword, getSessions,
    revokeSession, revokeAllSessions}
    = require("../controllers/user.controller");



const validate = require("../middlewares/validate.middleware");
const { registerValidation, loginValidation,changePasswordValidation, 
    forgotPasswordValidation, resetPasswordValidation, 
    refreshTokenValidation, logoutValidation} 
    = require("../validators/user.validator");







router.post(
    "/register",
    authLimiter,
    validate(registerValidation),
    registerUser
);

router.post(
    "/login",
    authLimiter,
    validate(loginValidation),
    loginUser
);


router.get("/me", authMiddleware, getCurrentUser);

router.post(
    "/refresh",
    validate(refreshTokenValidation),
    refreshAccessToken
);

router.post(
    "/logout",
    validate(logoutValidation),
    logoutUser
);

router.patch(
    "/password",
    authMiddleware,
    validate(changePasswordValidation),
    changePassword
);

router.post(
    "/forgot-password",
    authLimiter,
    validate(forgotPasswordValidation),
    forgotPassword
);



router.post(
    "/reset-password",
    validate(resetPasswordValidation),
    resetPassword
);


router.get("/sessions", authMiddleware, getSessions);

router.delete(
    "/sessions",
    authMiddleware,
    revokeAllSessions
);

router.delete(
    "/sessions/:sessionId",
    authMiddleware,
    revokeSession
);


module.exports = router;
const jwt = require("jsonwebtoken");
const ApiError = require("../utils/api-error");
const User = require("../models/user.model");

const  authMiddleware = async (req, res, next) => {

    const authHeader = req.headers.authorization;

    if(!authHeader) {
        throw new ApiError(401, "Authentication required");
    }

    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
        throw new ApiError(401, "Invalid authorization header");
    }

    try {

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const user = await User.findById(
            decoded.userId
        );

        if (!user) {
            throw new ApiError(
                401,
                "Invalid or expired token"
            );
        }

        if (user.tokenVersion !== decoded.tokenVersion) {
            throw new ApiError(
                401,
                "Invalid or expired token"
            );
        }

        req.user = decoded;

        next();

} catch (error) {

        throw new ApiError(401, "Invalid or expired token");

    }
};

module.exports = authMiddleware;
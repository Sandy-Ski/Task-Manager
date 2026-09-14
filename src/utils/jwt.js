const jwt = require("jsonwebtoken");

const generateToken = (userId, tokenVersion) => {

    return jwt.sign(
        { 
            userId,
            tokenVersion

         },
        process.env.JWT_SECRET,
        { expiresIn: "60m" }
    );
};

module.exports = generateToken;
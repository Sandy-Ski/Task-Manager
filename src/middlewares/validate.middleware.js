const ApiError = require("../utils/api-error");

const validate = (validationFunction) => {
    return (req, res, next) => {
        const error = validationFunction(req);

        if (error) {
            return next(
                new ApiError(
                    error.statusCode,
                    error.message
                )
            );
        }
        
        next();
    };
};

module.exports = validate;
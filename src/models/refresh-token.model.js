const mongoose = require("mongoose");

const refreshTokenSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        sessionName: {
            type: String,
            trim: true,
            default: "Unknown device"
        },

        tokenHash: {
            type: String,
            required: true
        },

        expiresAt: {
            type: Date,
            required: true
        },

        revoked: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

refreshTokenSchema.index({
    tokenHash: 1
});

const RefreshToken = mongoose.model(
    "RefreshToken",
    refreshTokenSchema
);

module.exports = RefreshToken;
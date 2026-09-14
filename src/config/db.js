const mongoose = require("mongoose");
const config = require("./env");

const connectDB = async () => {
    try {
        await mongoose.connect(config.mongoUri);

        await mongoose.connection.syncIndexes();

        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        throw error;
    }
};

// MongoDB connection events

mongoose.connection.on("connecting", () => {
    console.log("MongoDB connecting...");
});

mongoose.connection.on("disconnected", () => {
    console.log("MongoDB disconnected");
});

mongoose.connection.on("reconnected", () => {
    console.log("MongoDB reconnected");
});

mongoose.connection.on("error", (error) => {
    console.error("MongoDB connection error:", error.message);
});

module.exports = connectDB;
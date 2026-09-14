const app = require("./src/app");
const connectDB = require("./src/config/db");
const mongoose = require("mongoose");
const config = require("./src/config/env");

const PORT = config.port;

let server;

const startServer = async () => {
    try {
        await connectDB();

        server = app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Server startup failed:", error.message);
    }
};

startServer();

process.on("SIGINT", async () => {
    console.log("Shutting down server...");

    if (server) {
        server.close(() => {
            console.log("HTTP server closed");
        });
    }

    await mongoose.connection.close();

    console.log("MongoDB connection closed");

    process.exit(0);
});
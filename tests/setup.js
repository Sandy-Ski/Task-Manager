const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({
    path: ".env.test"
});

beforeAll(async () => {

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("Test database connected");
});


afterAll(async () => {

    await mongoose.connection.close();

    console.log("Test database connection closed");
});
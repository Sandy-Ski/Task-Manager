const mongoose = require("mongoose");

const getHome = (req, res) => {

    res.json({
        success: true,
        message: "Task Manager API is running"
    });

};

const getAbout = (req, res) => {

    res.json({
        success: true,
        message: "This is the Task Manager API"
    });

};

const getHealth = (req, res) => {

    res.status(200).json({
        success: true,
        status: "healthy"
    });

};

const getReadiness = (req, res) => {

    const isDatabaseReady =
        mongoose.connection.readyState === 1;

    if (!isDatabaseReady) {
        return res.status(503).json({
            success: false,
            status: "not ready"
        });
    }

    res.status(200).json({
        success: true,
        status: "ready"
    });

};

module.exports = {

    getHome,
    getAbout,
    getHealth,
    getReadiness

};
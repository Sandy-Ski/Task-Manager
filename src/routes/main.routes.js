const express = require("express");

const router = express.Router();

const {
    getHome,
    getAbout,
    getHealth,
    getReadiness
} = require("../controllers/main.controller");


router.get("/", getHome);

router.get("/about", getAbout);

router.get("/health", getHealth);

router.get("/ready", getReadiness);


module.exports = router;
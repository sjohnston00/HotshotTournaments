const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { protectedRoute } = require("../middlewares/index");

router.post("/updateUser", (req, res) => {});

router.post("/login", (req, res) => {});

module.exports = router;

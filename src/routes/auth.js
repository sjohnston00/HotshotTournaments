const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const controller = require("../controllers/authController");

const { forwardAuthenticated, ensureAuthenticated } = require("../config/auth");

router.get("/register", forwardAuthenticated, controller.get_register);

router.post("/register", controller.post_register);

router.get("/login", forwardAuthenticated, controller.get_login);

router.post("/login", controller.authenticate_passport);

router.get("/logout", controller.get_logout);

module.exports = router;

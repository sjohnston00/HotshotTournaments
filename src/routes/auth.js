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
// //VALIDATE BODY
// const { email, password } = req.body;
// if (!email || !password) {
//   return res.status(401).render("auth/login", {
//     message: "Please fill in all the fields"
//   });
// }
// //MAKE SURE THE EMAIL IN THE BODY IS THE SAME AS ONE IN THE DATABASE
// //COMPARE THE HASHED PASSWORD IN THE DATABASE TO THE PASSWORD IN THE BODY USING BCRYPT
// const userWithEmail = await User.findOne({ email: email });
// if (!userWithEmail) {
//   return res.status(401).render("auth/login", {
//     message: "Invalid Login Credentials"
//   });
// }
// const validPassword = await bcrypt.compare(password, userWithEmail.password);
// if (!validPassword) {
//   return res.status(401).render("auth/login", {
//     message: "Invalid Login Credentials"
//   });
// }

// //CREATE A JSON WEB TOKEN FOR THE USER
// const token = jwt.sign({ _id: userWithEmail._id }, process.env.JWT_SECRET);
// // res.header("accessToken", token);
// res.redirect(
//   `/tournaments/myTournaments/?token=${encodeURIComponent(token)}`
// );

// // res.render("tournaments/myTournaments", {
// //   token: token
// // });
// });

module.exports = router;

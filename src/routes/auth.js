const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const controller = require("../controllers/authController");

const { forwardAuthenticated, ensureAuthenticated } = require("../config/auth");

router.get("/register", forwardAuthenticated, controller.get_register_view);

router.post("/register", controller.post_register_view);

router.get("/login", forwardAuthenticated, controller.get_login_view);

router.post(
  "/login",
  passport.authenticate("local", {
    successReturnToOrRedirect: "/tournaments/myTournaments", //if the login details are correct then redirect to /tournaments/myTournaments
    failureRedirect: "/auth/login", // if the login details are incorrect then redirect to login
    failureFlash: true
  })
);

// Logout
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "You are now logged out"); //give user a log out success message
  res.redirect("/auth/login");
});
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

router.get("/authUserToken", (req, res) => {
  const token = req.header("accessToken");

  if (!token) {
    return res.status(403).send("No user token");
  }

  try {
    const verifiedUser = jwt.verify(token, process.env.JWT_SECRET);
    res.status(200).send("User is verified");
  } catch (error) {
    return res.status(404).send("No user token");
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const controller = require("../controllers/authController");

const { forwardAuthenticated, ensureAuthenticated } = require("../config/auth");

router.get("/register", forwardAuthenticated, controller.show_register);

router.post("/register", async (req, res) => {
  //VALIDATE BODY
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    req.flash("error_msg", "Please fill in all the fields");
    return res.redirect("/auth/register");
  }

  if (password.length < 6) {
    req.flash("error_msg", "Password must be at least 6 characters");
    return res.redirect("/auth/register");
  }

  //VALIDATE THAT THE EMAIL DOESN'T ALREADY EXIST
  const userWithEmail = await User.findOne({ email: email });
  if (userWithEmail) {
    req.flash("error_msg", `A user with ${email} already exists`);
    return res.redirect("/auth/register");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  try {
    const user = new User({
      name: name,
      email: email,
      password: hashedPassword
    });

    const savedUser = await user.save();
    req.flash("success_msg", "Please login with your newly created account");
    res.redirect("/auth/login");
  } catch (error) {
    console.log(error);
    req.flash("error", "Cannot save user to database");
    res.redirect("/auth/login");
  }
});

router.get("/login", forwardAuthenticated, (req, res) => {
  res.render("auth/login");
});

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

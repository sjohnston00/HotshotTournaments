const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.get("/register", (req, res) => {
  res.render("auth/register");
});

router.post("/register", async (req, res) => {
  //VALIDATE BODY
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(401).render("auth/register", {
      message: "Please fill in all fields"
    });
  }

  //VALIDATE THAT THE EMAIL DOESN'T ALREADY EXIST
  const userWithEmail = await User.findOne({ email: email });
  if (userWithEmail) {
    return res.status(401).render("auth/register", {
      message: "A user with that email already exists"
    });
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

    res.status(201).render("auth/login", {
      message: "Please login with your newly created account"
    });
  } catch (error) {
    res.status(500).render("auth/register", {
      message: "An error ocurred, please try again"
    });
  }
});

router.get("/login", (req, res) => {
  const errorMessage = req.query.error;
  res.render("auth/login", {
    message: errorMessage
  });
});

router.post("/login", async (req, res) => {
  //VALIDATE BODY
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(401).render("auth/login", {
      message: "Please fill in all the fields"
    });
  }
  //MAKE SURE THE EMAIL IN THE BODY IS THE SAME AS ONE IN THE DATABASE
  //COMPARE THE HASHED PASSWORD IN THE DATABASE TO THE PASSWORD IN THE BODY USING BCRYPT
  const userWithEmail = await User.findOne({ email: email });
  if (!userWithEmail) {
    return res.status(401).render("auth/login", {
      message: "Invalid Login Credentials"
    });
  }
  const validPassword = await bcrypt.compare(password, userWithEmail.password);
  if (!validPassword) {
    return res.status(401).render("auth/login", {
      message: "Invalid Login Credentials"
    });
  }

  //CREATE A JSON WEB TOKEN FOR THE USER
  const token = jwt.sign({ _id: userWithEmail._id }, process.env.JWT_SECRET);
  // res.header("accessToken", token);
  res.redirect(
    `/tournaments/myTournaments/?token=${encodeURIComponent(token)}`
  );

  // res.render("tournaments/myTournaments", {
  //   token: token
  // });
});

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

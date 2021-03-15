const User = require("../models/User");
const bcrypt = require("bcryptjs");

exports.get_register_view = (req, res) => res.render("auth/register");

exports.post_register_view = async (req, res) => {
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
}

exports.get_login_view = (req, res) => res.render("auth/login");

const LocalStrategy = require("passport-local").Strategy; //using local strategy
//passport has different strategies for logging in for google and facebook sign ins
const bcrypt = require("bcryptjs");
//bcrypt for encrypting and comparing passwords

// Load User model
const User = require("../models/User");

module.exports = function (passport) {
  passport.use(
    new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
      // Make sure that the email is registered
      //The mongoDB findOne() function returns a promise
      User.findOne({
        email: email
      }).then((user) => {
        if (!user) {
          return done(null, false, { message: "Incorrect Email or Password" });
        }

        // If user has a registered email, then run this function
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            //if the hashed passwords match then return the user
            return done(null, user);
          } else {
            //if the passwords dont match then return an error message
            return done(null, false, {
              message: "Incorrect Email or Password"
            });
          }
        });
      });
    })
  );

  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
      done(err, user);
    });
  });
};

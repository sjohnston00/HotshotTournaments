const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    min: 3,
    max: 50
  },
  email: {
    type: String,
    required: true,
    min: 3,
    max: 255,
    unique: true,
    dropDups: true
  },
  password: {
    type: String,
    required: true,
    min: 6,
    max: 255
  },
  accessToken: {
    type: String,
    required: false,
    max: 1024
  },
  emailConfirmed: {
    type: Boolean,
    required: false,
    default: false
  },
  emailConfirmationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date
});

mongoose.set("useCreateIndex", true);
UserSchema.plugin(passportLocalMongoose, { usernameField: "email" });

module.exports = mongoose.model("users", UserSchema);

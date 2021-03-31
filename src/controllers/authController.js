const User = require('../models/User')
const handlers = require('../middlewares/handlers')
const bcrypt = require('bcryptjs')
const passport = require('passport')

exports.get_register = (req, res) => res.render('auth/register')

exports.post_register = async (req, res) => {
  //VALIDATE BODY
  const { name, email, password } = req.body

  if (!name || !email || !password)
    return handlers.response_handler(
      '/auth/register',
      'error_msg',
      'Please fill in all the fields',
      req,
      res
    )

  if (password.length < 6)
    return handlers.response_handler(
      '/auth/register',
      'error_msg',
      'Password must be at least 6 characters',
      req,
      res
    )

  //VALIDATE THAT THE EMAIL DOESN'T ALREADY EXIST
  const userWithEmail = await User.findOne({ email: email })
  if (userWithEmail)
    return handlers.response_handler(
      '/auth/register',
      'error_msg',
      `A user with ${email} already exists`,
      req,
      res
    )

  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(password, salt)

  try {
    const user = new User({
      name: name,
      email: email,
      password: hashedPassword,
      blockedTournaments: []
    })

    const savedUser = await user.save()

    return handlers.response_handler(
      '/auth/login',
      'success_msg',
      'Please login with your newly created account',
      req,
      res
    )
  } catch (error) {
    return handlers.response_handler(
      '/auth/login',
      'error_msg',
      'Cannot save user to database',
      req,
      res,
      error.message
    )
  }
}

exports.get_login = (req, res) => res.render('auth/login')

exports.authenticate_passport = passport.authenticate('local', {
  successReturnToOrRedirect: '/tournaments/myTournaments', //if the login details are correct then redirect to /tournaments/myTournaments
  failureRedirect: '/auth/login', // if the login details are incorrect then redirect to login
  failureFlash: true
})

exports.get_logout = (req, res) => {
  req.logout()

  return handlers.response_handler(
    '/auth/login',
    'success_msg',
    'You are now logged out',
    req,
    res
  )
}

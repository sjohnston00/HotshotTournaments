//Authentication for when users try to access pages that need login access
function ensureAuthenticated(req, res, next) {
  //isAutheticated is a passport function
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(403); //forbidden
  req.flash("error_msg", "Please log in to view that resource");
  res.redirect("/auth/login");
}

//users will be taken fordward to tournaments/myTournaments and skip login if they are already logged in
function forwardAuthenticated(req, res, next) {
  if (!req.isAuthenticated()) {
    return next();
  }
  res.redirect("/tournaments/myTournaments");
}

//Authenticate that this user is part of the tournament
function authUserTournament(user, tournament) {
  return tournament.userId === user._id;
}

module.exports = {
  ensureAuthenticated,
  forwardAuthenticated,
  authUserTournament
};

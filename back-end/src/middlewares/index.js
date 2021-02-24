function protectedRoute(req, res, next) {
  //FOR DEBUGGING PURPOSES
  //TODO: UNCOMMENT IN PRODUCTION
  // if (!req.header("userId") || req.header("accessToken")) {
  //   res.status(403).send("Not Allowed");
  // }
  next();
}

module.exports = {
  protectedRoute: protectedRoute
};

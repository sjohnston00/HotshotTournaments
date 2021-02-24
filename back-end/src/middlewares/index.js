function protectedRoute(req, res, next) {
  if (!req.header("userId") || req.header("accessToken")) {
    res.status(403).send("Not Allowed");
  }

  next();
}

module.exports = {
  protectedRoute: protectedRoute
};

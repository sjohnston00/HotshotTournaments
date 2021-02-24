const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.header("accessToken");

  if (!token) {
    return res
      .status(403)
      .send("Access Denied, please login to get an access token");
  }

  try {
    const isVerified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = isVerified;
  } catch (error) {
    return res
      .status(403)
      .send("Access Denied, please login to get an access token");
  }
  next();
};

module.exports = {
  verifyToken: verifyToken
};

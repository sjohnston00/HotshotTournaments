const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  // const token = req.header("accessToken");
  const token = decodeURIComponent(req.query.token);

  if (!token) {
    return res.redirect(
      `/auth/login/?error=${encodeURIComponent(
        "Access Denied, Please login to access this page"
      )}`
    );
  }

  try {
    const verifiedUser = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verifiedUser;
  } catch (error) {
    return res.redirect(
      `/auth/login/?error=${encodeURIComponent(
        "Access Denied, Please login to access this page"
      )}`
    );
  }
  next();
};

module.exports = {
  verifyToken: verifyToken
};

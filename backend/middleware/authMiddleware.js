const jwt = require("jsonwebtoken");
const env = require("../config/env");

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = req.body?.token || (authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null);

    if (!token) {
      return res.status(401).json({
        success: false,
        msg: "Access denied. Authentication token is missing."
      });
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);
    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        success: false,
        msg: "Invalid token structure."
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    const isExpired = error.name === "TokenExpiredError";
    return res.status(401).json({
      success: false,
      msg: isExpired ? "Session expired. Please log in again." : "Invalid authentication token."
    });
  }
};

module.exports = { verifyToken };

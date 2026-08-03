const mongoose = require("mongoose");

const validateObjectId = (...paramNames) => {
  return (req, res, next) => {
    for (const param of paramNames) {
      const value = req.body[param] || req.params[param] || req.query[param];
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        return res.status(400).json({
          success: false,
          msg: `Invalid format for parameter '${param}'`
        });
      }
    }
    next();
  };
};

const validateRequiredBody = (...requiredFields) => {
  return (req, res, next) => {
    const missing = requiredFields.filter((field) => {
      const val = req.body[field];
      return val === undefined || val === null || (typeof val === "string" && !val.trim());
    });

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        msg: `Missing required field(s): ${missing.join(", ")}`
      });
    }
    next();
  };
};

module.exports = {
  validateObjectId,
  validateRequiredBody
};

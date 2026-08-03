const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { asyncHandler } = require("../middleware/errorMiddleware");
const { validateRequiredBody } = require("../middleware/validationMiddleware");

router.post(
  "/signup",
  validateRequiredBody("username", "name", "email"),
  asyncHandler(authController.signup)
);
router.post(
  "/login",
  validateRequiredBody("email"),
  asyncHandler(authController.login)
);

module.exports = router;

const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const { verifyToken } = require("../middleware/authMiddleware");
const { asyncHandler } = require("../middleware/errorMiddleware");

router.post("/getNotifications", verifyToken, asyncHandler(notificationController.getNotifications));
router.post("/markNotificationsRead", verifyToken, asyncHandler(notificationController.markAsRead));

module.exports = router;

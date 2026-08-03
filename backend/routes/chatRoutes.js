const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const { verifyToken } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const { asyncHandler } = require("../middleware/errorMiddleware");
const { validateObjectId } = require("../middleware/validationMiddleware");

router.post("/getChatMessages", verifyToken, validateObjectId("otherUserId"), asyncHandler(chatController.getChatMessages));
router.post("/getMessages", verifyToken, validateObjectId("otherUserId"), asyncHandler(chatController.getChatMessages));
router.post("/getChatList", verifyToken, asyncHandler(chatController.getChatList));
router.post("/sendMessage", upload.single("image"), verifyToken, asyncHandler(chatController.sendMessage));
router.post("/searchMessages", verifyToken, validateObjectId("otherUserId"), asyncHandler(chatController.searchMessages));

module.exports = router;

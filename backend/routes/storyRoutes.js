const express = require("express");
const router = express.Router();
const storyController = require("../controllers/storyController");
const { verifyToken } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const { asyncHandler } = require("../middleware/errorMiddleware");

router.post("/uploadStory", upload.single("image"), verifyToken, asyncHandler(storyController.uploadStory));
router.post("/getFeedStories", verifyToken, asyncHandler(storyController.getFeedStories));
router.post("/viewStory", verifyToken, asyncHandler(storyController.viewStory));
router.post("/reactStory", verifyToken, asyncHandler(storyController.reactStory));

module.exports = router;

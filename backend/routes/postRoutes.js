const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const { verifyToken } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const { asyncHandler } = require("../middleware/errorMiddleware");
const { validateObjectId } = require("../middleware/validationMiddleware");

router.post("/createPost", upload.single("image"), verifyToken, asyncHandler(postController.createPost));
router.post("/getPosts", verifyToken, asyncHandler(postController.getPosts));
router.post("/getMyPosts", verifyToken, validateObjectId("userId"), asyncHandler(postController.getMyPosts));
router.post("/toggleLike", verifyToken, validateObjectId("postId"), asyncHandler(postController.toggleLike));
router.post("/toggleSavePost", verifyToken, validateObjectId("postId"), asyncHandler(postController.toggleSavePost));
router.post("/getSavedPosts", verifyToken, asyncHandler(postController.getSavedPosts));
router.post("/incrementPostView", verifyToken, validateObjectId("postId"), asyncHandler(postController.incrementPostView));
router.post("/getPostAnalytics", verifyToken, validateObjectId("postId"), asyncHandler(postController.getPostAnalytics));
router.post("/editPost", verifyToken, validateObjectId("postId"), asyncHandler(postController.editPost));
router.post("/deletePost", verifyToken, validateObjectId("postId"), asyncHandler(postController.deletePost));

module.exports = router;

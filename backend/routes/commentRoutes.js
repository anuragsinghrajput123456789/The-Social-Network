const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");
const { verifyToken } = require("../middleware/authMiddleware");
const { asyncHandler } = require("../middleware/errorMiddleware");
const { validateObjectId, validateRequiredBody } = require("../middleware/validationMiddleware");

router.post("/addComment", verifyToken, validateObjectId("postId"), validateRequiredBody("comment"), asyncHandler(commentController.addComment));
router.post("/deleteComment", verifyToken, validateObjectId("postId", "commentId"), asyncHandler(commentController.deleteComment));
router.post("/getComments", validateObjectId("postId"), asyncHandler(commentController.getComments));

module.exports = router;


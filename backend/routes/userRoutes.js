const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { verifyToken } = require("../middleware/authMiddleware");
const { asyncHandler } = require("../middleware/errorMiddleware");
const { validateObjectId } = require("../middleware/validationMiddleware");

router.post("/getUserDetails", verifyToken, validateObjectId("userId"), asyncHandler(userController.getUserDetails));
router.post("/toggleFollow", verifyToken, validateObjectId("userId"), asyncHandler(userController.toggleFollow));
router.post("/acceptFollowRequest", verifyToken, validateObjectId("requesterId"), asyncHandler(userController.acceptFollowRequest));
router.post("/createCollection", verifyToken, asyncHandler(userController.createCollection));
router.post("/getUserCollections", verifyToken, asyncHandler(userController.getUserCollections));
router.post("/updateUserSettings", verifyToken, asyncHandler(userController.updateUserSettings));
router.post("/updateTheme", verifyToken, asyncHandler(userController.updateTheme));
router.post("/getSuggestedUsers", verifyToken, asyncHandler(userController.getSuggestedUsers));
router.post("/getFollowersList", verifyToken, validateObjectId("userId"), asyncHandler(userController.getFollowersList));
router.post("/getFollowingList", verifyToken, validateObjectId("userId"), asyncHandler(userController.getFollowingList));

module.exports = router;

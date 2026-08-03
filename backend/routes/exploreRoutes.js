const express = require("express");
const router = express.Router();
const exploreController = require("../controllers/exploreController");
const { verifyToken } = require("../middleware/authMiddleware");
const { asyncHandler } = require("../middleware/errorMiddleware");

router.post("/getExploreData", verifyToken, asyncHandler(exploreController.getExploreData));

module.exports = router;

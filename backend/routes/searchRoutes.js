const express = require("express");
const router = express.Router();
const searchController = require("../controllers/searchController");
const { verifyToken } = require("../middleware/authMiddleware");
const { asyncHandler } = require("../middleware/errorMiddleware");

router.post("/search", verifyToken, asyncHandler(searchController.search));

module.exports = router;

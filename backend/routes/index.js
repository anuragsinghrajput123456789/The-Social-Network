const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const postRoutes = require("./postRoutes");
const commentRoutes = require("./commentRoutes");
const chatRoutes = require("./chatRoutes");
const notificationRoutes = require("./notificationRoutes");
const searchRoutes = require("./searchRoutes");
const storyRoutes = require("./storyRoutes");
const exploreRoutes = require("./exploreRoutes");

// Health check endpoint
router.get("/", (req, res) => {
  res.json({ success: true, message: "BondBase API is operational" });
});

// Mount modular sub-routers
router.use("/", authRoutes);
router.use("/", userRoutes);
router.use("/", postRoutes);
router.use("/", commentRoutes);
router.use("/", chatRoutes);
router.use("/", notificationRoutes);
router.use("/", searchRoutes);
router.use("/", storyRoutes);
router.use("/", exploreRoutes);

module.exports = router;

const express = require("express");
const { archiveMessages } = require("../controllers/archive");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.get("/", protect, archiveMessages);

module.exports = router;

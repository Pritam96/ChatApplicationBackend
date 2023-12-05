const express = require("express");
const {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
  updateGroupMembers,
} = require("../controllers/chat");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/", protect, accessChat);
router.get("/", protect, fetchChats);
router.post("/group", protect, createGroupChat);
router.put("/rename", protect, renameGroup);
router.put("/groupadd", protect, addToGroup);
router.put("/groupremove", protect, removeFromGroup);
router.put("/groupupdate", protect, updateGroupMembers);

module.exports = router;

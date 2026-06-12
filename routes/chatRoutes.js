const express = require("express");
const {
  accessChat,
  fetchChats,
  createGroupChat,
  removeFromGroup,
  addToGroup,
  renameGroup, clearChat, deleteChat, deleteChatForEveryone,
} = require("../controllers/chatControllers");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").post(protect, accessChat);
router.route("/").get(protect, fetchChats);
router.route("/group").post(protect, createGroupChat);
router.route("/rename").put(protect, renameGroup);
router.route("/groupremove").put(protect, removeFromGroup);
router.route("/groupadd").put(protect, addToGroup);
router.put("/clear/:chatId", protect, clearChat);
router.put("/delete/:chatId", protect, deleteChat);
router.delete("/:chatId", protect, deleteChatForEveryone);

module.exports = router;

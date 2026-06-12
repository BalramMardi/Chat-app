const mongoose = require("mongoose");

const chatModel = mongoose.Schema(
  {
    chatName: { type: String, trim: true },
    isGroupChat: { type: Boolean, default: false },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    groupAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    deletedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    clearedBy: [{
      user:      { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      clearedAt: { type: Date, default: Date.now },
    }],
  },
  { timestamps: true }
);

const Chat = mongoose.model("Chat", chatModel);

module.exports = Chat;

const mongoose = require("mongoose");

const ArchivedMessageSchema = new mongoose.Schema(
  {
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Chat_Id is missing"],
      ref: "Chat",
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Sender_Id is missing"],
      ref: "User",
    },
    content: {
      type: String,
      trim: true,
    },
    fileUrl: {
      type: String,
      trim: true,
    },
    CreatedAt: {
      type: Date,
    },
    UpdatedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ArchivedMessage", ArchivedMessageSchema);

const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");
const Message = require("../models/Message");
const User = require("../models/User");
const Chat = require("../models/Chat");

// @desc    Send message
// @route   POST /api/v1/message
// @access  Private
exports.sendMessage = asyncHandler(async (req, res, next) => {
  const { chatId, content } = req.body;
  if (!chatId || !content) {
    return next(ErrorResponse("Invalid data passed into request", 400));
  }

  let message = await Message.create({
    sender: req.user._id,
    content: content,
    chat: chatId,
  });

  message = await message.populate("sender", "name phone");
  message = await message.populate("chat");
  message = await User.populate(message, {
    path: "chat.users",
    select: "name email phone",
  });

  // Update latest message
  await Chat.findByIdAndUpdate(chatId, {
    latestMessage: message,
  });

  res.status(200).json({
    success: true,
    data: message,
  });
});

// @desc    Get all message of a chat
// @route   GET /api/v1/message/:chatId
// @access  Private
exports.allMessages = asyncHandler(async (req, res, next) => {
  const messages = await Message.find({ chat: req.params.chatId })
    .populate("sender", "name email phone")
    .populate("chat");

  res.status(200).json({
    success: true,
    count: messages.length,
    data: messages,
  });
});

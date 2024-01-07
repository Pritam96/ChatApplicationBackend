const ErrorResponse = require("../utils/errorResponse");
const s3UploadV2 = require("../utils/s3Service");
const Message = require("../models/Message");
const User = require("../models/User");
const Chat = require("../models/Chat");

// @desc    Send message
// @route   POST /api/v1/message
// @access  Private
exports.sendMessage = async (req, res, next) => {
  try {
    const { chatId, content } = req.body;
    const { file } = req;

    let data = {
      sender: req.user._id,
      content: content,
      chat: chatId,
    };

    if (file) {
      if (!file.mimetype.startsWith("image")) {
        return next(new ErrorResponse("Please upload an image file", 400));
      }
      if (file.size > 6000000) {
        return next(
          new ErrorResponse(
            "Image is too large. Please upload an image under 5mb",
            400
          )
        );
      }
      const result = await s3UploadV2(file);
      data = {
        sender: req.user._id,
        fileUrl: result.Location,
        chat: chatId,
      };
    }

    let message = await Message.create(data);

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
  } catch (error) {
    next(error);
  }
};

// @desc    Get all message of a chat
// @route   GET /api/v1/message/:chatId
// @access  Private
exports.allMessages = async (req, res, next) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name email phone")
      .populate("chat");

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};

const ErrorResponse = require("../utils/errorResponse");
const Chat = require("../models/Chat");
const User = require("../models/User");

// @desc    Create or access one-to-one chat
// @route   POST /api/v1/chat
// @access  Private
exports.accessChat = async (req, res, next) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return next(new ErrorResponse("userId is missing", 400));
    }

    let chat = await Chat.find({
      isGroupChat: false,
      $and: [{ users: { $eq: req.user._id } }, { users: { $eq: userId } }],
    })
      .populate("users")
      .populate("latestMessage");

    chat = await User.populate(chat, {
      path: "latestMessage.sender",
      select: "name email phone",
    });

    if (chat.length > 0) {
      return res.status(200).json({
        success: true,
        data: chat[0],
      });
    }

    // Create new one-to-one chat
    let newChat = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    const createdChat = await Chat.create(newChat);
    const fullChat = await Chat.findById(createdChat._id)
      .populate("users")
      .populate("latestMessage");

    res.status(200).json({
      success: true,
      data: fullChat,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all chats of logged in user
// @route   GET /api/v1/chat
// @access  Private
exports.fetchChats = async (req, res, next) => {
  try {
    // Return all chats, that the req.user a part of
    let chats = await Chat.find({
      users: { $eq: req.user._id },
    })
      .populate("users")
      .populate("groupAdmin")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    chats = await User.populate(chats, {
      path: "latestMessage.sender",
      select: "name email phone",
    });

    res.status(200).json({
      success: true,
      count: chats.length,
      data: chats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a group chat
// @route   POST /api/v1/chat/group
// @access  Private
exports.createGroupChat = async (req, res, next) => {
  try {
    if (!req.body.users || !req.body.name) {
      return next(new ErrorResponse("Please provide all required fields", 400));
    }

    let users = JSON.parse(req.body.users);
    if (users.length < 2) {
      return next(
        new ErrorResponse(
          "More than 2 users are required to create a group",
          400
        )
      );
    }

    // Adding req.user to the group
    users.push(req.user);

    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    });

    const fullGroupChat = await Chat.findById(groupChat._id)
      .populate("users")
      .populate("groupAdmin")
      .populate("latestMessage");

    res.status(200).json({
      success: true,
      data: fullGroupChat,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Rename a Group
// @route   PUT /api/v1/chat/rename
// @access  Private
exports.renameGroup = async (req, res, next) => {
  try {
    const { chatId, chatName } = req.body;
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { chatName },
      { new: true } // if we not use this, it going to return the old chatName value
    )
      .populate("users")
      .populate("groupAdmin");

    if (!updatedChat) {
      return next(new ErrorResponse("chatId not found", 400));
    }
    res.status(200).json({
      success: true,
      data: updatedChat,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add users to a group
// @route   PUT /api/v1/chat/groupadd
// @access  Private
exports.addToGroup = async (req, res, next) => {
  try {
    const { chatId, userId } = req.body;
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        $push: { users: userId },
      },
      { new: true }
    )
      .populate("users")
      .populate("groupAdmin");

    if (!updatedChat) {
      return next(new ErrorResponse("chatId not found", 400));
    }
    res.status(200).json({
      success: true,
      data: updatedChat,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove users from a group
// @route   PUT /api/v1/chat/groupremove
// @access  Private
exports.removeFromGroup = async (req, res, next) => {
  try {
    const { chatId, userId } = req.body;
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        $pull: { users: userId },
      },
      { new: true }
    )
      .populate("users")
      .populate("groupAdmin");

    if (!updatedChat) {
      return next(new ErrorResponse("chatId not found", 400));
    }
    res.status(200).json({
      success: true,
      data: updatedChat,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update group members
// @route   PUT /api/v1/chat/groupupdate
// @access  Private
exports.updateGroupMembers = async (req, res, next) => {
  try {
    const { chatId, updatedUsers } = req.body;

    let users = JSON.parse(updatedUsers);

    // Adding req.user to the group
    users.push(req.user);

    const groupChat = await Chat.findByIdAndUpdate(chatId, {
      users,
    });

    const fullGroupChat = await Chat.findById(groupChat._id)
      .populate("users")
      .populate("groupAdmin")
      .populate("latestMessage");

    res.status(200).json({
      success: true,
      data: fullGroupChat,
    });
  } catch (error) {
    next(error);
  }
};

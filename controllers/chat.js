const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Chat = require('../models/Chat');
const User = require('../models/User');

// @desc    Create or access one-to-one chat
// @route   POST /api/v1/chat
// @access  Private
exports.accessChat = asyncHandler(async (req, res, next) => {
  const { userId } = req.body;
  if (!userId) {
    return next(new ErrorResponse('userId is missing', 400));
  }

  let chat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate('users')
    .populate('latestMessage');

  chat = await User.populate(chat, {
    path: 'latestMessage.sender',
    select: 'name email phone',
  });

  if (chat.length > 0) {
    return res.status(200).json({
      success: true,
      data: chat[0],
    });
  }

  // Create new one-to-one chat
  let newChat = {
    chatName: 'sender',
    isGroupChat: false,
    users: [req.user._id, userId],
  };

  const createdChat = await Chat.create(newChat);
  const fullChat = await Chat.findOne({ _id: createdChat._id })
    .populate('users')
    .populate('latestMessage');

  res.status(200).json({
    success: true,
    data: fullChat,
  });
});

// @desc    Get all chats of logged in user
// @route   GET /api/v1/chat
// @access  Private
exports.fetchChats = asyncHandler(async (req, res, next) => {
  // Return all chats, that the req.user a part of
  let chats = await Chat.find({
    users: { $elemMatch: { $eq: req.user._id } },
  })
    .populate('users')
    .populate('groupAdmin')
    .populate('latestMessage')
    .sort({ updatedAt: -1 });

  chats = await User.populate(chats, {
    path: 'latestMessage.sender',
    select: 'name email phone',
  });

  res.status(200).json({
    success: true,
    data: chats,
  });
});

// @desc    Create a group chat
// @route   POST /api/v1/chat/group
// @access  Private
exports.createGroupChat = asyncHandler(async (req, res, next) => {
  if (!req.body.users || !req.body.name) {
    return next(new ErrorResponse('Please provide all required fields', 400));
  }

  let users = JSON.parse(req.body.users);
  if (users.length < 2) {
    return next(
      new ErrorResponse('More than 2 users are required to create a group', 400)
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

  const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
    .populate('users')
    .populate('groupAdmin')
    .populate('latestMessage');

  res.status(200).json({
    success: true,
    data: fullGroupChat,
  });
});

// @desc    Rename a Group
// @route   PUT /api/v1/chat/rename
// @access  Private
exports.renameGroup = asyncHandler(async (req, res, next) => {
  const { chatId, chatName } = req.body;
  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    { chatName },
    { new: true } // if we not use this, it going to return the old chatName value
  )
    .populate('users')
    .populate('groupAdmin');

  if (!updatedChat) {
    return next(new ErrorResponse('chatId not found', 400));
  }
  res.status(200).json({
    success: true,
    data: updatedChat,
  });
});

// @desc    Add users to a group
// @route   PUT /api/v1/chat/groupadd
// @access  Private
exports.addToGroup = asyncHandler(async (req, res, next) => {
  const { chatId, userId } = req.body;
  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: { users: userId },
    },
    { new: true }
  )
    .populate('users')
    .populate('groupAdmin');

  if (!updatedChat) {
    return next(new ErrorResponse('chatId not found', 400));
  }
  res.status(200).json({
    success: true,
    data: updatedChat,
  });
});

// @desc    Remove users from a group
// @route   PUT /api/v1/chat/groupremove
// @access  Private
exports.removeFromGroup = asyncHandler(async (req, res, next) => {
  const { chatId, userId } = req.body;
  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: { users: userId },
    },
    { new: true }
  )
    .populate('users')
    .populate('groupAdmin');

  if (!updatedChat) {
    return next(new ErrorResponse('chatId not found', 400));
  }
  res.status(200).json({
    success: true,
    data: updatedChat,
  });
});

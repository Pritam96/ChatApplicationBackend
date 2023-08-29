const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const User = require('../models/User');

// @desc    Get current logged in user
// @route   GET /api/v1/user/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Search user
// @route   GET /api/v1/user?search=keyword
// @access  Private
exports.allUsers = asyncHandler(async (req, res, next) => {
  let keyword = {};
  if (req.query.search) {
    keyword = {
      $or: [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
      ],
    };
  }
  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  res.status(200).json({
    success: true,
    data: users,
  });
});

const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");

// @desc    Get current logged in user
// @route   GET /api/v1/user/me
// @access  Private
exports.getMe = async (req, res, next) => {
  const user = req.user;

  if (!user) return next(new ErrorResponse("User is not authorized", 404));

  res.status(200).json({
    success: true,
    data: user,
  });
};

// @desc    Search user
// @route   GET /api/v1/user?search=keyword
// @access  Private
exports.allUsers = async (req, res, next) => {
  try {
    let keyword = {};
    if (req.query.search) {
      keyword = {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      };
    }
    const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

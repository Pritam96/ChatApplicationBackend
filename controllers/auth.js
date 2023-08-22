const User = require('../models/User');

// @desc    Register user
// @route   GET /api/v1/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;

    // Create user
    const user = await User.create({ name, email, phone, password });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

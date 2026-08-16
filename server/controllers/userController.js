const User = require('../models/User');

// सभी यूजर प्राप्त करें
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } }).select(
      'name email avatar status lastSeen bio'
    );

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// यूजर प्रोफाइल प्राप्त करें
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select(
      'name email avatar status lastSeen bio'
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'यूजर नहीं मिला',
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// यूजर प्रोफाइल अपडेट करें
exports.updateUserProfile = async (req, res) => {
  try {
    const { name, bio, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, bio, avatar },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'प्रोफाइल अपडेट हो गया!',
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

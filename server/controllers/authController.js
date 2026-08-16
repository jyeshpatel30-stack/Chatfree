const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// रजिस्टर करें
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'कृपया सभी फील्ड भरें',
      });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: 'यूजर पहले से मौजूद है',
      });
    }

    user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'रजिस्ट्रेशन सफल!',
      token,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// लॉगिन करें
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'कृपया ईमेल और पासवर्ड दें',
      });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'अमान्य ईमेल या पासवर्ड',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'अमान्य ईमेल या पासवर्ड',
      });
    }

    const token = generateToken(user._id);
    user.status = 'online';
    await user.save();

    res.status(200).json({
      success: true,
      message: 'लॉगिन सफल!',
      token,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// प्रोफाइल प्राप्त करें
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
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

// लॉगआउट करें
exports.logout = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.status = 'offline';
    user.lastSeen = Date.now();
    await user.save();

    res.status(200).json({
      success: true,
      message: 'लॉगआउट सफल!',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

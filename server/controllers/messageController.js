const Message = require('../models/Message');
const User = require('../models/User');
const Group = require('../models/Group');

// सभी मैसेज प्राप्त करें
exports.getMessages = async (req, res) => {
  try {
    const { userId } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id },
      ],
      deletedBy: { $ne: req.user._id },
    })
      .populate('sender', 'name email avatar')
      .populate('receiver', 'name email avatar')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// मैसेज भेजें
exports.sendMessage = async (req, res) => {
  try {
    const { content, receiver } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'मैसेज खाली नहीं हो सकता',
      });
    }

    const message = await Message.create({
      sender: req.user._id,
      receiver,
      content,
    });

    await message.populate('sender', 'name email avatar');
    await message.populate('receiver', 'name email avatar');

    res.status(201).json({
      success: true,
      message: 'मैसेज भेजा गया!',
      data: message,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// मैसेज हटाएं
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'मैसेज नहीं मिला',
      });
    }

    if (!message.deletedBy.includes(req.user._id)) {
      message.deletedBy.push(req.user._id);
    }

    if (message.deletedBy.length === 2) {
      await Message.findByIdAndDelete(messageId);
    } else {
      await message.save();
    }

    res.status(200).json({
      success: true,
      message: 'मैसेज हटाया गया!',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ग्रुप मैसेज प्राप्त करें
exports.getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;

    const messages = await Message.find({ group: groupId })
      .populate('sender', 'name email avatar')
      .populate('group', 'name')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

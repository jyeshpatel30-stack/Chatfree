const express = require('express');
const {
  getMessages,
  sendMessage,
  deleteMessage,
  getGroupMessages,
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/:userId', getMessages);
router.post('/send/:userId', sendMessage);
router.delete('/:messageId', deleteMessage);
router.get('/group/:groupId', getGroupMessages);

module.exports = router;

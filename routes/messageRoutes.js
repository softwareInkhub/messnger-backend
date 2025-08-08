const express = require('express');
const MessageController = require('../controllers/messageController');

const router = express.Router();

// Send a new message
router.post('/sendMessage', MessageController.sendMessage);

// Get all messages
router.get('/getMessages', MessageController.getMessages);

// Get messages by sender
router.get('/messages/sender/:senderId', MessageController.getMessagesBySender);

// Get messages by receiver
router.get('/messages/receiver/:receiverId', MessageController.getMessagesByReceiver);

module.exports = router;

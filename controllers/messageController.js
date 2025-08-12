const Message = require('../models/Message');
const { validateMessageInput } = require('../validators/messageValidator');

class MessageController {
  // Send a new message
  static async sendMessage(req, res) {
    try {
      console.log('📨 Send message request received');
      console.log('📨 Request body:', JSON.stringify(req.body, null, 2));
      console.log('📨 Request headers:', req.headers);

      // Validate input
      const validation = validateMessageInput(req.body);
      if (!validation.isValid) {
        console.error('❌ Validation failed:', validation.errors);
        return res.status(400).json({
          error: 'Validation failed',
          details: validation.errors
        });
      }

      console.log('✅ Validation passed, creating message...');

      // Create message instance
      const message = new Message(req.body);
      message.validate();

      console.log('✅ Message validated, saving to database...');

      // Save message to database
      const savedMessage = await message.save();

      console.log('✅ Message saved successfully:', savedMessage.id);

      return res.status(200).json({
        message: 'Message sent successfully',
        data: savedMessage
      });

    } catch (error) {
      console.error('❌ Send message error:', error);
      console.error('❌ Error stack:', error.stack);
      
      return res.status(500).json({
        error: 'Failed to send message',
        details: error.message
      });
    }
  }

  // Get all messages
  static async getMessages(req, res) {
    try {
      console.log('📝 Get messages request');
      
      const { limit = 50 } = req.query;
      
      // Validate limit parameter
      const parsedLimit = parseInt(limit);
      if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
        return res.status(400).json({
          error: 'Invalid limit parameter. Must be between 1 and 100'
        });
      }

      // Get messages from database
      const messages = await Message.getAll(parsedLimit);

      console.log('✅ Retrieved messages successfully:', messages.length);

      return res.status(200).json({
        message: 'Messages retrieved successfully',
        data: messages,
        count: messages.length
      });

    } catch (error) {
      console.error('❌ Get messages error:', error);
      
      return res.status(500).json({
        error: 'Failed to get messages',
        details: error.message
      });
    }
  }

  // Get messages by sender
  static async getMessagesBySender(req, res) {
    try {
      const { senderId } = req.params;
      const { limit = 50 } = req.query;

      if (!senderId) {
        return res.status(400).json({
          error: 'senderId parameter is required'
        });
      }

      const messages = await Message.getBySender(senderId, parseInt(limit));

      return res.status(200).json({
        message: 'Messages retrieved successfully',
        data: messages,
        count: messages.length
      });

    } catch (error) {
      console.error('❌ Get messages by sender error:', error);
      
      return res.status(500).json({
        error: 'Failed to get messages by sender',
        details: error.message
      });
    }
  }

  // Get messages by receiver
  static async getMessagesByReceiver(req, res) {
    try {
      const { receiverId } = req.params;
      const { limit = 50 } = req.query;

      if (!receiverId) {
        return res.status(400).json({
          error: 'receiverId parameter is required'
        });
      }

      const messages = await Message.getByReceiver(receiverId, parseInt(limit));

      return res.status(200).json({
        message: 'Messages retrieved successfully',
        data: messages,
        count: messages.length
      });

    } catch (error) {
      console.error('❌ Get messages by receiver error:', error);
      
      return res.status(500).json({
        error: 'Failed to get messages by receiver',
        details: error.message
      });
    }
  }
}

module.exports = MessageController;

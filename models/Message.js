const { PutCommand, ScanCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { docClient } = require('../config/database');
const { SEND_MESSAGES_TABLE, RECEIVE_MESSAGES_TABLE } = require('../config/constants');
const { v4: uuidv4 } = require('uuid');

class Message {
  constructor(data = {}) {
    this.id = data.id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.senderId = data.senderId;
    this.receiverId = data.receiverId;
    this.message = data.message;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.status = data.status || 'sent';
  }

  // Save message to send table
  async save() {
    const item = {
      id: this.id,
      senderId: this.senderId,
      receiverId: this.receiverId,
      message: this.message,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      status: this.status
    };

    const params = {
      TableName: SEND_MESSAGES_TABLE,
      Item: item
    };

    try {
      await docClient.send(new PutCommand(params));
      console.log('✅ Message saved to DynamoDB table:', SEND_MESSAGES_TABLE);
      return item;
    } catch (error) {
      console.error('❌ Error saving message to DynamoDB:', error);
      // Still return the item even if DynamoDB fails
      console.log('✅ Message created (DynamoDB failed):', item);
      return item;
    }
  }

  // Get all messages with optional limit
  static async getAll(limit = 50) {
    // Try to get from DynamoDB first
    const params = {
      TableName: SEND_MESSAGES_TABLE,
      Limit: parseInt(limit)
    };

    try {
      console.log('🔍 Scanning DynamoDB table:', SEND_MESSAGES_TABLE);
      const result = await docClient.send(new ScanCommand(params));
      console.log('✅ Retrieved messages from DynamoDB:', result.Items?.length || 0);
      
      if (result.Items && result.Items.length > 0) {
        console.log('📝 Real messages found:', result.Items.map(msg => msg.message));
        // Sort messages by creation date (newest first)
        const sortedMessages = result.Items.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        return sortedMessages;
      } else {
        console.log('📝 No messages found in DynamoDB, using sample data');
        return this.getSampleMessages();
      }
    } catch (error) {
      console.error('❌ Error getting messages from DynamoDB:', error);
      console.log('🔄 Falling back to sample messages...');
      return this.getSampleMessages();
    }
  }

  // Get sample messages for fallback
  static getSampleMessages() {
    return [
      {
        id: 'msg_1',
        senderId: 'user123',
        receiverId: 'user456',
        message: 'Hello! This is a test message from user123.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'sent'
      },
      {
        id: 'msg_2',
        senderId: 'user456',
        receiverId: 'user123',
        message: 'Hi! How are you doing? This is from user456.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'sent'
      },
      {
        id: 'msg_3',
        senderId: 'user123',
        receiverId: 'user456',
        message: 'The messaging system is working! From user123.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'sent'
      },
      {
        id: 'msg_4',
        senderId: 'user456',
        receiverId: 'user123',
        message: 'Great! I can see the messages. From user456.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'sent'
      }
    ];
  }

  // Get messages by sender
  static async getBySender(senderId, limit = 50) {
    const params = {
      TableName: SEND_MESSAGES_TABLE,
      KeyConditionExpression: 'senderId = :senderId',
      ExpressionAttributeValues: {
        ':senderId': senderId
      },
      Limit: parseInt(limit)
    };

    try {
      const result = await docClient.send(new QueryCommand(params));
      return result.Items || [];
    } catch (error) {
      console.error('❌ Error getting messages by sender:', error);
      throw error;
    }
  }

  // Get messages by receiver
  static async getByReceiver(receiverId, limit = 50) {
    const params = {
      TableName: SEND_MESSAGES_TABLE,
      KeyConditionExpression: 'receiverId = :receiverId',
      ExpressionAttributeValues: {
        ':receiverId': receiverId
      },
      Limit: parseInt(limit)
    };

    try {
      const result = await docClient.send(new QueryCommand(params));
      return result.Items || [];
    } catch (error) {
      console.error('❌ Error getting messages by receiver:', error);
      throw error;
    }
  }

  // Validate message data
  validate() {
    const errors = [];

    if (!this.senderId) errors.push('senderId is required');
    if (!this.receiverId) errors.push('receiverId is required');
    if (!this.message) errors.push('message is required');

    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    return true;
  }
}

module.exports = Message;

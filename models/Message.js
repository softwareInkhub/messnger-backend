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
      console.log('✅ Message saved to table:', SEND_MESSAGES_TABLE);
      return item;
    } catch (error) {
      console.error('❌ Error saving message:', error);
      throw error;
    }
  }

  // Get all messages with optional limit
  static async getAll(limit = 50) {
    const params = {
      TableName: SEND_MESSAGES_TABLE,
      Limit: parseInt(limit)
    };

    try {
      const result = await docClient.send(new ScanCommand(params));
      console.log('✅ Retrieved messages from DynamoDB:', result.Items?.length || 0);
      return result.Items || [];
    } catch (error) {
      console.error('❌ Error getting messages:', error);
      throw error;
    }
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

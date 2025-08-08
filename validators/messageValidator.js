const Joi = require('joi');

// Message validation schema
const messageSchema = Joi.object({
  senderId: Joi.string().required().min(1).max(100).messages({
    'string.empty': 'senderId cannot be empty',
    'string.min': 'senderId must be at least 1 character long',
    'string.max': 'senderId cannot exceed 100 characters',
    'any.required': 'senderId is required'
  }),
  
  receiverId: Joi.string().required().min(1).max(100).messages({
    'string.empty': 'receiverId cannot be empty',
    'string.min': 'receiverId must be at least 1 character long',
    'string.max': 'receiverId cannot exceed 100 characters',
    'any.required': 'receiverId is required'
  }),
  
  message: Joi.string().required().min(1).max(1000).messages({
    'string.empty': 'message cannot be empty',
    'string.min': 'message must be at least 1 character long',
    'string.max': 'message cannot exceed 1000 characters',
    'any.required': 'message is required'
  })
});

// Validate message input
function validateMessageInput(data) {
  const { error, value } = messageSchema.validate(data, { 
    abortEarly: false,
    allowUnknown: false
  });

  if (error) {
    return {
      isValid: false,
      errors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    };
  }

  return {
    isValid: true,
    data: value
  };
}

// Validate query parameters
function validateQueryParams(params) {
  const querySchema = Joi.object({
    limit: Joi.number().integer().min(1).max(100).default(50).messages({
      'number.base': 'limit must be a number',
      'number.integer': 'limit must be an integer',
      'number.min': 'limit must be at least 1',
      'number.max': 'limit cannot exceed 100'
    })
  });

  const { error, value } = querySchema.validate(params, {
    abortEarly: false,
    allowUnknown: true
  });

  if (error) {
    return {
      isValid: false,
      errors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    };
  }

  return {
    isValid: true,
    data: value
  };
}

module.exports = {
  validateMessageInput,
  validateQueryParams,
  messageSchema
};

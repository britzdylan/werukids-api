const Joi = require('joi');

const userSignUpValidation = Joi.object({
  first_name: Joi.string().min(1).max(72),
  last_name: Joi.string().min(1).max(72),
  email: Joi.string().min(5).max(255).required().email(),
  profiles: Joi.array().items(
    Joi.object({
      name: Joi.string().min(1).max(72),
      age: Joi.string(),
      avatar: Joi.string(),
      primary_language: Joi.number(),
    })
  ),
  subscription_started: Joi.string(),
  terms_agreed_date: Joi.string(),
  terms_version: Joi.string(),
});

module.exports = userSignUpValidation;

const express = require('express');
const router = express.Router();
const asyncMiddleware = require('../middleware/async');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
const User = require('../models/user');

const userSignUpValidation = require('../validation/user-signup');

//functions
const {
  generateCode,
  validateCode,
  saveUpdateuser,
  setResetState,
} = require('../utils/emailValidation');
const { sendWelcomeEmail } = require('../services/sendgrid');

/***********
@ Create Account
@ Auth: false
***********/
router.post(
  '/create',
  asyncMiddleware(async (req, res) => {
    //check if user exists
    const userPresent = await User.findOne({
      email: req.body.email,
    });
    // if exists return user
    if (userPresent) {
      res.status(409).json(userPresent);
      return;
    }
    //if no user then create new User
    //generate random code
    const code = await generateCode();
    //create new user
    const newUser = await User.create({
      email: req.body.email,
      validation_code: code,
    });
    // email code to user
    let email = await sendWelcomeEmail(req.body.email, code);

    if (email[0].statusCode != 202) {
      throw new Error(email);
    }
    res.status(201).json({ user: newUser.email });
    return true;
  })
);
/***********
@ Verify Code
@ Auth: false
***********/
router.post(
  '/code/verify',
  asyncMiddleware(async (req, res) => {
    //check if user exists
    let user = await User.findOne({
      email: req.body.email,
    });

    if (user === null) {
      throw new Error('User does not exist');
    }

    //validate code
    const validCode = await validateCode(user, req.body.code);
    if (!validCode) {
      throw new Error('Invalid code');
    }
    //validate email and remove code
    user = await saveUpdateuser(user);

    res.status(202).json({ user: user });
  })
);
/***********
@ resend Code
@ Auth: false
***********/
router.post(
  '/code/send',
  asyncMiddleware(async (req, res) => {
    //check if user exists
    let user = await User.findOne({
      email: req.body.email,
    });

    if (user === null) {
      throw new Error('User does not exist');
    }

    if (user.password != null && user.validation_code == null) {
      throw new Error('No paswword reset was requested for this account');
    }

    //generate random code
    const code = await generateCode();
    //update user
    user.validation_code = code;
    updatedUser = await user.save();

    //return
    if (!updatedUser) {
      throw new Error('Database error');
    }
    // email code to user
    let email = await sendWelcomeEmail(req.body.email, code);

    if (email[0].statusCode != 202) {
      throw new Error(email);
    }

    res.status(202).send('code resent');
  })
);
/***********
@ Add Password
@ Auth: false
***********/
router.post(
  '/password/update',
  asyncMiddleware(async (req, res) => {
    if (
      !req.body.password ||
      req.body.password == null ||
      req.body.password == ''
    ) {
      throw new Error('Invalid password');
    }
    //check if user exists
    let user = await User.findOne({
      email: req.body.email,
    });

    if (user === null) {
      throw new Error('User does not exist');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    user.password = hashedPassword;
    user.account_finalized = true;
    user = await user.save();
    // auth user and send back token
    res.status(202).send('Password succesfully updated');
  })
);
/***********
@ Sign Up
@ Auth: false
***********/
router.post(
  '/signup',
  asyncMiddleware(async (req, res) => {
    const { error, value } = userSignUpValidation.validate(req.body);
    if (error === undefined) {
      // check if user already exists
      const user = await User.findOne({ email: req.body.email });

      if (user === null) {
        throw new Error('User does not exist');
      }

      const updatedUser = await User.findOneAndUpdate(
        { _id: user._id },
        { $set: value },
        { new: true }
      ).select('-password -validation_code');
      res.status(200).json(updatedUser);
    }

    //handle Joi error
    if (error) {
      throw new Error(error);
    }
  })
);
/***********
@ Login
@ Auth: false
***********/
router.post(
  '/reset',
  asyncMiddleware(async (req, res) => {
    return true;
  })
);

module.exports = router;

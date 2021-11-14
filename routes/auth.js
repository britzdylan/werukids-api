const express = require('express');
const router = express.Router();
const asyncMiddleware = require('../middleware/async');
const userEmailCheck = require('../middleware/user-email-check');
const auth = require('../middleware/auth');

const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
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
    if (!req.body.email || req.body.email == '' || req.body.email == null) {
      res.status(400).send('Invalid Email');
      return;
    }
    //check if user exists
    const userPresent = await User.findOne({
      email: req.body.email,
    });
    // if exists return user
    if (userPresent) {
      res.status(200).json(userPresent);
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
  '/login',
  userEmailCheck,
  asyncMiddleware(async (req, res) => {
    // unhash & compare password
    const match = await bcrypt.compare(req.body.password, req.user.password);

    if (!match) {
      throw new Error('Invalid password');
    }
    ///find user and return user
    const user = await User.findById(req.user._id).select(
      '-password -email_verified  -validation_code'
    );
    // console.log(user);
    //create jwt
    const data = { id: user._id };
    const accessToken = jwt.sign(data, process.env.JWT_SECRET_KEY);
    //send back jwt
    res.status(200).json({ token: accessToken });
  })
);

/***********
@ logout
@ Auth: false
***********/
router.post(
  '/logout',
  auth,
  asyncMiddleware(async (req, res) => {
    //create jwt
    var older_token = jwt.sign(
      { data: null, iat: Math.floor(Date.now() / 1000) - 30 },
      process.env.JWT_SECRET_KEY
    );

    //send back jwt
    res.status(200).send('sign out succesfull');
  })
);

/***********
@ request reset
@ Auth: true
***********/
router.post(
  '/reset',
  asyncMiddleware(async (req, res) => {
    //find the user
    let user = await User.findOne({
      email: req.body.email,
    });

    if (user === null) {
      res.status(404).send('User does not exist');
      return;
    }
    //set email to unverified
    user.email_verified = false;
    //set password to null
    user.password = uuidv4();
    //genereate and email a new code
    const code = await generateCode();
    let email = await sendWelcomeEmail(user.email, code); //TODO reset email
    if (email[0].statusCode != 202) {
      throw new Error(email);
    }

    user.validation_code = code;
    user = await user.save();
    if (!user) {
      throw new Error('DB Error');
    }
    res.status(202).send('Password reset request sent succesfully');
  })
);

module.exports = router;

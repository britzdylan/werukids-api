const express = require('express');
const router = express.Router();
const asyncMiddleware = require('../middleware/async');
const auth = require('../middleware/auth');

const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Subcsription = require('../models/subscription');
// functions
const { deactivate } = require('../services/paystack');
/***********
@ Get User
@ Auth: true
***********/
router.get(
  '/',
  auth,
  asyncMiddleware(async (req, res) => {
    const user = await User.findById(req.id).select(
      '-password -email_verified  -validation_code'
    );

    if (!user) {
      res.status(404).send('User does not exist');

      return;
    }

    res.status(200).json({ user: user });
  })
);
/***********
@ Update user names
@ Auth: true
***********/
router.post(
  '/update',
  auth,
  asyncMiddleware(async (req, res) => {
    const user = await User.findById(req.id);

    if (!user) {
      res.status(404).send('User does not exist');
      return;
    }
    const updatedUser = await User.findOneAndUpdate(
      { _id: req.id },
      {
        $set: req.body.data,
      },
      { new: true, timeStamps: false }
    );

    if (updatedUser instanceof Error) {
      res.status(500).send(updatedUser);
      return;
    }
    res.status(200).send('Update success');
  })
);

/***********
@ Update user notification preferences
@ Auth: true
***********/
router.post(
  '/update/notifications',
  auth,
  asyncMiddleware(async (req, res) => {
    const user = await User.findById(req.id);

    if (!user) {
      res.status(404).send('User does not exist');
      return;
    }
    const updatedUser = await User.findOneAndUpdate(
      { _id: req.id },
      {
        $set: req.body,
      },
      { new: true, timeStamps: false }
    );

    if (updatedUser instanceof Error) {
      res.status(500).send(updatedUser);
      return;
    }
    res.status(200).send('Update success');
  })
);

/***********
@ Detel User
@ Auth: true
***********/
router.delete(
  '/delete',
  auth,
  asyncMiddleware(async (req, res) => {
    const user = await User.findById(req.id);

    if (!user) {
      res.status(404).send('User does not exist');

      return;
    }
    console.log(req.body);
    let subs = await deactivate(req.body.code);
    if (subs instanceof Error) {
      res.status(500).send(subs);
      return;
    }
    const del = user.delete();
    if (del instanceof Error) {
      res.status(500).send(del);
      return;
    }

    res.status(200).json('account successfully removed');
  })
);

module.exports = router;

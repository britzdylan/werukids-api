const express = require('express');
const router = express.Router();
const asyncMiddleware = require('../middleware/async');
const auth = require('../middleware/auth');

const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

/***********
@ Get User
@ Auth: true
***********/
router.get(
  '/',
  auth,
  asyncMiddleware(async (req, res) => {
    const user = await User.findById(req.id).select(
      '-password -email_verified  -validation_code -_id'
    );

    if (!user) {
      res.status(404).send('User does not exist');

      return;
    }

    res.status(200).json({ user: user });
  })
);

module.exports = router;

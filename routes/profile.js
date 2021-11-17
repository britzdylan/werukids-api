const express = require('express');
const router = express.Router();
const asyncMiddleware = require('../middleware/async');
const auth = require('../middleware/auth');

const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

/***********
@ Add New Profile
@ Auth: true
***********/
router.post(
  '/add',
  auth,
  asyncMiddleware(async (req, res) => {
    const user = await User.findById(req.id);

    if (!user) {
      res.status(404).send('User does not exist');

      return;
    }

    //add project id to client
    const updatedUser = await User.findOneAndUpdate(
      { _id: req.id },
      { $push: { profiles: req.body.profile } },
      { new: true, timeStamps: false }
    );

    if (updatedUser instanceof Error) {
      res.status(500).send(updatedUser);
      throw new Error(updatedUser);
    }

    res.status(200).send('Profile added successfully');
  })
);

/***********
@ Update Profile
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
      { _id: req.id, profiles: { $elemMatch: { _id: req.body.id } } },
      {
        $set: {
          'profiles.$.name': req.body.data.name,
          'profiles.$.age': req.body.data.age,
          'profiles.$.avatar': req.body.data.avatar,
          'profiles.$.primary_language': req.body.data.primary_language,
        },
      },
      { new: true, timeStamps: false }
    );

    if (updatedUser instanceof Error) {
      res.status(500).send(updatedUser);
      throw new Error(updatedUser);
    }

    res.status(200).send('Profile Updated successfully');
  })
);

/***********
@ Delete Profile
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

    const updatedUser = await User.findOneAndUpdate(
      { _id: req.id },
      { $pull: { profiles: { _id: req.body.id } } },
      { new: true, timeStamps: false }
    );

    if (updatedUser instanceof Error) {
      res.status(500).send(updatedUser);
      throw new Error(updatedUser);
    }

    res.status(200).send('Profile Deleted successfully');
  })
);
module.exports = router;

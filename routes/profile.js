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

/***********
@ profile tracking
@ Auth: true
***********/
router.post(
  '/track/books',
  auth,
  asyncMiddleware(async (req, res) => {
    // validate
    const user = await User.findById(req.id);
    if (!user) {
      res.status(404).send('User does not exist');

      return;
    }
    // look for profile
    const profile = user.profiles.filter(
      (profile) => profile._id == req.body.id
    );
    if (profile.length < 1) {
      res.status(500).send('The profile does not exist');
      return;
    }

    // declare variables
    const current_profile = profile[0];
    const current_level = current_profile.level;
    const total_stars = current_profile.total_stars;
    const next_level_requirements = 3 + Math.pow(current_level, 2.6);
    const did_level = total_stars + 3 >= next_level_requirements ? true : false;
    const total_books_read = current_profile.books_read + 1;
    const earned_badges = [];

    // update stars
    current_profile.total_stars = total_stars + 3;
    // update books_read
    current_profile.books_read = total_books_read;

    // check if any badge was earned
    current_profile.badges_earned.map((item) => {
      if (!item.unlocked) {
        switch (item.type) {
          case 'level':
            if (did_level) {
              if (current_level + 1 >= item.requirements) {
                earned_badges.push(item);
                item.unlocked = true;
              }
            }
            break;
          case 'book':
            if (total_books_read >= item.requirements) {
              earned_badges.push(item);
              item.unlocked = true;
            }
            break;
        }
      }
    });

    // check if the profile will level up and level up
    if (did_level) {
      current_profile.level = current_level + 1;
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: req.id, profiles: { $elemMatch: { _id: req.body.id } } },
      {
        $set: {
          'profiles.$.total_stars': current_profile.total_stars,
          'profiles.$.badges_earned': current_profile.badges_earned,
          'profiles.$.level': current_profile.level,
          'profiles.$.books_read': current_profile.books_read,
        },
      },
      { new: true, timeStamps: false }
    );

    if (updatedUser instanceof Error) {
      res.status(500).send(updatedUser);
      throw new Error(updatedUser);
    }

    res.status(200).send({
      message: 'Profile updated successfully',
      earned_badges: earned_badges,
      did_level: did_level,
      total_stars: total_stars + 3,
    });
  })
);
module.exports = router;

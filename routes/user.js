const express = require('express');
const router = express.Router();
const asyncMiddleware = require('../middleware/async');
const auth = require('../middleware/auth');

const User = require('../models/user');
const Subcsription = require('../models/subscription');
// functions
const { deactivate } = require('../services/paystack');

// sendgrid
const {
  addContactToLists,
  removeContactsFromList,
} = require('../services/sendgrid');
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

    let sgRes = await addContactToLists(
      user.email,
      user.first_name,
      user.last_name,
      req.body.notifications.account,
      req.body.notifications.marketing
    );
    // console.log(sgRes);
    if (sgRes.code) {
      res.status(sgRes.code).send(sgRes.response.body.errors);
      throw new Error(sgRes.response.body.errors);
    }

    sgRes = await removeContactsFromList(
      [
        {
          account: !req.body.notifications.account,
        },
        {
          marketing: !req.body.notifications.marketing,
        },
      ],
      user.email
    );
    console.log(sgRes);
    if (sgRes instanceof Error) {
      // res.status(sgRes.code).send(sgRes.response.body.errors);
      throw new Error(sgRes.response.body.errors);
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

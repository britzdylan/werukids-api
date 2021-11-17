const express = require('express');
const router = express.Router();
const asyncMiddleware = require('../middleware/async');
const auth = require('../middleware/auth');

const Subcsription = require('../models/subscription');
const User = require('../models/user');

/***********
@ Get Subscriptions
@ Auth: true
***********/
router.get(
  '/',
  auth,
  asyncMiddleware(async (req, res) => {
    let allSubs = await Subcsription.find();

    if (allSubs instanceof Error) {
      res.status(500).send(allSubs);
      return;
    }
    res.status(200).json(allSubs);
  })
);

/***********
@ Update User Subscription
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

    if (!user.billing.card.active) {
      res.status(404).send('Please add a card to your account');
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
@ Update User Billing Details
@ Auth: true
***********/
router.post(
  '/billing/update',
  auth,
  asyncMiddleware(async (req, res) => {
    const user = await User.findById(req.id);

    if (!user) {
      res.status(404).send('User does not exist');
      return;
    }

    // TODO verify card details

    const data = { ...req.body };
    data.billing.card.active = true;
    console.log(data);

    // if (!user.billing.card.active) {
    //   res.status(404).send('Please add a card to your account');
    //   return;
    // }

    const updatedUser = await User.findOneAndUpdate(
      { _id: req.id },
      {
        $set: data,
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

module.exports = router;

const express = require('express');
const router = express.Router();
const asyncMiddleware = require('../middleware/async');
const auth = require('../middleware/auth');
const crypto = require('crypto');
const payStackSecret = process.env.PAYSTACK_SECRET_KEY;
const User = require('../models/user');
const winston = require('winston');

// functions
const {
  initPayment,
  manageSubscription,
  verifyPayment,
} = require('../services/paystack');

/***********
@ Setup Paystack Subscriptions
@ Auth: true
***********/
router.post(
  '/init',
  auth,
  asyncMiddleware(async (req, res) => {
    const user = await User.findById(req.id);
    console.log(req.body);
    if (!user) {
      res.status(404).send('User does not exist');
      return;
    }

    const payment = await initPayment(
      req.body.amount,
      user.email,
      req.body.callback_url,
      req.body.plan
    );

    if (!payment.status) {
      res.status(404).send(payment.message);
      return;
    }
    res.status(200).json(payment);
  })
);

/***********
@ Manage Paystack Subscriptions
@ Auth: true
***********/
router.post(
  '/manage',
  auth,
  asyncMiddleware(async (req, res) => {
    // const user = await User.findById(req.id);
    // console.log(req.body);
    // if (!user) {
    //   res.status(404).send('User does not exist');
    //   return;
    // }

    const data = await manageSubscription(req.body.code);
    // TODO email link with sendgrid

    if (!data.status) {
      res.status(404).send(data.message);
      return;
    }
    res.status(200).json(data);
  })
);

/***********
@ Verify Payment
@ Auth: true
***********/
router.post(
  '/verify',
  auth,
  asyncMiddleware(async (req, res) => {
    const user = await User.findById(req.id);
    console.log(req.body);
    if (!user) {
      res.status(404).send('User does not exist');
      return;
    }

    const data = await verifyPayment(req.body.reference);
    console.log(data);
    if (!data.status) {
      console.log(data);
      res.status(404).send(data.message);
      // set subscription status to suspended
      // user.billing.subscription_status = 'suspended';
      // await user.save();
      return;
    }
    const newData = {
      billing: {
        authorization: data.data.authorization,
        paystack_customer_id: data.data.customer.id,
        paystack_customer_code: data.data.customer.customer_code,
        plan: data.data.plan_object,
        subscription_started: data.data.transaction_date,
        subscription_status: 'active',
      },
    };
    const updatedUser = await User.findOneAndUpdate(
      { _id: req.id },
      {
        $set: newData,
      },
      { new: true, timeStamps: false }
    );

    if (updatedUser instanceof Error) {
      res.status(500).send(updatedUser);
      return;
    }

    res.status(200).json(data);
  })
);
/***********
@ Paystack webhook
@ Auth: true
***********/
router.post(
  '/paystack',
  asyncMiddleware(async (req, res) => {
    console.log(req.body);
    const hash = crypto
      .createHmac('sha512', payStackSecret)
      .update(JSON.stringify(req.body))
      .digest('hex');
    if (hash == req.headers['x-paystack-signature']) {
      // Retrieve the request's body
      const event = req.body;
      // Do something with event
      switch (event.event) {
        case 'subscription.disable':
          const user = await User.findOne(event.customer.email);

          if (!user) {
            res.status(404).send('User does not exist');
            return;
          }
          const newData = {
            billing: {
              authorization: event.event.authorization,
              subscription_status: 'suspended',
            },
          };
          const updatedUser = await User.findOneAndUpdate(
            { _id: user.id },
            {
              $set: newData,
            },
            { new: true, timeStamps: false }
          );

          if (updatedUser instanceof Error) {
            res.status(500).send(updatedUser);
            return;
          }

          res.status(200);
          return;
      }
    }
    res.status(200);
  })
);

module.exports = router;

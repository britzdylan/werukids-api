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
  getCustomer,
} = require('../services/paystack');
const { sendSubscriptionLink } = require('../services/sendgrid');
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
    const user = await User.findById(req.id);

    if (!user) {
      res.status(404).send('User does not exist');

      return;
    }
    const data = await manageSubscription(req.body.code);

    let email = await sendSubscriptionLink(user.email, data.data.link);

    if (email[0].statusCode != 202) {
      throw new Error(email);
    }
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
    // Retrieve the request's body
    const event = req.body;
    // Do something with event
    let user;
    user = await User.findOne({ email: event.data.customer.email });
    // console.log(user);
    if (!user) {
      res.status(404).send('User does not exist');
      return;
    }

    switch (event.event) {
      case 'subscription.not_renew':
        user.billing.authorization = event.data.authorization;
        user.billing.subscription_status = 'suspended';
        user.billing.subscription_cancelled = event.data.cancelledAt;

        let updatedUser = await user.save();

        if (updatedUser instanceof Error) {
          console.log(updatedUser);
          res.status(500).send(updatedUser);
          return;
        }

        res.send(200);

        return;

      case 'subscription.create':
        user.billing.authorization = event.data.authorization;
        user.billing.subscription_status = 'active';
        user.billing.subscription_cancelled = event.data.cancelledAt;
        user.billing.subscription_code = event.data.subscription_code;
        user.billing.paystack_customer_id = event.data.customer.id;
        user.billing.paystack_customer_code = event.data.customer.customer_code;
        user.billing.plan = event.data.plan;
        user.billing.subscription_started = event.data.created_at;
        user.billing.next_payment_date = event.data.next_payment_date;

        let updatedUserTwo = await user.save();

        if (updatedUserTwo instanceof Error) {
          console.log(updatedUserTwo);
          res.sendStatus.status(500).send(updatedUserTwo);
          return;
        }

        res.sendStatus(200);
        return;
      case 'charge.success':
        user.billing.authorization = event.data.authorization;
        user.billing.subscription_status = 'active';
        user.billing.subscription_cancelled = null;
        user.billing.paystack_customer_id = event.data.customer.id;
        user.billing.paystack_customer_code = event.data.customer.customer_code;
        user.billing.plan = event.data.plan;
        let updateUsr = await user.save();

        if (updateUsr instanceof Error) {
          console.log(updateUsr);
          res.status(500).send(updateUsr);
          return;
        }

        res.send(200);
        return;
    }

    res.send(200);
  })
);
/***********
@ Get transaction history
@ Auth: true
***********/
router.post(
  '/history',
  auth,
  asyncMiddleware(async (req, res) => {
    const data = await getCustomer(req.body.code);
    console.log(data);
    if (!data.status) {
      res.status(404).send(data.message);
      return;
    }
    res.status(200).json(data.data.transactions);
  })
);

module.exports = router;

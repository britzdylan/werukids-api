const express = require('express');
const router = express.Router();
const asyncMiddleware = require('../middleware/async');
const auth = require('../middleware/auth');

const Rating = require('../models/rating');

/***********
@ Add New Rating
@ Auth: true
***********/
router.post(
  '/add',
  auth,
  asyncMiddleware(async (req, res) => {
    const newRating = await Rating.create({
      rating: req.body.rating,
      comments: req.body.comments,
    });
    if (newRating instanceof Error) {
      res.status(500).send('Something went wrong');
      return;
    }
    res.status(200).send('Rating added successfully');
  })
);

module.exports = router;

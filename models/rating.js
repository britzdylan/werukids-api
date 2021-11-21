const mongoose = require('mongoose');
const Schema = require('mongoose').Schema;

const RatingSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      required: true,
    },
    comments: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('rating', RatingSchema);

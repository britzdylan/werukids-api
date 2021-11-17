const mongoose = require('mongoose');
const Schema = require('mongoose').Schema;

const SubscriptionSchema = new mongoose.Schema(
  {
    plan: {
      type: String,
      required: true,
      enum: ['standard'],
    },
    price: {
      type: Number,
      min: 0,
      required: true,
    },
    features: {
      type: Array,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('subscription', SubscriptionSchema);

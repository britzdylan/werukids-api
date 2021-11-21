const mongoose = require('mongoose');
const Schema = require('mongoose').Schema;

const UserSchema = new mongoose.Schema(
  {
    pin: {
      type: String,
      required: false,
    },
    first_name: {
      type: String,
      required: false,
      default: '',
      maxlength: [72, 'Max length of your first name is 72 characters'],
    },
    last_name: {
      type: String,
      required: false,
      default: '',
      maxlength: [72, 'Max length of your first name is 72 characters'],
    },
    email: {
      type: String,
      trim: true,
      unique: true,
      index: true,
      minlength: 5,
      maxlength: 255,
      required: true,
    },
    password: {
      type: String,
      trim: true,
      required: false,
      maxlength: 1024,
      default: null,
    },
    email_verified: {
      type: Boolean,
      required: true,
      default: false,
    },
    account_finalized: {
      type: Boolean,

      default: false,
    },
    validation_code: {
      type: Number,
    },

    billing: {
      authorization: {
        authorization_code: { type: String },
        card_type: { type: String },
        last4: {
          type: String,
        },
        exp_month: {
          type: String,
        },
        exp_year: { type: String },
        bin: { type: String },
        bank: { type: String },
        channel: { type: String },
        signature: { type: String },
        reusable: { type: Boolean },
        country_code: { type: String },
        account_name: { type: String },
      },
      paystack_customer_id: { type: Number },
      paystack_customer_code: { type: String },
      plan: {
        id: { type: Number },
        name: { type: String },
        plan_code: { type: String },
        description: { type: String },
        amount: { type: Number },
        interval: { type: String },
        send_invoices: { type: Boolean },
        send_sms: { type: Boolean },
        currency: { type: String },
      },
      subscription_started: {
        type: String,
      },
      subscription_status: {
        type: String,
        required: true,
        default: 'trail',
        enum: ['active', 'paused', 'trail', 'suspended'],
      },
    },
    terms_agreed_date: {
      type: String,
      required: false,
    },
    terms_version: {
      type: String,
      required: false,
    },
    profiles: [
      {
        name: {
          type: String,
          required: true,
        },
        primary_language: { type: Number, required: true },
        age: {
          type: String,
          enum: ['3', '4', '5', '6', '7', '8+'],
        },
        avatar: {
          type: String,
          required: true,
          enum: [
            'boy_1',
            'boy_2',
            'boy_3',
            'girl_1',
            'girl_2',
            'girl_3',
            'girl_4',
          ],
        },
      },
    ],
    notifications: {
      marketing: { type: Boolean, default: true, required: true },
      account: { type: Boolean, default: true, required: true },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('user', UserSchema);

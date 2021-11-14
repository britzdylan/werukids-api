const mongoose = require('mongoose');
const Schema = require('mongoose').Schema;

const UserSchema = new mongoose.Schema(
  {
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
      default: null
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
      transaction_history: [],
      subscription: { type: Schema.Types.ObjectId, ref: 'subscription' },
      subscription_status: {
        type: String,
        required: true,
        default: 'trail',
        enum: ['active', 'paused', 'trail', 'suspended'],
      },
      card: {
        number: {
          type: Number,
        },
        cvv: {
          type: Number,
        },
        name: {
          type: String,
        },
        expiry: {
          month: {
            type: String,
          },
          year: {
            type: String,
          },
        },
      },
      street: {
        type: String,
        default: '',
      },
      city: {
        type: String,
        default: '',
      },
      country: {
        type: String,
        default: '',
      },
      postalcode: {
        type: String,
        default: '',
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
        age: {
          type: String,
          enum: ['3', '4', '5', '6', '7', '8+'],
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
            primary_language: { type: Schema.Types.ObjectId, ref: 'language' },
          },
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

const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    avatar: {
      type: String,
    },
    name: {
      type: String,
      // required: true
    },
    email: {
      type: String,
    },
    mobileNo: {
      type: String,
    },
    location: {
      lang: String,
      lat: String,
    },
    password: {
      type: String,
    },
    googleId: {
      type: String,
    },
    recommendation: {
      type: Array,
    },
    isVerified: {
      type: Array,
    },
    wallet: {
      amount: {
        type: Number,
        default: 999,
      },
      expire: {
        type: Date,
        default: () => new Date().setMonth(new Date().getMonth() + 6),
      },
    },
    birthday: Date,
    bookings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking",
      },
    ],
    address: String,
    gender: String,
    maritialStatus: String,
    state: String,
    favourites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "hotels",
      },
    ],
    pinCode: String,
    resetLink: String,
    resetDateExpires: Date,
    secretKey: String,
  },
  {
    timestamps: true,
  }
);

const CustomerAuthModel = mongoose.model("customers", schema);

module.exports = CustomerAuthModel;

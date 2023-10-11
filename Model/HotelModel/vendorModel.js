const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
      required: true,
    },
    mobileNo: {
      type: String,
      required: true,
    },
    img: String,
    kycVerified: {
      type: Boolean,
      default: false,
    },
    role: String,
    aadharNo: {
      type: Number,
    },
    panNo: {
      type: String,
    },
    // document upload
    panImg: {
      type: String,
    },
    aadharImg: [],
    status: {
      type: Boolean,
    },
    password: String,
    hotels: [{ type: mongoose.Schema.Types.ObjectId, ref: "Hotels" }],
    // password secretkey to encode or decode
    secretKey: String,
    // password reset link
    resetLink: String,
    resetDateExpire: Date,

    // verify the email or number or kyc
    isNumberVarified: Boolean,
    isEmailVerified: Boolean,
  },
  {
    timestamps: true,
  }
);

const VendorModel = mongoose.model("hotel-partners", schema);

module.exports = VendorModel;

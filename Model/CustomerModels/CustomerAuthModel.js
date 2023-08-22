const mongoose = require("mongoose");

const schema = new mongoose.Schema({
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
        lat: String
    },
    password: {
        type: String,
    },
    isVerified: {
        type: Array,
    },
    resetLink: String,
    resetDateExpires: Date,
    secretKey: String,
}, {
    timestamps: true
})


const CustomerAuthModel = mongoose.model("customers", schema);

module.exports = CustomerAuthModel;
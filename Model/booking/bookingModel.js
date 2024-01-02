const mongoose = require("mongoose");

const discountInfo = new mongoose.Schema({
  name: {
    type: String,
  },
  amount: {
    type: Number,
  },
});

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
    },
    room: {
      type: String,
    },
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotels",
      required: true,
    },
    guest: {
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      mobileNo: Number,
    },
    bookingDate: {
      checkIn: {
        type: Date,
        required: true,
      },
      checkOut: {
        type: Date,
        required: true,
        validate: {
          validator: function (checkOut) {
            return checkOut > this.bookingDate.checkIn;
          },
          message: "Check-out date must be after check-in date",
        },
      },
    },
    amount: {
      type: Number,
      required: true,
    },
    dateOfBooking: {
      type: Date,
      required: true,
    },
    payment: {
      paymentType: {
        type: String,
        enum: ["part-pay", "online", "pay-at-hotel"],
        default: "online",
      },
      payments: [
        { type: mongoose.Schema.Types.ObjectId, ref: "paymentsresponses" },
      ],
      totalamount: Number,
      paidamount: Number,
      balanceAmt: Number,
    },
    specialRequests: String,
    bookingStatus: {
      type: String,
      enum: ["confirmed", "canceled", "pending", "failed"],
      default: "pending",
      required: true,
    },
    additionalCharges: {
      gst: Number,
      cancellationCharge: Number,
      serviceFee: Number,
    },
    promoCode: String,
    discountInfo: [discountInfo],
    numberOfGuests: {
      adults: {
        type: Number,
        required: true,
      },
    },
    numberOfRooms: Number,
    bookingSource: String,
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "customers", // Reference to the User model if users are registered
    },
    cancellation: {
      status: {
        type: String,
        enum: ["requested", "approved", "pending", "rejected", "canceled"],
      },
      requestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
      },
      requestedDate: Date,
      reason: String,
      processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
      },
      processedDate: Date,
      notes: String,
      refundAmount: Number, // Store the refund amount when a cancellation is approved
    },
  },
  {
    timestamps: true,
  }
);

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;

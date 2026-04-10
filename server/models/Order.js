const mongoose = require('mongoose')

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      default: '',
    },
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    image: {
      type: String,
      default: '',
    },
  },
  { _id: false }
)

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
    },
    recipientName: {
      type: String,
      default: '',
    },
    giftMessage: {
      type: String,
      default: '',
    },
    boxSize: {
      type: String,
      default: 'Medium',
    },
    deliveryOption: {
      type: String,
      default: 'Standard Delivery',
    },
    giftWrap: {
      type: Boolean,
      default: false,
    },

    boxFinish: {
      type: String,
      default: 'Classic Linen',
    },
    ribbonColor: {
      type: String,
      default: 'Black',
    },
    cardStyle: {
      type: String,
      default: 'Minimal',
    },
    boxName: {
      type: String,
      default: '',
    },
    cardMessage: {
      type: String,
      default: '',
    },
    fontChoice: {
      type: String,
      default: 'Elegant Serif',
    },
    extras: {
      driedFlowers: { type: Boolean, default: false },
      tissuePaper: { type: Boolean, default: false },
      luxuryFiller: { type: Boolean, default: false },
    },

    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    customerEmail: {
      type: String,
      required: true,
      trim: true,
    },
    deliveryAddress: {
      type: String,
      default: '',
    },
    items: {
      type: [orderItemSchema],
      default: [],
    },
    totalItems: {
      type: Number,
      required: true,
      min: 0,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    boxFee: {
      type: Number,
      required: true,
      min: 0,
    },
    giftWrapFee: {
      type: Number,
      required: true,
      min: 0,
    },
    deliveryFee: {
      type: Number,
      required: true,
      min: 0,
    },
    extrasFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    personalizationFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      default: 'Pending',
    },
    paymentStatus: {
      type: String,
      default: 'PENDING',
    },
    paidAt: {
      type: Date,
      default: null,
    },
    paymentProvider: {
      type: String,
      default: 'Payfast',
    },
    paymentReference: {
      type: String,
      default: '',
    },
    pfPaymentId: {
      type: String,
      default: '',
    },
    paymentConfirmedEmailSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('Order', orderSchema)
import mongoose from "mongoose";

const shopOrderItemSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    name: {
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
    },
  },
  { timestamps: true },
);

const shopOrderSchema = new mongoose.Schema(
  {
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subTotal: {
      type: Number,
      required: true,
    },
    shopOrderItems: {
      type: [shopOrderItemSchema],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "preparing", "out for delivery", "delivered"],
      default: "pending",
    },
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryAssignment",
      default: null,
    },
    assignedDeliveryBoy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    deliveryOtp: {
      type: String,
      default:null
    },

    otpExpires: {
      type: Date,
      default:null
    },
    deliveredAt:{
      type:Date,
      default:null
    }
  },
  { timestamps: true },
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "online"],
      required: true,
    },
    deliveryAddress: {
      text: { type: String, required: true },
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    shopOrders: {
      type: [shopOrderSchema],
      required: true,
    },
    payment:{
      type:Boolean,
      default:false
    },
    razorPayOrderId:{
      type:String,
      default:""
    },
    razorPayPaymentId:{
      type:String,
      default:""
    }
  },
  { timestamps: true },
);

const Order = mongoose.model("Order", orderSchema);
export default Order;

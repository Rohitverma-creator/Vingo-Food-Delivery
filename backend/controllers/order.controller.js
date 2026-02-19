import Shop from "../models/shop.model.js";
import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import DeliveryAssignment from "../models/deliveryAssignment.model.js";
import { sendDeliveryOtpMail } from "../utils/mail.js";
import Razorpay from "razorpay";
import dotenv from "dotenv";
dotenv.config();

let instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const placeOrder = async (req, res) => {
  try {
    const { cartItems, paymentMethod, deliveryAddress, totalAmount } = req.body;

    console.log("User:", req.userId);
    console.log("Payment Method:", paymentMethod);
    console.log("Cart Length:", cartItems?.length);

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    if (
      !deliveryAddress?.text ||
      !deliveryAddress?.latitude ||
      !deliveryAddress?.longitude
    ) {
      console.log("Delivery address incomplete");
      return res.status(400).json({
        message: "Send Complete Delivery Address",
      });
    }

    const groupItemByShop = {};

    cartItems.forEach((item) => {
      if (!item.shop) throw new Error("shopId missing");

      if (!groupItemByShop[item.shop]) {
        groupItemByShop[item.shop] = [];
      }

      groupItemByShop[item.shop].push(item);
    });

    const shopOrders = await Promise.all(
      Object.keys(groupItemByShop).map(async (shopId) => {
        const shop = await Shop.findById(shopId).populate("owner");
        if (!shop) throw new Error("Shop not found");

        console.log("Shop:", shop._id);
        console.log("Owner:", shop.owner?._id);

        const items = groupItemByShop[shopId];

        const subTotal = items.reduce(
          (sum, i) => sum + Number(i.price) * Number(i.quantity),
          0,
        );

        return {
          shop: shop._id,
          owner: shop.owner._id,
          subTotal,
          shopOrderItems: items.map((i) => ({
            item: i._id,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
          })),
        };
      }),
    );

    if (paymentMethod === "online") {
      const razorOrder = await instance.orders.create({
        amount: totalAmount * 100,
        currency: "INR",
      });

      const newOrder = await Order.create({
        user: req.userId,
        paymentMethod,
        deliveryAddress,
        totalAmount,
        shopOrders,
        payment: false,
      });

      return res.status(200).json({
        orderId: newOrder._id,
        razorOrder,
      });
    }

    const newOrder = await Order.create({
      user: req.userId,
      paymentMethod,
      deliveryAddress,
      totalAmount,
      shopOrders,
      payment: true,
    });

    await newOrder.populate(
      "shopOrders.shopOrderItems.item",
      "name image price",
    );
    await newOrder.populate("shopOrders.shop", "name");
    await newOrder.populate("shopOrders.owner", "socketId fullName");
    await newOrder.populate("user", "fullName email mobile");

    const io = req.app.get("io");

    if (!io) {
      console.log("IO NOT FOUND");
    }

    if (io) {
      newOrder.shopOrders.forEach((shopOrder) => {
        const ownerSocketId = shopOrder.owner?.socketId;

        if (ownerSocketId) {
          io.to(ownerSocketId).emit("newOrder", newOrder);
        } else {
          console.log("OWNER OFFLINE (No socketId)");
        }
      });
    }

    return res.status(201).json(newOrder);
  } catch (error) {
    console.log("ERROR IN PLACE ORDER:", error);
    return res.status(500).json({
      message: "place order error",
      error: error.message,
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_payment_id, orderId } = req.body;

    const payment = await instance.payments.fetch(razorpay_payment_id);

    if (!payment || payment.status !== "captured") {
      return res.status(400).json({ message: "payment not captured" });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(400).json({ message: "order not found" });
    }

    order.payment = true;
    order.razorPayPaymentId = razorpay_payment_id;

    await order.save();

    await order.populate("shopOrders.shopOrderItems.item", "name image price");
    await order.populate("shopOrders.shop", "name");
    await order.populate("shopOrders.owner", "socketId fullName");
    await order.populate("user", "fullName email mobile");

    const io = req.app.get("io");

    if (io) {
      order.shopOrders.forEach((shopOrder) => {
        const ownerSocketId = shopOrder.owner?.socketId;

        console.log("Owner Socket:", ownerSocketId); // DEBUG

        if (ownerSocketId) {
          io.to(ownerSocketId).emit("newOrder", order);
        }
      });
    }

    return res.status(200).json(order);
  } catch (error) {
    console.log("VERIFY PAYMENT ERROR:", error);
    return res.status(500).json({
      message: "payment verification order error",
      error: error.message,
    });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (user.role == "user") {
      const orders = await Order.find({ user: req.userId })
        .sort({ createdAt: -1 })
        .populate("shopOrders.shop", "name")
        .populate("shopOrders.owner", "name email mobile")
        .populate("shopOrders.shopOrderItems.item", "name image price");

      return res.status(200).json(orders);
    } else if (user.role == "owner") {
      const orders = await Order.find({ "shopOrders.owner": req.userId })
        .sort({ createdAt: -1 })
        .populate("shopOrders.shop", "name")
        .populate("user")
        .populate("shopOrders.shopOrderItems.item", "name image price")
        .populate("shopOrders.assignedDeliveryBoy", "fullName mobile ");
      const filteredOrders = orders.map((order) => {
        return {
          _id: order._id,
          paymentMethod: order.paymentMethod,
          user: order.user,
          shopOrders: order.shopOrders.filter(
            (o) => o.owner._id.toString() === req.userId.toString(),
          ),
          createdAt: order.createdAt,
          deliveryAddress: order.deliveryAddress,
          payment: order.payment,
        };
      });

      return res.status(200).json(filteredOrders);
    }
  } catch (error) {
    return res.status(500).json({
      message: "get my order error",
      error: error.message,
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, shopId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const shopOrder = order.shopOrders.find(
      (o) => o.shop.toString() === shopId,
    );

    if (!shopOrder)
      return res.status(400).json({ message: "shop order not found" });

    shopOrder.status = status;

    let deliveryBoysPayload = [];

    if (status === "out for delivery" && !shopOrder.assignment) {
      const { longitude, latitude } = order.deliveryAddress;

      const nearDeliveryBoys = await User.find({
        role: "deliveryBoy",
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [Number(longitude), Number(latitude)],
            },
            $maxDistance: 5000,
          },
        },
      });

      const nearByIds = nearDeliveryBoys.map((b) => b._id);

      const busyIds = await DeliveryAssignment.find({
        assignedTo: { $in: nearByIds },
        status: { $nin: ["broadcasted", "completed"] },
      }).distinct("assignedTo");

      const busySet = new Set(busyIds.map((id) => String(id)));

      const availableBoys = nearDeliveryBoys.filter(
        (b) => !busySet.has(String(b._id)),
      );

      if (availableBoys.length === 0) {
        await order.save();
        return res.json({
          message: "order status updated but no delivery boys available",
        });
      }

      const assignment = await DeliveryAssignment.create({
        order: order._id,
        shop: shopOrder.shop,
        shopOrderId: shopOrder._id,
        broadCastedTo: availableBoys.map((b) => b._id),
        status: "broadcasted",
      });

      await assignment.populate("order");
      await assignment.populate("shop");

      shopOrder.assignment = assignment._id;

      deliveryBoysPayload = availableBoys.map((b) => ({
        id: b._id,
        fullName: b.fullName,
        longitude: b.location.coordinates?.[0],
        latitude: b.location.coordinates?.[1],
        mobile: b.mobile,
      }));

      const io = req.app.get("io");

      if (io) {
        availableBoys.forEach((boy) => {
          if (boy.socketId) {
            io.to(boy.socketId).emit("newAssignment", {
              sentTo: boy._id,
              assignmentId: assignment._id,
              orderId: assignment.order._id,
              shopName: assignment.shop?.name || "Shop",
              deliveryAddress: assignment.order.deliveryAddress,
              items: shopOrder.shopOrderItems || [],
              subTotal: shopOrder.subTotal || 0,
            });
          }
        });
      }
    }

    await order.save();

    const updatedShopOrder = order.shopOrders.find(
      (o) => o.shop.toString() === shopId,
    );

    await order.populate("shopOrders.shop", "name");
    await order.populate(
      "shopOrders.assignedDeliveryBoy",
      "fullName email mobile",
    );
    await order.populate("user", "socketId");

    const io = req.app.get("io");

    if (io && order.user?.socketId) {
      io.to(order.user.socketId).emit("update-status", {
        orderId: order._id,
        shopId: updatedShopOrder.shop._id,
        status: updatedShopOrder.status,
        userId: order.user._id,
      });
    }

    return res.status(200).json({
      shopOrder: updatedShopOrder,
      assignedDeliveryBoy: updatedShopOrder?.assignedDeliveryBoy || null,
      availableBoys: deliveryBoysPayload,
      assignment: updatedShopOrder?.assignment || null,
    });
  } catch (error) {
    return res.status(500).json({
      message: "order status error",
      error: error.message,
    });
  }
};

export const getDeliveryBoyAssignment = async (req, res) => {
  try {
    const deliveryBoyId = req.userId;

    const assignments = await DeliveryAssignment.find({
      broadCastedTo: { $in: [deliveryBoyId] },
      status: "broadcasted",
    })
      .populate({
        path: "order",
        select: "deliveryAddress shopOrders",
      })
      .populate({
        path: "shop",
        select: "name",
      });

    const formatted = [];

    for (const a of assignments) {
      if (!a.order) continue;
      if (!Array.isArray(a.order.shopOrders)) continue;

      const shopOrder = a.order.shopOrders.find(
        (so) => so && so._id && so._id.equals(a.shopOrderId),
      );

      formatted.push({
        assignmentId: a._id,
        orderId: a.order._id,
        shopName: a.shop?.name || "Shop",
        deliveryAddress: a.order.deliveryAddress,
        items: shopOrder?.shopOrderItems || [],
        subTotal: shopOrder?.subTotal || 0,
      });
    }

    return res.status(200).json(formatted);
  } catch (error) {
    console.error("GET ASSIGNMENT ERROR:", error);
    return res.status(500).json({
      message: "get assignment error",
      error: error.message,
    });
  }
};
export const acceptOrder = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const assignment = await DeliveryAssignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: "assignment not found" });
    }

    if (assignment.status !== "broadcasted") {
      return res.status(400).json({ message: "assignment is expired" });
    }

    const alreadyAssigned = await DeliveryAssignment.findOne({
      assignedTo: req.userId,
      status: { $in: ["assigned", "picked", "onTheWay"] },
    });

    if (alreadyAssigned) {
      return res
        .status(400)
        .json({ message: "you are already assigned to another order" });
    }

    assignment.assignedTo = req.userId;
    assignment.status = "assigned";
    assignment.accepatedAt = new Date();
    await assignment.save();

    const order = await Order.findById(assignment.order);
    if (!order) {
      return res.status(404).json({ message: "order not found" });
    }

    const shopOrder = order.shopOrders.find(
      (so) =>
        so && so._id && so._id.toString() === assignment.shopOrderId.toString(),
    );

    if (shopOrder) {
      shopOrder.assignedDeliveryBoy = req.userId;
      await order.save();
    }

    return res.status(200).json({ message: "order accepted" });
  } catch (error) {
    console.error("ACCEPT ORDER ERROR:", error);
    return res.status(500).json({ message: "accept order error" });
  }
};

export const getCurrentOrder = async (req, res) => {
  try {
    const assignment = await DeliveryAssignment.findOne({
      assignedTo: req.userId,
      status: "assigned",
    })
      .populate("shop", "name")
      .populate("assignedTo", "fullName email mobile location ")
      .populate({
        path: "order",
        populate: [{ path: "user", select: "fullName email location mobile" }],
      });
    if (!assignment) {
      return res.status(400).json({
        message: "assignment not found",
      });
    }
    if (!assignment.order) {
      return res.status(400).json({
        message: "order not found",
      });
    }
    const shopOrder = assignment.order.shopOrders.find(
      (so) => toString(so._id) == toString(assignment.shopOrderId),
    );
    if (!shopOrder) {
      return res.status(400).json({
        message: "shop order not found",
      });
    }
    let deliveryBoyLocation = { lat: null, lon: null };
    if (assignment.assignedTo.location.coordinates.length == 2) {
      deliveryBoyLocation.lat = assignment.assignedTo.location.coordinates[1];
      deliveryBoyLocation.lon = assignment.assignedTo.location.coordinates[0];
    }
    let customerLocation = { lat: null, lon: null };
    if (assignment.order.deliveryAddress) {
      customerLocation.lat = assignment.order.deliveryAddress.latitude;
      customerLocation.lon = assignment.order.deliveryAddress.longitude;
    }
    return res.status(200).json({
      _id: assignment.order._id,
      user: assignment.order.user,
      shopOrder,
      deliveryAddress: assignment.order.deliveryAddress,
      deliveryBoyLocation,
      customerLocation,
    });
  } catch (error) {
    console.error("ACCEPT ORDER ERROR:", error);
    return res.status(500).json({ message: "get current order error" });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({ message: "Order id missing" });
    }

    const order = await Order.findById(orderId)
      .populate("shopOrders.shop")
      .populate("shopOrders.shopOrderItems.item")
      .populate("shopOrders.assignedDeliveryBoy", "fullName mobile");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.status(200).json(order);
  } catch (error) {
    console.log(" getById ERROR:", error);
    return res.status(500).json({
      message: "getById order error",
      error: error.message,
    });
  }
};
export const sendDeliveryOtp = async (req, res) => {
  try {
    const { orderId, shopOrderId } = req.body;

    const order = await Order.findById(orderId).populate("user");
    if (!order) {
      return res.status(400).json({ message: "order not found" });
    }

    const shopOrder = order.shopOrders.find(
      (so) => so?._id && String(so._id) === String(shopOrderId),
    );

    if (!shopOrder) {
      return res.status(400).json({ message: "shop order not found" });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    shopOrder.deliveryOtp = otp;
    shopOrder.otpExpires = Date.now() + 5 * 60 * 1000;

    await order.save();

    await sendDeliveryOtpMail(order.user, otp);

    return res.status(200).json({
      message: "Otp sent successfully",
    });
  } catch (error) {
    console.error("SEND OTP ERROR:", error);
    return res.status(500).json({
      message: "delivery OTP error",
      error: error.message,
    });
  }
};

export const verifyDeliveryOtp = async (req, res) => {
  try {
    const { orderId, shopOrderId, otp } = req.body;
    const order = await Order.findById(orderId).populate("user");
    const shopOrder = order.shopOrders.find(
      (so) => so._id.toString() === shopOrderId.toString(),
    );

    if (!shopOrder) {
      return res.status(400).json({ message: "shop order not found" });
    }

    if (!order || !shopOrder) {
      return res
        .status(400)
        .json({ message: "enter a valid order/shopOrderId" });
    }
    if (
      shopOrder.deliveryOtp !== otp ||
      !shopOrder.otpExpires ||
      shopOrder.otpExpires < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid/Otp expired" });
    }
    shopOrder.status = "delivered";
    shopOrder.deliveredAt = Date.now();
    await order.save();
    await DeliveryAssignment.deleteOne({
      shopOrderId: shopOrder._id,
      order: order._id,
      assignedTo: shopOrder.assignedDeliveryBoy,
    });
    return res.status(200).json({ message: "order delivered successfully" });
  } catch (error) {
    console.log(" getById ERROR:", error);
    return res.status(500).json({
      message: " verify delivery OTP error",
      error: error.message,
    });
  }
};

export const getTodayDelivery = async (req, res) => {
  try {
    const deliveryBoyId = req.userId;
    const startsOfDay = new Date();
    startsOfDay.setHours(0, 0, 0, 0);
    const orders = await Order.find({
      "shopOrders.assignedDeliveryBoy": deliveryBoyId,
      "shopOrders.status": "delivered",
      "shopOrders.deliveredAt": { $gte: startsOfDay },
    }).lean();
    let todayDeliveries = [];
    orders.forEach((order) => {
      order.shopOrders.forEach((shopOrder) => {
        if (
          shopOrder.assignedDeliveryBoy == deliveryBoyId &&
          shopOrder.status == "delivered" &&
          shopOrder.deliveredAt >= startsOfDay
        ) {
          todayDeliveries.push(shopOrder);
        }
      });
    });
    let stats = {};
    todayDeliveries.forEach((shopOrder) => {
      const hour = new Date(shopOrder.deliveredAt).getHours();
      stats[hour] = (stats[hour] || 0) + 1;
    });
    let formattedStats = Object.keys(stats).map((hour) => ({
      hour: parseInt(hour),
      count: stats[hour],
    }));
    formattedStats.sort((a, b) => a.hour - b.hour);
    return res.status(200).json({
      todayDeliveries,
      stats: formattedStats,
    });
  } catch (error) {
    console.log("getTodayDelivery ERROR:", error);
    return res.status(500).json({
      message: "getTodayDelivery error",
      error: error.message,
    });
  }
};

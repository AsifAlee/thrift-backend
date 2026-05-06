const { StatusCodes } = require("http-status-codes");
const { NotFoundError } = require("../errors");
const stripe = require("../config/stripe");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const checkPermission = require("../utils/checkPermission");

const fakeStripeAPI = async ({ amount, currency }) => {
  return { client_secret: "someRandomValue", amount, currency };
};
const getAllOrders = async (req, res) => {
  // Logic to get all orders
  const allOrders = await Order.find({}).populate("user");
  console.log("all Orders are :", allOrders);
  res.status(StatusCodes.OK).json({ allOrders });
};

const getCurrentUserOrders = async (req, res) => {
  // Logic to get orders for the current user
  const currentUserOrders = await Order.find({
    user: req.user.userId,
  }).populate("user");
  res.status(StatusCodes.OK).json({ currentUserOrders });
  //
  res.send("Get current user's orders");
};
const getSingleOrder = async (req, res) => {
  // Logic to get a single order by ID
  const singleOrder = await Order.findById(req.params.id).populate("user");
  checkPermission(req.user, singleOrder.user);
  if (!singleOrder) {
    throw new NotFoundError(`No order with id: ${req.params.id}`);
  }
  res.status(StatusCodes.OK).json({ singleOrder });
};

const createOrder = async (req, res) => {
  try {
    const {
      customerName,
      email,
      phone,
      shippingAddress,
      paymentMethod,
      cartFromFrontend,
    } = req.body;

    const userId = req.user?.userId;

    let orderItems = [];
    let totalItems = 0;
    let totalPrice = 0;

    // ==============================
    // 1️⃣ LOGGED-IN USER FLOW
    // ==============================
    if (userId) {
      const cart = await Cart.findOne({ user: userId }).populate(
        "items.product",
      );

      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ msg: "Cart is empty" });
      }

      orderItems = cart.items.map((item) => ({
        product: item.product._id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.images?.[0] || "",
      }));

      totalItems = cart.totalItems;
      totalPrice = cart.totalPrice;
    }

    // ==============================
    // 2️⃣ GUEST USER FLOW
    // ==============================
    else {
      if (!cartFromFrontend || cartFromFrontend.length === 0) {
        return res.status(400).json({ msg: "Cart is empty" });
      }

      for (let item of cartFromFrontend) {
        const product = await Product.findById(item.id);

        if (!product) {
          return res.status(404).json({ msg: "Product not found" });
        }

        const quantity = item.quantity;

        orderItems.push({
          product: product._id,
          name: product.name,
          price: product.price,
          quantity,
          image: product.images?.[0] || "",
        });

        totalItems += quantity;
        totalPrice += product.price * quantity;
      }
    }

    // ==============================
    // 3️⃣ CREATE ORDER FIRST
    // ==============================
    const order = await Order.create({
      user: userId || null,
      items: orderItems,
      totalItems,
      totalPrice,
      customerName,
      email,
      phone,
      shippingAddress,
      paymentMethod,
      paymentStatus: "pending", // 🔥 important
      isPaid: false,
      guestInfo: userId
        ? null
        : {
            name: customerName,
            email,
            phone,
          },
    });

    // ==============================
    // 4️⃣ STRIPE PAYMENT
    // ==============================
    if (paymentMethod === "stripe") {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",

        line_items: orderItems.map((item) => ({
          price_data: {
            currency: "usd", // change if needed
            product_data: {
              name: item.name,
            },
            unit_amount: item.price * 100,
          },
          quantity: item.quantity,
        })),

        metadata: {
          orderId: order._id.toString(),
          userId: userId ? userId.toString() : "",
        },

        success_url: `${process.env.FRONTEND_URL}/success?orderId=${order._id}`,
        cancel_url: `${process.env.FRONTEND_URL}/cancel`,
      });

      return res.status(200).json({
        success: true,
        url: session.url,
      });
    }

    if (userId && paymentMethod === "COD") {
      const cart = await Cart.findOne({ user: userId });

      if (cart) {
        cart.items = [];
        cart.totalItems = 0;
        cart.totalPrice = 0;
        await cart.save();
      }
    }
    // ==============================
    // 5️⃣ COD RESPONSE
    // ==============================
    return res.status(201).json({
      success: true,
      order,
      message: "Order placed with Cash on Delivery",
    });
  } catch (error) {
    console.error("Create Order Error:", error);
    res.status(500).json({ msg: error.message });
  }
};
const updateOrder = async (req, res) => {
  const { orderId } = req.params;
  const { paymentStatus, orderStatus } = req.body;
  const order = await Order.findById(orderId);
  const cart = await Cart.findOne({ user: order.user });

  if (!order) {
    return res.status(404).json({ msg: "Order not found" });
  }

  // Update payment status
  if (paymentStatus) {
    order.paymentStatus = paymentStatus;
  }

  // Update order status (admin action)
  if (orderStatus) {
    if (orderStatus == "Delivered") {
      if (cart) {
        cart.items = [];
        cart.totalItems = 0;
        cart.totalPrice = 0;
        await cart.save();
      }
    }
    order.orderStatus = orderStatus;
  }

  await order.save();

  // Clear cart if payment completed
  if (paymentStatus === "paid") {
    if (cart) {
      cart.items = [];
      cart.totalItems = 0;
      cart.totalPrice = 0;
      await cart.save();
    }
  }

  res.status(200).json({
    success: true,
    order,
  });
};

const deleteOrder = async (req, res) => {
  const { orderId } = req.params;
  console.log("orderId", orderId);
  const deletedOrder = await Order.findByIdAndDelete({ _id: orderId });

  res.status(StatusCodes.OK).json({ msg: "orders deleted" });
};

module.exports = {
  getAllOrders,
  getSingleOrder,
  createOrder,
  updateOrder,
  deleteOrder,
  getCurrentUserOrders,
};

// controllers/webhookController.js
const stripe = require("../config/stripe");
const Order = require("../models/Order");

const webhookHandler = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  console.log("webhook controller got called");

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // ✅ Payment successful
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const orderId = session.metadata.orderId;
    const userId = session.metadata.userId;
    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: "paid",
      isPaid: true,
      paidAt: new Date(),
    });

    if (userId) {
      await Cart.findOneAndUpdate(
        { user: userId },
        { items: [], totalItems: 0, totalPrice: 0 },
      );
    }
  }

  res.json({ received: true });
};

module.exports = { webhookHandler };

const Cart = require("../models/Cart");
const Product = require("../models/Product");

const addToCart = async (req, res) => {
  const { productId } = req.body;

  const product = await Product.findById(productId);

  if (!product) {
    return res.status(404).json({ msg: "Product not found" });
  }

  let cart = await Cart.findOne({ user: req.user.userId });

  if (!cart) {
    cart = await Cart.create({
      user: req.user.userId,
      items: [],
    });
  }

  const existingItem = cart.items.find(
    (item) => item.product.toString() === productId,
  );

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.items.push({
      product: productId,
      name: product.name,
      price: product.price,
      image: product.images[0],
    });
  }

  cart.totalItems = cart.items.reduce((acc, item) => acc + item.quantity, 0);

  cart.totalPrice = cart.items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  await cart.save();

  res.status(200).json(cart);
};

const getCart = async (req, res) => {
  // console.log("cart item:", req.user.userId);
  const cart = await Cart.findOne({ user: req.user.userId }).populate(
    "items.product",
    "name price images stock",
  );

  if (!cart) {
    return res.status(200).json({
      items: [],
      totalItems: 0,
      totalPrice: 0,
    });
  }

  res.status(200).json(cart);
};

const clearCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.userId });

  if (!cart) {
    return res.status(404).json({ msg: "Cart not found" });
  }

  cart.items = [];
  cart.totalItems = 0;
  cart.totalPrice = 0;

  await cart.save();

  res.status(200).json({
    msg: "Cart cleared successfully",
    cart,
  });
};
const updateCartItem = async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;
  // console.log("update cart called:", productId);

  const cart = await Cart.findOne({ user: req.user.userId });

  if (!cart) {
    return res.status(404).json({ msg: "Cart not found" });
  }

  const item = cart.items.find((item) => item.product.toString() === productId);

  if (!item) {
    return res.status(404).json({ msg: "Item not found in cart" });
  }

  if (quantity <= 0) {
    // remove item if quantity becomes 0
    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId,
    );
  } else {
    item.quantity = quantity;
  }

  // recalculate totals
  cart.totalItems = cart.items.reduce((acc, item) => acc + item.quantity, 0);

  cart.totalPrice = cart.items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  await cart.save();

  res.status(200).json(cart);
};
const deleteCartItem = async (req, res) => {
  const { productId } = req.params;

  const cart = await Cart.findOne({ user: req.user.userId });

  if (!cart) {
    return res.status(404).json({ msg: "Cart not found" });
  }

  // remove item
  cart.items = cart.items.filter(
    (item) => item.product.toString() !== productId,
  );

  // recalculate totals
  cart.totalItems = cart.items.reduce((acc, item) => acc + item.quantity, 0);

  cart.totalPrice = cart.items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  await cart.save();

  res.status(200).json({
    msg: "Item removed from cart",
    cart,
  });
};

const mergeCart = async (req, res) => {
  // console.log("merge cart called");
  const { items } = req.body;

  if (!items || !items.length) {
    return res.status(400).json({ msg: "No items to merge" });
  }

  // 1. Get or create user's cart
  let cart = await Cart.findOne({ user: req.user.userId });

  if (!cart) {
    cart = await Cart.create({
      user: req.user.userId,
      items: [],
    });
  }

  // 2. Loop through guest items
  for (const guestItem of items) {
    const product = await Product.findById(guestItem.product);

    // Skip if product no longer exists
    if (!product) continue;

    const existingItem = cart.items.find(
      (item) => item.product.toString() === guestItem.product.toString(),
    );

    if (existingItem) {
      // 👉 Merge quantity
      existingItem.quantity += guestItem.quantity;
    } else {
      // 👉 Add new item
      cart.items.push({
        product: product._id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        quantity: guestItem.quantity,
      });
    }
  }

  // 3. Recalculate totals
  cart.totalItems = cart.items.reduce((acc, item) => acc + item.quantity, 0);

  cart.totalPrice = cart.items.reduce(
    (acc, item) => acc + item.quantity * item.price,
    0,
  );

  await cart.save();

  res.status(200).json({
    msg: "Cart merged successfully",
    cart,
  });
};

module.exports = {
  addToCart,
  clearCart,
  getCart,
  updateCartItem,
  deleteCartItem,
  mergeCart,
};

const User = require("../models/User");
const Product = require("../models/Product");
const Review = require("../models/Review");
const Order = require("../models/Order");

const seedUsers = async (req, res) => {
  const users = [];
  for (let i = 1; i <= 5; i++) {
    users.push({
      name: `User${i}_${Date.now()}`,
      email: `user${i}_${Date.now()}@example.com`,
      password: "password123",
      role: "user",
    });
  }
  users.push({
    name: `Admin_${Date.now()}`,
    email: `admin_${Date.now()}@example.com`,
    password: "password123",
    role: "admin",
  });

  const createdUsers = await User.insertMany(users);
  res.status(201).json({
    msg: "Users created successfully",
    count: createdUsers.length,
    users: createdUsers,
  });
};

const seedProducts = async (req, res) => {
  const user =
    (await User.findOne({ role: "admin" })) || (await User.findOne({}));

  if (!user) {
    return res.status(400).json({ msg: "Please create a user first" });
  }

  const products = [
    {
      name: "Nike Pegasus 39",
      slug: "nike-pegasus-39",
      description: "Lightweight running shoe with responsive cushioning.",
      brand: "Nike",
      size: 42,
      gender: "men",
      condition: "like new",
      price: 12000,
      discountedPrice: 10500,
      category: "sports",
      quantity: 1,
      tags: ["running", "nike", "pegasus"],
      images: [],
      user: "68f889f7e87a5c224927bfc5",
      createdBy: "68f889f7e87a5c224927bfc5",
    },
    {
      name: "Adidas Ultraboost 22",
      slug: "adidas-ultraboost-22",
      description: "Premium running shoes with boost cushioning.",
      brand: "Adidas",
      size: 43,
      gender: "men",
      condition: "good",
      price: 15000,
      discountedPrice: 13500,
      category: "sports",
      quantity: 1,
      tags: ["adidas", "running"],
      images: [],
      user: "68f889f7e87a5c224927bfc5",
      createdBy: "68f889f7e87a5c224927bfc5",
    },
    {
      name: "Puma RS-X",
      slug: "puma-rsx",
      description: "Chunky stylish sneakers perfect for streetwear.",
      brand: "Puma",
      size: 41,
      gender: "unisex",
      condition: "good",
      price: 9000,
      discountedPrice: 7500,
      category: "sneakers",
      quantity: 1,
      tags: ["puma", "streetwear"],
      images: [],
      user: "68f889f7e87a5c224927bfc5",
      createdBy: "68f889f7e87a5c224927bfc5",
    },
    {
      name: "Nike Air Force 1",
      slug: "nike-air-force-1",
      description: "Classic white sneakers with timeless design.",
      brand: "Nike",
      size: 42,
      gender: "unisex",
      condition: "good",
      price: 11000,
      discountedPrice: 9800,
      category: "sneakers",
      quantity: 1,
      tags: ["nike", "airforce"],
      images: [],
      user: "68f889f7e87a5c224927bfc5",
      createdBy: "68f889f7e87a5c224927bfc5",
    },
    {
      name: "Vans Old Skool",
      slug: "vans-old-skool",
      description: "Iconic skate shoes with durable canvas.",
      brand: "Vans",
      size: 40,
      gender: "unisex",
      condition: "good",
      price: 7500,
      discountedPrice: 6500,
      category: "sneakers",
      quantity: 1,
      tags: ["vans", "skate"],
      images: [],
      user: "68f889f7e87a5c224927bfc5",
      createdBy: "68f889f7e87a5c224927bfc5",
    },
    {
      name: "Converse Chuck Taylor",
      slug: "converse-chuck-taylor",
      description: "Classic high-top canvas sneakers.",
      brand: "Converse",
      size: 41,
      gender: "unisex",
      condition: "good",
      price: 7000,
      discountedPrice: 6000,
      category: "sneakers",
      quantity: 1,
      tags: ["converse"],
      images: [],
      user: "68f889f7e87a5c224927bfc5",
      createdBy: "68f889f7e87a5c224927bfc5",
    },
    {
      name: "Adidas Stan Smith",
      slug: "adidas-stan-smith",
      description: "Minimalist leather tennis shoes.",
      brand: "Adidas",
      size: 42,
      gender: "men",
      condition: "like new",
      price: 10000,
      discountedPrice: 8500,
      category: "sneakers",
      quantity: 1,
      tags: ["adidas"],
      images: [],
      user: "68f889f7e87a5c224927bfc5",
      createdBy: "68f889f7e87a5c224927bfc5",
    },
    {
      name: "Timberland Classic Boot",
      slug: "timberland-classic-boot",
      description: "Durable waterproof leather boots.",
      brand: "Timberland",
      size: 43,
      gender: "men",
      condition: "good",
      price: 18000,
      discountedPrice: 16000,
      category: "boots",
      quantity: 1,
      tags: ["boots"],
      images: [],
      user: "68f889f7e87a5c224927bfc5",
      createdBy: "68f889f7e87a5c224927bfc5",
    },
    {
      name: "Dr Martens 1460",
      slug: "dr-martens-1460",
      description: "Iconic leather combat boots.",
      brand: "Dr Martens",
      size: 42,
      gender: "unisex",
      condition: "good",
      price: 17000,
      discountedPrice: 15000,
      category: "boots",
      quantity: 1,
      tags: ["boots"],
      images: [],
      user: "68f889f7e87a5c224927bfc5",
      createdBy: "68f889f7e87a5c224927bfc5",
    },
    {
      name: "Nike Revolution 6",
      slug: "nike-revolution-6",
      description: "Comfortable everyday running shoes.",
      brand: "Nike",
      size: 41,
      gender: "men",
      condition: "good",
      price: 8000,
      discountedPrice: 6800,
      category: "sports",
      quantity: 1,
      tags: ["nike", "running"],
      images: [],
      user: "68f889f7e87a5c224927bfc5",
      createdBy: "68f889f7e87a5c224927bfc5",
    },
  ];
  const productsWithSku = products.map((product, index) => ({
    ...product,
    sku: `SKU-${Date.now()}-${index}`,
    user: user._id,
    createdBy: user._id,
  }));
  await Product.deleteMany({});
  const createdProducts = await Product.insertMany(productsWithSku);
  res.status(201).json({
    msg: "Products created successfully",
    count: createdProducts.length,
    products: createdProducts,
  });
};

const seedReviews = async (req, res) => {
  const users = await User.find({ role: "user" }).limit(5);
  const products = await Product.find({});

  if (users.length < 5 || products.length === 0) {
    return res.status(400).json({
      msg: "Please create at least 5 standard users and some products first",
    });
  }

  const reviewsCount = { success: 0, failed: 0 };

  for (const product of products) {
    for (let index = 0; index < users.length; index++) {
      const user = users[index];
      const review = {
        rating: (index % 5) + 1,
        title: `Review ${index + 1} for ${product.name}`,
        comment: `This is a sample review comment from ${user.name} for the amazing product.`,
        user: user._id,
        product: product._id,
      };
      try {
        await Review.create(review);
        reviewsCount.success++;
      } catch (error) {
        reviewsCount.failed++;
      }
    }
  }

  res.status(201).json({ msg: "Reviews seed finished", counts: reviewsCount });
};

const seedOrders = async (req, res) => {
  const user = await User.findOne({});
  const product = await Product.findOne({});
  if (!user || !product) {
    return res
      .status(400)
      .json({ msg: "Please create a user and a product first" });
  }

  const orderItems = [
    {
      name: product.name,
      image: product.image,
      price: product.price,
      amount: 2,
      product: product._id,
    },
  ];

  const tax = 400;
  const shippingFee = 1000;
  const subtotal = product.price * 2;
  const total = tax + shippingFee + subtotal;

  const order = {
    tax,
    shippingFee,
    subtotal,
    total,
    orderItems,
    status: "paid",
    user: user._id,
    clientSecret: "dummy_stripe_client_secret_123",
  };

  const createdOrder = await Order.create(order);
  res
    .status(201)
    .json({ msg: "Order created successfully", order: createdOrder });
};

module.exports = { seedUsers, seedProducts, seedReviews, seedOrders };

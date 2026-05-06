const express = require("express");
const router = express.Router();

const {
    seedUsers,
    seedProducts,
    seedReviews,
    seedOrders,
} = require("../controllers/seedController");

router.post("/users", seedUsers);
router.post("/products", seedProducts);
router.post("/reviews", seedReviews);
router.post("/orders", seedOrders);

module.exports = router;

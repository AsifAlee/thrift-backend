const { StatusCodes } = require("http-status-codes");
const Review = require("../models/Review");
const Product = require("../models/Product");
const { NotFoundError, BadRequestError } = require("../errors");
const checkPermission = require("../utils/checkPermission");

const createReview = async (req, res) => {
  // console.log("user id:", req.user);
  const { product: productId } = req.body;
  req.body.user = req.user.userId;
  const isValidProduct = await Product.findById(productId);
  if (!isValidProduct) {
    throw new NotFoundError("product not found");
  }
  const alreadyReviewd = await Review.find({
    product: productId,
    user: req.user.userId,
  });
  // console.log("reviewved:", alreadyReviewd);
  if (alreadyReviewd.length) {
    throw new BadRequestError("Review Already submitted");
  }
  const review = await Review.create({ ...req.body, user: req.user.userId });
  res
    .status(StatusCodes.CREATED)
    .json({ reveiw: review, msg: "Review Created" });
};
const updateReview = async (req, res) => {
  const { id: reviewId } = req.params;
  const { rating, title, comment } = req.body;
  const review = await Review.findById({ _id: reviewId });
  if (!review) {
    throw new NotFoundError(`No review with id :${reviewId}`);
  }
  checkPermission(req.user, review.user);
  review.rating = rating;
  review.title = title;
  review.comment = comment;
  await review.save();
  res.status(StatusCodes.OK).json({ review, msg: "Review updaiton success!" });
};

const deleteReview = async (req, res) => {
  const { id: reviewId } = req.params;
  const review = await Review.findById({ _id: reviewId });
  if (!review) {
    throw new NotFoundError(`No review with id :${reviewId}`);
  }
  checkPermission(req.user, review.user);
  await review.remove();
  res.status(StatusCodes.OK).json({ msg: "Success! Review removed" });
};
const getAllReviews = async (req, res) => {
  const allReviews = await Review.find({}).populate("user").populate("product");
  res.status(StatusCodes.OK).json({ allReviews, count: allReviews.length });
};

const getSingleReview = async (req, res) => {
  const singleReview = await Review.findById(req.params.id).populate("user");
  if (!singleReview) {
    throw new NotFoundError(`No review with id :${req.params.id}`);
  }
  res.status(StatusCodes.OK).json({ singleReview });
};

const getSingleProductReviews = async (req, res) => {
  const { id: productId } = req.params;
  const productReviews = await Review.find({ product: productId });
  res
    .status(StatusCodes.OK)
    .json({ productReviews, count: productReviews.length });
};

module.exports = {
  createReview,
  updateReview,
  deleteReview,
  getAllReviews,
  getSingleReview,
  getSingleProductReviews,
};

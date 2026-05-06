const { StatusCodes } = require("http-status-codes");
const path = require("path");

const Product = require("../models/Product");
const { NotFoundError, CustomAPIError, BadRequestError } = require("../errors");
const slugify = require("slugify");
const cloudinary = require("../config/cloudinary").v2;

// const createProduct = async (req, res) => {
//   const { body } = req;
//   body.user = req.user.userId;
//   const product = await Product.create(body);

//   res.status(StatusCodes.CREATED).json(product);
// };

// CREATE PRODUCT
const createProduct = async (req, res) => {
  const {
    name,
    description,
    brand,
    size,
    gender,
    condition,
    price,
    discountedPrice,
    category,
    tags,
    images,
  } = req.body;

  // if (!images || images.length === 0) {
  //   return res.status(400).json({
  //     message: "Please upload at least one image",
  //   });
  // }

  const slug = slugify(`${name}-${size}`, { lower: true });

  const product = await Product.create({
    name,
    slug,
    description,
    brand,
    size,
    gender,
    condition,
    price,
    discountedPrice,
    category,
    images,
    tags,
    user: req.user.userId,
    createdBy: req.user.userId,
  });

  res.status(201).json({
    product,
    message: "Product created successfully",
  });
};
const getAllProducts = async (req, res) => {
  const products = await Product.find({});
  res.status(StatusCodes.OK).json({ products });
};
const getSingleProduct = async (req, res) => {
  // console.log("params:", req.params);
  const singleProduct = await Product.findById({ _id: req.params.id }).populate(
    "reviews",
  );
  if (!singleProduct) throw new NotFoundError(`Not found with id${req.params}`);
  res.status(StatusCodes.OK).json({ singleProduct });
};
const updateProduct = async (req, res) => {
  const { body } = req;
  const product = await Product.findOneAndUpdate({ _id: req.params.id }, body, {
    new: true,
    runValidators: true,
  });
  res.status(StatusCodes.OK).json({
    product: product,
  });
};

const deleteProduct = async (req, res) => {
  // console.log("delete product controller called", req.params.id);
  const product = await Product.findByIdAndDelete({ _id: req.params.id });
  res.status(StatusCodes.OK).json({
    product: product,
    msg: "Deleted success",
  });
};

module.exports = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
};

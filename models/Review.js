const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      trim: true,
      required: [true, "Title is required"],
      maxLength: 100,
    },
    comment: {
      type: String,
      required: [true, "comment is required"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

ReviewSchema.statics.calculateAverageRating = async function (productId) {
  const result = await this.aggregate([
    {
      $match: { product: productId },
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        numberOfReviews: { $sum: 1 },
      },
    },
  ]);
  try {
    await this.model("Product").findByIdAndUpdate(productId, {
      averageRating: Math.ceil(result[0]?.averageRating || 0),
      numberOfReviews: result[0]?.numberOfReviews || 0,
    });
  } catch (error) {
    console.log(error);
  }
};
ReviewSchema.post("save", async function () {
  await this.constructor.calculateAverageRating(this.product);
  // console.log("save called");
});
ReviewSchema.post("remove", async function () {
  await this.constructor.calculateAverageRating(this.product);
  // console.log("remove called");
});

module.exports = mongoose.model("Review", ReviewSchema);

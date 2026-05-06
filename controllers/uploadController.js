const { StatusCodes } = require("http-status-codes");

const cloudinary = require("cloudinary").v2;

const uploadImage = async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "No files uploaded",
    });
  }

  const uploadedImages = [];

  for (const file of req.files) {
    const result = await cloudinary.uploader.upload(
      `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
      {
        folder: "thrift-shoes",
      },
    );

    uploadedImages.push({
      imageUrl: result.secure_url,
      public_id: result.public_id,
    });
  }

  res.status(StatusCodes.OK).json({
    images: uploadedImages,
  });
};

const deleteImage = async (req, res) => {
  const { public_id } = req.body;
  console.log("delete image controller called", public_id);

  if (!public_id) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "public_id is required",
    });
  }

  try {
    const result = await cloudinary.uploader.destroy(public_id);

    if (result.result !== "ok") {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Image deletion failed",
      });
    }

    res.status(StatusCodes.OK).json({
      message: "Image deleted successfully",
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Error deleting image",
      error: error.message,
    });
  }
};
module.exports = {
  uploadImage,
  deleteImage,
};

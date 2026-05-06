const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

const { authenticateUser } = require("../middleware/authentication");
const { authorizePermissions } = require("../middleware/authentication");
const { uploadImage, deleteImage } = require("../controllers/uploadController");
console.log("upload routes called");

router.route("/").post(
  // authenticateUser,
  // authorizePermissions("admin"),
  upload.array("images", 5),
  uploadImage,
);

// router.post("/", upload.array("images", 5), (req, res) => {
//   console.log("req files:", req.files);
//   res.json({ files: req.files });
// });

router.route("/").delete(
  // authenticateUser,
  // authorizePermissions("admin"),
  deleteImage,
);

module.exports = router;

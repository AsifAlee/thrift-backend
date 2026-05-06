const cloudinary = require("cloudinary").v2;
// console.log("cloud name:", process.env.CLOUDNAME);
// console.log("api key:", process.env.CLOUD_API_KEY);
// console.log("api secret:", process.env.CLOUD_API_SECRET);

cloudinary.config({
  cloud_name: process.env.CLOUDNAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

module.exports = cloudinary;

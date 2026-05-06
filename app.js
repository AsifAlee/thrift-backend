require("dotenv").config();
require("express-async-errors");
const morgan = require("morgan");
const express = require("express");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");
const productRouter = require("./routes/productRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const orderRouter = require("./routes/orderRoutes");
const seedRouter = require("./routes/seedRoutes");
const uploadRouter = require("./routes/uploadRoutes");
const connectDB = require("./db/connect");
const notFound = require("./middleware/not-found");
const swaggerUI = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./swagger.yaml");
const errorHandlerMiddleware = require("./middleware/error-handler");
const expressRateLimit = require("express-rate-limit");
const xss = require("xss-clean");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const cartRouter = require("./routes/cartRoutes");
const webHookRouter = require("./routes/webHookRoutes");

const limiter = expressRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes",
});

const app = express();
app.use(limiter);
app.use("/api/v1/webhook", webHookRouter);
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(xss());
app.use(mongoSanitize());

app.use(express.static("./public"));
app.use(morgan("tiny"));
// app.use(fileUpload());
app.use(cookieParser(process.env.JWT_SECRET));

const PORT = process.env.PORT || 3000;

app.get("/api/v1", (req, res) => {
  // console.log("cookie", req.signedCookies);
  res.json({ msg: "Hello World" });
});

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/seed", seedRouter);
app.use("/api/v1/upload", uploadRouter);
app.use("/api/v1/cart", cartRouter);

app.use(notFound);
app.use(errorHandlerMiddleware);

const start = async () => {
  try {
    app.listen(PORT, async () => {
      // console.log(`Server is running on port ${process.env.PORT}`);
      await connectDB(process.env.MONGO_URI);
      console.log(`Connected to the database on ${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error);
  }
};

start();

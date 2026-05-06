// routes/webhookRoutes.js
const express = require("express");
const webhookRouter = express.Router();

const { webhookHandler } = require("../controllers/webHookController");

// IMPORTANT: raw body
webhookRouter.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  webhookHandler,
);

module.exports = webhookRouter;

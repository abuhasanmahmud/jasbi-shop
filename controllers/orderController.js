import asyncHandler from "express-async-handler";
import Order from "../model/orderModel.js";
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import Stripe from "stripe";

// import stripe = require("stripe")(process.env.STRIP_SECRET_KEY);
const stripe = Stripe(process.env.STRIP_SECRET_KEY);

//get all orders
//method get  /api/orders

const getAllOrders = asyncHandler(async (req, res) => {
  const allOrders = await Order.find();
  // console.log("allorders", allOrders);
  res.status(200).json(allOrders);
});

//create a new order
//method post  /api/orders/new

const createNewOrder = asyncHandler(async (req, res) => {
  const orderData = req.body;
  // console.log("order data", req.body);
  // console.log("order alsdkjflaksjdfla");
  const newOrder = await Order.create(orderData);

  res.status(200).json(newOrder);
});

const paymentOrderByStripe = asyncHandler(async (req, res) => {
  // console.log("req.body", req.body);
  try {
    const session = await stripe.checkout.sessions.create({
      line_items: req.body.lineItems,
      mode: "payment",
      payment_method_types: ["card"],
      success_url: `${process.env.FRONTEND_URL}/checkout`,
      cancel_url: `${process.env.FRONTEND_URL}/checkout`,
    });

    console.log("session", session);
    return res.status(201).json(session);
  } catch (error) {
    return res.status(500).json(error);
  }
});

const calculateOrderAmount = (items) => {
  return 1400;
};

export { getAllOrders, createNewOrder, paymentOrderByStripe };

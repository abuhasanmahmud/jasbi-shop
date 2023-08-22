import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
const app = express();
dotenv.config();
import { notFound, errorHandler } from "../middleware/errorMiddleware.js";
const port = process.env.PORT || 5000;
import userRoutes from "../routes/userRoutes.js";
import productRoutes from "../routes/productRoutes.js";
import orderRoutes from "../routes/orderRoutes.js";
import connectDb from "../config/db.js";

connectDb();
app.use(cors());
app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use("/", (req, res) => {
//   res.send("app successfully running");
// });
// console.log("ss");

app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders/", orderRoutes);

//error handeler
app.use(notFound);
app.use(errorHandler);

app.use("/", (req, res, next) => {
  res.status(200).json({
    message: "bad request",
  });
});

app.listen(port, () => {
  console.log(`server is runningss port ${port}`);
});

import express from "express";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/my", protect, async (req, res, next) => {
  try {
    const orders = await Order.find({ buyer: req.user._id })
      .populate("product", "title imageUrl category")
      .populate("seller", "name ratingAverage ratingCount location avatarUrl")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    next(error);
  }
});

router.post("/", protect, async (req, res, next) => {
  try {
    const { productId } = req.body;
    const product = await Product.findById(productId);

    if (!product) return res.status(404).json({ message: "Product not found" });
    if (String(product.seller) === String(req.user._id)) {
      return res.status(400).json({ message: "Sellers cannot buy their own product" });
    }

    const order = await Order.create({
      buyer: req.user._id,
      seller: product.seller,
      product: product._id,
      totalAmount: product.price,
      status: "completed"
    });

    const populated = await order.populate([
      { path: "product", select: "title imageUrl category" },
      { path: "seller", select: "name ratingAverage ratingCount location avatarUrl" }
    ]);

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
});

export default router;


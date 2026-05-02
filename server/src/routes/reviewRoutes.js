import express from "express";
import { Order } from "../models/Order.js";
import { Review } from "../models/Review.js";
import { User } from "../models/User.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

async function refreshSellerRating(sellerId) {
  const stats = await Review.aggregate([
    { $match: { seller: sellerId } },
    { $group: { _id: "$seller", avg: { $avg: "$rating" }, count: { $sum: 1 } } }
  ]);

  const ratingAverage = stats[0] ? Number(stats[0].avg.toFixed(1)) : 0;
  const ratingCount = stats[0]?.count || 0;
  await User.findByIdAndUpdate(sellerId, { ratingAverage, ratingCount });
}

router.get("/seller/:sellerId", async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 5, 1), 20);

    const [items, total] = await Promise.all([
      Review.find({ seller: req.params.sellerId })
        .populate("buyer", "name avatarUrl")
        .populate("product", "title imageUrl")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Review.countDocuments({ seller: req.params.sellerId })
    ]);

    res.json({ items, page, pages: Math.ceil(total / limit), total });
  } catch (error) {
    next(error);
  }
});

router.post("/", protect, async (req, res, next) => {
  try {
    const { orderId, rating, title, comment, wouldRecommend = true } = req.body;
    const order = await Order.findById(orderId);

    if (!order) return res.status(404).json({ message: "Order not found" });
    if (String(order.buyer) !== String(req.user._id)) {
      return res.status(403).json({ message: "Only the buyer for this order can review" });
    }
    if (!["delivered", "completed"].includes(order.status)) {
      return res.status(400).json({ message: "Review allowed only after delivery or completion" });
    }
    if (order.reviewed) {
      return res.status(409).json({ message: "This order is already reviewed" });
    }

    const review = await Review.create({
      buyer: req.user._id,
      seller: order.seller,
      product: order.product,
      order: order._id,
      rating,
      title,
      comment,
      wouldRecommend
    });

    order.reviewed = true;
    await order.save();
    await refreshSellerRating(order.seller);

    const populated = await review.populate([
      { path: "buyer", select: "name avatarUrl" },
      { path: "product", select: "title imageUrl" }
    ]);

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
});

export default router;


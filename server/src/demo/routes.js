import bcrypt from "bcryptjs";
import express from "express";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import { signToken } from "../utils/tokens.js";
import {
  demo,
  getRoomId,
  populateMessage,
  populateOrder,
  populateProduct,
  populateReview,
  publicUser,
  refreshSellerRating
} from "./data.js";

const router = express.Router();

function protectDemo(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication token missing or invalid" });
    }

    const decoded = jwt.verify(header.split(" ")[1], process.env.JWT_SECRET);
    const user = demo.users.find((item) => item._id === decoded.id);

    if (!user) return res.status(401).json({ message: "Authentication token missing or invalid" });
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Authentication token missing or invalid" });
  }
}

function authResponse(user) {
  return { token: signToken(user), user: publicUser(user) };
}

router.post("/auth/register", async (req, res) => {
  const { name, email, password, role = "buyer", location = "" } = req.body;
  if (demo.users.some((user) => user.email === email)) {
    return res.status(409).json({ message: "Email is already registered" });
  }

  const user = {
    _id: randomUUID(),
    name,
    email,
    password: await bcrypt.hash(password, 12),
    role,
    location,
    avatarUrl: "",
    bio: "",
    ratingAverage: 0,
    ratingCount: 0
  };

  demo.users.push(user);
  res.status(201).json(authResponse(user));
});

router.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = demo.users.find((item) => item.email === email);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  res.json(authResponse(user));
});

router.get("/auth/me", protectDemo, (req, res) => {
  res.json(authResponse(req.user));
});

router.get("/products", (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 6, 1), 24);
  const category = req.query.category;
  const search = String(req.query.search || "").toLowerCase();

  let items = demo.products;
  if (category && category !== "all") items = items.filter((product) => product.category === category);
  if (search) items = items.filter((product) => product.title.toLowerCase().includes(search));

  const total = items.length;
  const paged = items.slice((page - 1) * limit, page * limit).map(populateProduct);
  res.json({ items: paged, page, pages: Math.ceil(total / limit) || 1, total });
});

router.get("/products/:id", (req, res) => {
  const product = demo.products.find((item) => item._id === req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(populateProduct(product));
});

router.get("/orders/my", protectDemo, (req, res) => {
  res.json(demo.orders.filter((order) => order.buyer === req.user._id).map(populateOrder));
});

router.post("/orders", protectDemo, (req, res) => {
  const product = demo.products.find((item) => item._id === req.body.productId);
  if (!product) return res.status(404).json({ message: "Product not found" });
  if (product.seller === req.user._id) return res.status(400).json({ message: "Sellers cannot buy their own product" });

  const order = {
    _id: randomUUID(),
    buyer: req.user._id,
    seller: product.seller,
    product: product._id,
    status: "completed",
    totalAmount: product.price,
    reviewed: false,
    createdAt: new Date().toISOString()
  };

  demo.orders.unshift(order);
  res.status(201).json(populateOrder(order));
});

router.get("/reviews/seller/:sellerId", (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 5, 1), 20);
  const items = demo.reviews.filter((review) => review.seller === req.params.sellerId);
  const total = items.length;

  res.json({
    items: items.slice((page - 1) * limit, page * limit).map(populateReview),
    page,
    pages: Math.ceil(total / limit) || 1,
    total
  });
});

router.post("/reviews", protectDemo, (req, res) => {
  const { orderId, rating, title, comment, wouldRecommend = true } = req.body;
  const order = demo.orders.find((item) => item._id === orderId);

  if (!order) return res.status(404).json({ message: "Order not found" });
  if (order.buyer !== req.user._id) return res.status(403).json({ message: "Only the buyer for this order can review" });
  if (order.reviewed) return res.status(409).json({ message: "This order is already reviewed" });

  const review = {
    _id: randomUUID(),
    buyer: req.user._id,
    seller: order.seller,
    product: order.product,
    order: order._id,
    rating: Number(rating),
    title,
    comment,
    wouldRecommend,
    createdAt: new Date().toISOString()
  };

  demo.reviews.unshift(review);
  order.reviewed = true;
  refreshSellerRating(order.seller);
  res.status(201).json(populateReview(review));
});

router.get("/chat/:userId", protectDemo, (req, res) => {
  const roomId = getRoomId(req.user._id, req.params.userId);
  const messages = demo.messages.filter((message) => message.roomId === roomId).map(populateMessage);
  res.json({ roomId, messages });
});

export default router;
export { protectDemo };

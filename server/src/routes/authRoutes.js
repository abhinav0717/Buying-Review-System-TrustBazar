import express from "express";
import { User } from "../models/User.js";
import { protect } from "../middleware/auth.js";
import { signToken } from "../utils/tokens.js";

const router = express.Router();

function authResponse(user) {
  return {
    token: signToken(user),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      location: user.location,
      ratingAverage: user.ratingAverage,
      ratingCount: user.ratingCount
    }
  };
}

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password, role = "buyer", location = "" } = req.body;
    const exists = await User.findOne({ email });

    if (exists) {
      return res.status(409).json({ message: "Email is already registered" });
    }

    const user = await User.create({ name, email, password, role, location });
    res.status(201).json(authResponse(user));
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json(authResponse(user));
  } catch (error) {
    next(error);
  }
});

router.get("/me", protect, (req, res) => {
  res.json(authResponse(req.user));
});

export default router;


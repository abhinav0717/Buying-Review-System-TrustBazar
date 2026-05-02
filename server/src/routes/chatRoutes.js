import express from "express";
import { ChatMessage } from "../models/ChatMessage.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

export function getRoomId(userA, userB) {
  return [String(userA), String(userB)].sort().join(":");
}

router.get("/:userId", protect, async (req, res, next) => {
  try {
    const roomId = getRoomId(req.user._id, req.params.userId);
    const messages = await ChatMessage.find({ roomId })
      .populate("sender", "name avatarUrl")
      .populate("receiver", "name avatarUrl")
      .sort({ createdAt: 1 })
      .limit(100);

    res.json({ roomId, messages });
  } catch (error) {
    next(error);
  }
});

export default router;


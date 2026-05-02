import "dotenv/config";
import mongoose from "mongoose";
import { connectDb } from "./config/db.js";
import { ChatMessage } from "./models/ChatMessage.js";
import { Order } from "./models/Order.js";
import { Product } from "./models/Product.js";
import { Review } from "./models/Review.js";
import { User } from "./models/User.js";
import { getRoomId } from "./routes/chatRoutes.js";

async function seed() {
  await connectDb();

  await Promise.all([
    ChatMessage.deleteMany({}),
    Review.deleteMany({}),
    Order.deleteMany({}),
    Product.deleteMany({}),
    User.deleteMany({})
  ]);

  const [buyer, seller, secondSeller] = await User.create([
    {
      name: "Aarav Sharma",
      email: "buyer@trustbazaar.dev",
      password: "Password@123",
      role: "buyer",
      location: "Delhi",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80"
    },
    {
      name: "Meera Crafts Co.",
      email: "seller@trustbazaar.dev",
      password: "Password@123",
      role: "seller",
      location: "Jaipur",
      bio: "Handmade decor and ethical lifestyle goods with careful packaging.",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80"
    },
    {
      name: "Urban Gear Studio",
      email: "urban@trustbazaar.dev",
      password: "Password@123",
      role: "seller",
      location: "Bengaluru",
      bio: "Compact tech accessories and everyday carry essentials.",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80"
    }
  ]);

  const products = await Product.create([
    {
      title: "Block Printed Cotton Tote",
      description: "Durable everyday tote made by local artisans with washable natural cotton.",
      category: "Handmade",
      price: 899,
      imageUrl: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=80",
      seller: seller._id
    },
    {
      title: "Ceramic Desk Planter Set",
      description: "Three glazed ceramic planters for work desks, balconies, and gifting.",
      category: "Home",
      price: 1299,
      imageUrl: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=900&q=80",
      seller: seller._id
    },
    {
      title: "Magnetic Cable Organizer",
      description: "Minimal cable clips for clean desks and travel bags.",
      category: "Tech",
      price: 499,
      imageUrl: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=900&q=80",
      seller: secondSeller._id
    },
    {
      title: "Canvas Laptop Sleeve",
      description: "Padded 14-inch sleeve with water-resistant canvas and soft lining.",
      category: "Accessories",
      price: 1599,
      imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
      seller: secondSeller._id
    }
  ]);

  const order = await Order.create({
    buyer: buyer._id,
    seller: seller._id,
    product: products[0]._id,
    totalAmount: products[0].price,
    status: "completed",
    reviewed: true
  });

  await Review.create({
    buyer: buyer._id,
    seller: seller._id,
    product: products[0]._id,
    order: order._id,
    rating: 5,
    title: "Reliable seller and beautiful product",
    comment: "The tote arrived on time, matched the photos, and the seller answered sizing questions quickly.",
    wouldRecommend: true
  });

  await User.findByIdAndUpdate(seller._id, { ratingAverage: 5, ratingCount: 1 });

  await ChatMessage.create({
    roomId: getRoomId(buyer._id, seller._id),
    sender: buyer._id,
    receiver: seller._id,
    text: "Hi, is the tote washable?"
  });

  await ChatMessage.create({
    roomId: getRoomId(buyer._id, seller._id),
    sender: seller._id,
    receiver: buyer._id,
    text: "Yes, gentle cold wash works best."
  });

  console.log("Seed complete");
  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});


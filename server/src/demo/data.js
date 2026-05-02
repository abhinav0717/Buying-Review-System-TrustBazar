import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

export const demo = {
  users: [],
  products: [],
  orders: [],
  reviews: [],
  messages: []
};

export function getRoomId(userA, userB) {
  return [String(userA), String(userB)].sort().join(":");
}

export async function loadDemoData() {
  const buyerPassword = await bcrypt.hash("Password@123", 12);
  const sellerPassword = await bcrypt.hash("Password@123", 12);

  const buyer = {
    _id: "buyer-1",
    name: "Aarav Sharma",
    email: "buyer@trustbazaar.dev",
    password: buyerPassword,
    role: "buyer",
    location: "Delhi",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80",
    ratingAverage: 0,
    ratingCount: 0
  };

  const seller = {
    _id: "seller-1",
    name: "Meera Crafts Co.",
    email: "seller@trustbazaar.dev",
    password: sellerPassword,
    role: "seller",
    location: "Jaipur",
    bio: "Handmade decor and ethical lifestyle goods with careful packaging.",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80",
    ratingAverage: 5,
    ratingCount: 1
  };

  const secondSeller = {
    _id: "seller-2",
    name: "Urban Gear Studio",
    email: "urban@trustbazaar.dev",
    password: sellerPassword,
    role: "seller",
    location: "Bengaluru",
    bio: "Compact tech accessories and everyday carry essentials.",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80",
    ratingAverage: 0,
    ratingCount: 0
  };

  demo.users = [buyer, seller, secondSeller];
  demo.products = [
    {
      _id: "product-1",
      title: "Block Printed Cotton Tote",
      description: "Durable everyday tote made by local artisans with washable natural cotton.",
      category: "Handmade",
      price: 899,
      imageUrl: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=80",
      seller: seller._id,
      stock: 10,
      createdAt: new Date().toISOString()
    },
    {
      _id: "product-2",
      title: "Ceramic Desk Planter Set",
      description: "Three glazed ceramic planters for work desks, balconies, and gifting.",
      category: "Home",
      price: 1299,
      imageUrl: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=900&q=80",
      seller: seller._id,
      stock: 8,
      createdAt: new Date().toISOString()
    },
    {
      _id: "product-3",
      title: "Magnetic Cable Organizer",
      description: "Minimal cable clips for clean desks and travel bags.",
      category: "Tech",
      price: 499,
      imageUrl: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=900&q=80",
      seller: secondSeller._id,
      stock: 20,
      createdAt: new Date().toISOString()
    },
    {
      _id: "product-4",
      title: "Canvas Laptop Sleeve",
      description: "Padded 14-inch sleeve with water-resistant canvas and soft lining.",
      category: "Accessories",
      price: 1599,
      imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
      seller: secondSeller._id,
      stock: 14,
      createdAt: new Date().toISOString()
    }
  ];

  demo.orders = [
    {
      _id: "order-1",
      buyer: buyer._id,
      seller: seller._id,
      product: "product-1",
      status: "completed",
      totalAmount: 899,
      reviewed: true,
      createdAt: new Date().toISOString()
    }
  ];

  demo.reviews = [
    {
      _id: "review-1",
      buyer: buyer._id,
      seller: seller._id,
      product: "product-1",
      order: "order-1",
      rating: 5,
      title: "Reliable seller and beautiful product",
      comment: "The tote arrived on time, matched the photos, and the seller answered sizing questions quickly.",
      wouldRecommend: true,
      createdAt: new Date().toISOString()
    }
  ];

  demo.messages = [
    {
      _id: randomUUID(),
      roomId: getRoomId(buyer._id, seller._id),
      sender: buyer._id,
      receiver: seller._id,
      text: "Hi, is the tote washable?",
      createdAt: new Date().toISOString()
    },
    {
      _id: randomUUID(),
      roomId: getRoomId(buyer._id, seller._id),
      sender: seller._id,
      receiver: buyer._id,
      text: "Yes, gentle cold wash works best.",
      createdAt: new Date().toISOString()
    }
  ];
}

export function publicUser(user) {
  if (!user) return null;
  const { password, ...rest } = user;
  return { ...rest, id: user._id };
}

export function populateProduct(product) {
  return { ...product, seller: publicUser(demo.users.find((user) => user._id === product.seller)) };
}

export function populateOrder(order) {
  return {
    ...order,
    seller: publicUser(demo.users.find((user) => user._id === order.seller)),
    product: demo.products.find((product) => product._id === order.product)
  };
}

export function populateReview(review) {
  return {
    ...review,
    buyer: publicUser(demo.users.find((user) => user._id === review.buyer)),
    product: demo.products.find((product) => product._id === review.product)
  };
}

export function populateMessage(message) {
  return {
    ...message,
    sender: publicUser(demo.users.find((user) => user._id === message.sender)),
    receiver: publicUser(demo.users.find((user) => user._id === message.receiver))
  };
}

export function refreshSellerRating(sellerId) {
  const sellerReviews = demo.reviews.filter((review) => review.seller === sellerId);
  const seller = demo.users.find((user) => user._id === sellerId);
  if (!seller) return;

  seller.ratingCount = sellerReviews.length;
  seller.ratingAverage = sellerReviews.length
    ? Number((sellerReviews.reduce((total, review) => total + Number(review.rating), 0) / sellerReviews.length).toFixed(1))
    : 0;
}


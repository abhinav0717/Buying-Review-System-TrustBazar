# TrustBazaar Capstone

TrustBazaar is a real-world marketplace trust system where buyers can rate sellers only after a completed purchase. The project demonstrates JWT authentication, database relationships, buyer reviews, seller reputation, real-time chat, pagination, professional Tailwind UI, and deployment-ready frontend/backend separation.

## Tech Stack

- Frontend: React, Vite, JavaScript ES6+, React Router, Redux Toolkit, Axios, Tailwind CSS
- Backend: Node.js, Express, MongoDB, Mongoose, JWT, Socket.io
- Deployment: Vercel for `client`, Render for `server`

## Real-World Problem

Online marketplaces struggle with trust. Buyers need confidence before purchasing from unknown sellers, and sellers need credible proof of service quality. TrustBazaar solves this by linking reviews to verified completed orders. A buyer cannot review a seller unless an order exists between them, which reduces fake reviews and creates transparent seller reputation.

## Database Relationships

- User `1 -> many` Products as seller
- User `1 -> many` Orders as buyer
- Product `1 -> many` Orders
- Seller User `1 -> many` Orders
- Order `1 -> 1` Review
- Seller User `1 -> many` Reviews
- User `many -> many` User through ChatMessage participants

## Local Setup

1. Install dependencies:

```bash
npm.cmd run install:all
```

2. Copy environment files:

```bash
copy server\.env.example server\.env
copy client\.env.example client\.env
```

3. Update `server/.env` with your MongoDB connection string and JWT secret.

4. Seed demo data:

```bash
npm.cmd run seed
```

5. Start both apps:

```bash
npm.cmd run dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:5000

## Demo Accounts

- Buyer: `buyer@trustbazaar.dev` / `Password@123`
- Seller: `seller@trustbazaar.dev` / `Password@123`

## Deployment

### Render Backend

- Root directory: `server`
- Build command: `npm install`
- Start command: `npm start`
- Environment variables:
  - `MONGODB_URI`
  - `JWT_SECRET`
  - `CLIENT_URL`
  - `NODE_ENV=production`

### Vercel Frontend

- Root directory: `client`
- Build command: `npm run build`
- Output directory: `dist`
- Environment variables:
  - `VITE_API_URL=https://your-render-service.onrender.com/api`
  - `VITE_SOCKET_URL=https://your-render-service.onrender.com`


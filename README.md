# TrustBazaar Capstone

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/abhinav0717/Buying-Review-System-TrustBazar)

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

3. For instant local demo mode, set `DEMO_MODE=true` in `server/.env`. MongoDB is not required in this mode.

4. To use MongoDB instead, set `DEMO_MODE=false`, add your `MONGODB_URI`, and seed demo data:

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

### One-Link Render Deployment

The root `render.yaml` can deploy the backend and serve the React build from the same Render service. This is the easiest college-demo deployment because the deployed app uses `DEMO_MODE=true` and does not require MongoDB.

- Root directory: repository root
- Build command: `npm install --prefix server && npm install --prefix client && npm run build --prefix client`
- Start command: `npm start --prefix server`
- Environment variables:
  - `NODE_ENV=production`
  - `DEMO_MODE=true`
  - `JWT_SECRET`
  - `CLIENT_URL=*`

### Render Backend Only

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

# Precision Spring Supply — Setup Guide

## Prerequisites

You need **Node.js 18+** installed. Download from https://nodejs.org (LTS version).

After installing, restart your terminal / VS Code, then verify:
```
node --version   # should show v18.x or higher
npm --version    # should show 9.x or higher
```

---

## Quick Start (3 steps)

### 1. Install server dependencies
Open a terminal in this folder (`website foldfer`) and run:
```
npm install
```

### 2. Install client dependencies
```
cd client
npm install
cd ..
```

### 3. Seed the database and start both servers

**Terminal 1 — Seed database (run once):**
```
npm run seed
```

**Terminal 2 — Start the backend API server:**
```
npm run dev
```
Server runs at http://localhost:5000

**Terminal 3 — Start the frontend dev server:**
```
cd client
npm run dev
```
Frontend runs at http://localhost:5173

Open http://localhost:5173 in your browser.

---

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@precisionsupply.com | Admin123! |
| Wholesale Customer | demo@acmedoors.com | Customer123! |
| Pending Customer | pending@newbiz.com | Pending123! |

---

## Stripe Setup (for real payments)

1. Create a Stripe account at https://stripe.com
2. Get your test keys from the Stripe Dashboard → Developers → API keys
3. Edit `.env` and replace the placeholder values:
   ```
   STRIPE_SECRET_KEY=sk_test_YOUR_ACTUAL_KEY
   ```
4. Edit `client/.env` (create it) and add:
   ```
   VITE_STRIPE_PUBLIC_KEY=pk_test_YOUR_ACTUAL_KEY
   ```
5. For webhooks (optional during dev): use Stripe CLI to forward events:
   ```
   stripe listen --forward-to localhost:5000/api/webhooks/stripe
   ```
   Copy the webhook secret it gives you into `.env` as `STRIPE_WEBHOOK_SECRET`

**Test card numbers:**
- Success: `4242 4242 4242 4242` (any future date, any CVC)
- Decline: `4000 0000 0000 0002`

---

## Production Build

```bash
# Build the React frontend
cd client && npm run build && cd ..

# Run in production mode
NODE_ENV=production npm start
```
The server will serve the built frontend at port 5000.

---

## File Structure

```
website foldfer/
├── server/
│   ├── index.js          # Express app entry point
│   ├── db.js             # SQLite database setup
│   ├── seed.js           # Seed data (products, users)
│   ├── middleware/
│   │   └── auth.js       # JWT authentication middleware
│   └── routes/
│       ├── auth.js       # Login, register, profile
│       ├── products.js   # Product catalog (public + wholesale pricing)
│       ├── categories.js # Product categories
│       ├── cart.js       # Shopping cart (wholesale users only)
│       ├── orders.js     # Order management + Stripe payment
│       ├── shipping.js   # Shipping rate calculator
│       └── admin.js      # Admin dashboard API
├── client/
│   └── src/
│       ├── pages/        # React page components
│       │   ├── Home.jsx       # Landing page
│       │   ├── Catalog.jsx    # Product catalog with filters
│       │   ├── ProductDetail.jsx
│       │   ├── Login.jsx / Register.jsx
│       │   ├── Dashboard.jsx  # Customer dashboard
│       │   ├── Checkout.jsx   # Stripe checkout flow
│       │   ├── OrderHistory.jsx / OrderDetail.jsx
│       │   └── admin/         # Admin panel
│       ├── components/   # Shared components (Navbar, CartSidebar...)
│       └── context/      # React context (Auth, Cart)
├── data.db               # SQLite database (auto-created on first run)
├── .env                  # Environment variables
└── package.json
```

---

## Key Features

- **Public catalog** — browse all products with retail prices, no login needed
- **Wholesale accounts** — apply online, manually approved by admin
- **Wholesale pricing** — approved customers see ~30-45% lower prices
- **Cart & checkout** — full Stripe Payment Intents integration
- **Shipping rates** — zone-based calculator (free ground shipping over $500)
- **Admin dashboard** — manage products, approve customers, update orders, track inventory
- **Inventory tracking** — auto-decremented when orders are paid
- **Low stock alerts** — admin notified when products fall below threshold

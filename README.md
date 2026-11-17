# Piyarathna Tex — online store

A clothing, bags and jewellery store: a static HTML/CSS/JS shopfront with an Express 5 + MongoDB API that runs as a Vercel serverless function.

This started as a WAMP project with a PHP/MySQL backend. The PHP has been replaced with a Node API so the whole thing deploys to Vercel as one project.

## What works

**Shoppers**
- Browse 42 products across five categories, with search and sorting
- Product pages with image thumbnails, size picker and live stock
- A bag that follows you — kept in the browser as a guest, synced to your account once you log in
- Checkout with a delivery address, cash on delivery
- Order history, and a return request on delivered orders
- Sign up, log in, and a password reset with a six-digit code

**Store staff** (`/admin-dashboard.html`)
- Dashboard: orders, revenue, customers and a low-stock list
- Add products, with images uploaded to Cloudinary
- Adjust stock per size, and delete products
- Move orders through Placed → Packing → Shipped → Delivered
- Approve or reject return requests

**Built in**
- Per-page titles, descriptions and Open Graph tags
- `sitemap.xml` generated from the live catalogue, plus `robots.txt`
- A custom 404 page

## Deploy to Vercel

### 1. A free MongoDB database
Create a free **M0** cluster at <https://www.mongodb.com/cloud/atlas>. Add a database user, then under **Network Access** allow `0.0.0.0/0` — Vercel's IP addresses change, so the database has to accept connections from anywhere. Copy the connection string from **Connect → Drivers**.

### 2. A free Cloudinary account
Sign up at <https://cloudinary.com> and copy your cloud name, API key and API secret from the dashboard. This is only needed for uploading new product images; the starter catalogue uses images from this repo.

### 3. Import into Vercel
Import the repo at <https://vercel.com/new>. There's no build step — `vercel.json` serves the HTML directly and routes `/api/*` to the function. Add these environment variables (see `.env.example`):

| Name | Value |
|---|---|
| `MONGODB_URI` | Your Atlas connection string |
| `JWT_SECRET` | A long random string, e.g. `openssl rand -hex 32` |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | The staff login created by the seed script |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | From Cloudinary |
| `SITE_URL` | Your Vercel URL, used by `sitemap.xml` |
| `DEMO_SHOW_OTP` | `true` while there's no email provider — see the note below |

### 4. Load the catalogue
On your computer, once:

```bash
npm install
cp .env.example .env     # paste in the same MONGODB_URI and ADMIN_* values
npm run seed             # 42 products + the admin account
```

### 5. Check it
- `https://YOUR-SITE/api/health` returns `{"success":true}`
- The shop lists products, and a product page shows sizes
- Sign up, add something to your bag and place an order
- Log in at `/admin-dashboard.html` with your `ADMIN_EMAIL`

## Run locally

```bash
npm install
cp .env.example .env
npm run seed
npm run server          # API on http://localhost:4000
npx serve . -p 3000     # or any static server for the HTML
```

In development the API runs on a different port from the pages, so point the
pages at it or run them behind one proxy — on Vercel they share an origin.

## Password reset

There's no email provider connected, so the reset code can't actually be
emailed. While `DEMO_SHOW_OTP` is `true` the API returns the code in its
response and the OTP page displays it, which keeps the flow usable for a demo.
**Set `DEMO_SHOW_OTP=false` before any real use**, and send the code by email
instead — Brevo and Resend both have free tiers. Codes are hashed, expire after
10 minutes and lock out after 5 wrong attempts.

## Project structure

```
api/index.js        Vercel function entry, loads the Express app
server/
  app.js            Express app: middleware, routes, error handler
  routes/           All /api routes
  controllers/      user, product, order/refund, seo
  models/           User, Product, Order, Refund
  config/           MongoDB connection cache, Cloudinary
  seed/             Starter catalogue and seed script
JavaScript/
  api.js            fetch wrapper, money formatting, toasts  (loads first)
  auth.js           login, register, password reset
  cart.js           the bag, synced to the account
  getData.js        shop listing, search and sort
  getDetails.js     product page, sizes and stock
  checkout.js       address form and order placement
  orders.js         order history and returns
  admin.js          the admin panel
ui.css              shared components added on top of the original styles
vercel.json         API rewrites, cache and security headers
```

## API

| Method | Path | Who |
|---|---|---|
| POST | `/api/auth/register`, `/api/auth/login`, `/api/auth/logout` | anyone |
| GET | `/api/auth/me` | anyone |
| POST | `/api/auth/forgot`, `/api/auth/verify-otp`, `/api/auth/reset` | anyone |
| GET | `/api/products`, `/api/products/:id` | anyone |
| GET/POST | `/api/cart` | signed in |
| POST/GET | `/api/orders` · GET `/api/orders/:id` | signed in |
| POST/GET | `/api/refunds` | signed in |
| GET | `/api/admin/stats`, `/api/admin/orders`, `/api/admin/refunds` | admin |
| POST | `/api/admin/products` (multipart) | admin |
| PATCH | `/api/admin/products/:id`, `/api/admin/orders/:id`, `/api/admin/refunds/:id` | admin |
| POST | `/api/admin/products/:id/stock` | admin |
| DELETE | `/api/admin/products/:id` | admin |

## Notes on the rewrite

The original PHP stored passwords in plain text, built SQL by string
interpolation, and the front end saved your password into `localStorage`. None
of that survives: passwords are hashed with bcrypt, sessions are httpOnly JWT
cookies, and all queries go through Mongoose.

Prices and stock are always read from the database when an order is placed, so
editing them in the browser does nothing.

## Ideas for later

- Real transactional email for reset codes and order confirmations
- Online card payments
- Customer reviews — the star ratings on cards are currently decorative
- Promo codes (the bag page has the input, nothing behind it yet)

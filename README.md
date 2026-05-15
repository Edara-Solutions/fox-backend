# Supplements Store API

Production-oriented Node.js Express backend for a gym supplements e-commerce store using MongoDB, Mongoose, JWT auth, Zod validation, Multer uploads, and a modular monolith structure.

## Install

```bash
npm install
cp .env.example .env
npm run dev
```

Use `npm.cmd run dev` on Windows PowerShell if script execution policy blocks `npm`.

## Scripts

- `npm run dev` - start with nodemon
- `npm start` - start with Node
- `npm run seed:super-admin` - create the first internal `super_admin`

## Environment

Copy `.env.example` to `.env` and set MongoDB, JWT secrets, Vodafone Cash, InstaPay, CORS, and optional Cloudinary credentials.

## Customers And Users Are Separate

Customers are public store buyers stored in the `Customer` collection. They register publicly, manage carts, addresses, orders, payments, and reviews.

Users are internal dashboard/system accounts stored in the `User` collection. Valid roles are `super_admin`, `admin`, `inventory_manager`, `order_manager`, and `customer_support`.

There is intentionally no `customer` role in users. Customers and users have independent models, auth routes, JWT secrets, and auth middleware.

## API Modules

- `/api/customers` - customer auth, profile, addresses, admin customer management
- `/api/users` - internal user login and admin user management
- `/api/categories` - product categories
- `/api/brands` - brands
- `/api/products` - catalog, search, filters, stock updates
- `/api/cart` - customer cart
- `/api/orders` - customer orders and internal order management
- `/api/payments` - payment instructions, proof upload, admin review
- `/api/inventory` - low stock, out of stock, near expiry, stock adjustment
- `/api/coupons` - coupon management and validation
- `/api/reviews` - product reviews

## Manual Payment Flow

1. Customer creates an order from cart and chooses `vodafone_cash` or `instapay`.
2. Order starts as `pending_payment`; payment starts as `pending`.
3. Backend returns exact payment instructions from env values.
4. Customer uploads payment proof with screenshot, reference, sender info, and paid amount.
5. Internal `order_manager`, `admin`, or `super_admin` reviews proof.
6. Approval sets payment to `paid` or `partially_paid`, order to `confirmed`, stores `paid` / `reminder` amounts, timestamps confirmation, and decreases product stock.
7. Rejection sets payment to `rejected`, order to `payment_rejected`, and stores the rejection reason.

Stock is never decreased when an order is created. Stock is decreased only after payment proof approval.
Staff can later mark an order as `completed`; this sets `paid` to the order `subtotal`, clears `reminder` to `0`, marks payment as `paid`, and records `completedAt`.

## Create First Super Admin

Set these values in `.env` or your shell:

```bash
SEED_SUPER_ADMIN_NAME="Super Admin"
SEED_SUPER_ADMIN_EMAIL="admin@example.com"
SEED_SUPER_ADMIN_PASSWORD="change_this_password"
```

Then run:

```bash
npm run seed:super-admin
```

After that, use `POST /api/users/auth/login` to get an internal user JWT.

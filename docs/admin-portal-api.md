# Admin Portal API Documentation

Base URL: `http://localhost:5000`

Internal dashboard users are stored separately from customers. Valid roles:

- `super_admin`
- `admin`
- `inventory_manager`
- `order_manager`
- `customer_support`

Internal protected endpoints require:

```http
Authorization: Bearer <user_token>
```

All responses use:

```json
{
  "success": true,
  "message": "Human readable message",
  "data": {}
}
```

Errors use:

```json
{
  "success": false,
  "message": "Error message",
  "errors": []
}
```

## Pagination

Endpoints that return lists support these query parameters:

| Name | Required | Description |
| --- | --- | --- |
| `page` | No | Page number, defaults to `1` |
| `limit` | No | Items per page, defaults to `12`, max `100` |

Paginated responses include:

```json
{
  "items": [],
  "pagination": { "page": 1, "limit": 12, "total": 0, "pages": 0 }
}
```

## Dashboard

### Overview

`GET /api/dashboard/overview`

Authorization: `admin`, `super_admin`.

Returns admin dashboard summary metrics.

Notes:

- `totalRevenue` and `monthlyRevenue` sum `order.paid` when present, otherwise `order.total - order.shippingFee`, excluding orders with `cancelled`, `refunded`, `payment_rejected`, `pending_payment`, or `payment_submitted` status.
- `monthlyRevenue` is for the current calendar month.
- `productsInStock` counts active product records with stock above `0`.
- `lowStockAlerts` counts active product records with stock from `1` to `5`.
- `activeCoupons` counts enabled coupons within their date window and under usage limit.

Response:

```json
{
  "success": true,
  "message": "Dashboard overview fetched",
  "data": {
    "overview": {
      "totalRevenue": 50000,
      "todaysOrders": 12,
      "pendingOrders": 4,
      "totalCustomers": 300,
      "productsInStock": 80,
      "lowStockAlerts": 6,
      "activeCoupons": 3,
      "monthlyRevenue": 12000
    }
  }
}
```

### Revenue

`GET /api/dashboard/revenue?period=year`

Authorization: `admin`, `super_admin`.

Query parameters:

| Name | Required | Description |
| --- | --- | --- |
| `period` | No | One of `year`, `month`, `week`. Defaults to `year`. |

Returns revenue chart data for the selected period.

Notes:

- Revenue is calculated as `order.total - order.shippingFee`.
- `year` returns the current calendar year grouped by month.
- `month` returns the current calendar month grouped by day number.
- `week` returns the last 7 days including today grouped by weekday name.

Response:

```json
{
  "success": true,
  "message": "Dashboard revenue fetched",
  "data": {
    "revenue": [
      { "name": "Jan", "revenue": 420000 },
      { "name": "Feb", "revenue": 510000 },
      { "name": "Mar", "revenue": 488000 },
      { "name": "Apr", "revenue": 620000 },
      { "name": "May", "revenue": 845600 },
      { "name": "Jun", "revenue": 920000 },
      { "name": "Jul", "revenue": 980000 },
      { "name": "Aug", "revenue": 1050000 },
      { "name": "Sep", "revenue": 1120000 },
      { "name": "Oct", "revenue": 1180000 },
      { "name": "Nov", "revenue": 1240000 },
      { "name": "Dec", "revenue": 1300000 }
    ]
  }
}
```

### Best Selling Products

`GET /api/dashboard/best-selling-products?limit=3`

Authorization: `admin`, `super_admin`.

Query parameters:

| Name | Required | Description |
| --- | --- | --- |
| `limit` | No | Number of products to return. Defaults to `5`, max `100`. |

Returns top selling products by total sold quantity.

Notes:

- `sold` is the total ordered quantity for the product.
- `revenue` is calculated per item as `item.price * item.quantity`.
- Cancelled, refunded, pending payment, payment submitted, and payment rejected orders are excluded.

Response:

```json
{
  "success": true,
  "message": "Best selling products fetched",
  "data": {
    "products": [
      { "name": "BE-FOX Whey Isolate 2kg", "sold": 420, "revenue": 1213800 },
      { "name": "Creatine Monohydrate 300g", "sold": 318, "revenue": 311640 },
      { "name": "C4 Pre Workout Blast", "sold": 206, "revenue": 327540 }
    ]
  }
}
```

## Internal Auth And Users

### Login

`POST /api/users/auth/login`

Authorization: None.

Body:

```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

Response:

```json
{
  "success": true,
  "message": "User logged in",
  "data": {
    "user": {},
    "token": "jwt_token"
  }
}
```

### Get My User Profile

`GET /api/users/me`

Authorization: Any internal user.

Response:

```json
{
  "success": true,
  "message": "User profile",
  "data": { "user": {} }
}
```

### Change My Password

`PATCH /api/users/me/password`

Authorization: Any internal user.

Body:

```json
{
  "currentPassword": "password123",
  "newPassword": "newPassword123"
}
```

Response:

```json
{
  "success": true,
  "message": "Password changed",
  "data": null
}
```

### Create User

`POST /api/users`

Authorization: `super_admin`, `admin`.

Minimum body:

```json
{
  "name": "Order Manager",
  "email": "orders@example.com",
  "password": "password123",
  "role": "order_manager"
}
```

Role rules:

- `super_admin` can create any role.
- `admin` can create `inventory_manager`, `order_manager`, and `customer_support`.

Response:

```json
{
  "success": true,
  "message": "User created",
  "data": { "user": {} }
}
```

### List Users

`GET /api/users`

Authorization: `super_admin`, `admin`.

Response:

```json
{
  "success": true,
  "message": "Users fetched",
  "data": {
    "users": [],
    "pagination": { "page": 1, "limit": 12, "total": 0, "pages": 0 }
  }
}
```

### Get User

`GET /api/users/:id`

Authorization: `super_admin`, `admin`.

Response:

```json
{
  "success": true,
  "message": "User fetched",
  "data": { "user": {} }
}
```

### Update User

`PATCH /api/users/:id`

Authorization: `super_admin`, `admin`.

Body, all optional:

```json
{
  "name": "Updated Name",
  "email": "updated@example.com",
  "role": "inventory_manager",
  "password": "newPassword123"
}
```

Response:

```json
{
  "success": true,
  "message": "User updated",
  "data": { "user": {} }
}
```

### Activate Or Deactivate User

`PATCH /api/users/:id/activate`

`PATCH /api/users/:id/deactivate`

Authorization: `super_admin`, `admin`.

Response:

```json
{
  "success": true,
  "message": "User activated",
  "data": { "user": {} }
}
```

### Delete User

`DELETE /api/users/:id`

Authorization: `super_admin`.

Response:

```json
{
  "success": true,
  "message": "User deleted",
  "data": null
}
```

## Catalog Management

## Shipping Cities

### Create Shipping City

`POST /api/shipping-cities`

Authorization: `admin`, `super_admin`.

Body:

```json
{
  "name": "Cairo",
  "shippingFee": 50,
  "isActive": true
}
```

Response:

```json
{
  "success": true,
  "message": "Shipping city created",
  "data": { "city": {} }
}
```

### List Shipping Cities

`GET /api/shipping-cities/admin`

Authorization: `admin`, `super_admin`.

Response:

```json
{
  "success": true,
  "message": "Shipping cities fetched",
  "data": {
    "cities": [],
    "pagination": { "page": 1, "limit": 12, "total": 0, "pages": 0 }
  }
}
```

### Update Shipping City

`PATCH /api/shipping-cities/:id`

Authorization: `admin`, `super_admin`.

Body, all optional:

```json
{
  "name": "Giza",
  "shippingFee": 60,
  "isActive": true
}
```

Response:

```json
{
  "success": true,
  "message": "Shipping city updated",
  "data": { "city": {} }
}
```

### Delete Shipping City

`DELETE /api/shipping-cities/:id`

Authorization: `admin`, `super_admin`.

Response:

```json
{
  "success": true,
  "message": "Shipping city deleted",
  "data": null
}
```

### List Categories

`GET /api/categories/admin`

Authorization: `admin`, `super_admin`.

Description: Returns categories for CRM management, including inactive categories by default.

Query parameters:

| Name | Required | Description |
| --- | --- | --- |
| `isActive` | No | `true` or `false`. When omitted, active and inactive categories are returned. |
| `page` | No | Defaults to `1` |
| `limit` | No | Defaults to `12`, max `100` |

Response:

```json
{
  "success": true,
  "message": "Categories fetched",
  "data": {
    "categories": [],
    "pagination": { "page": 1, "limit": 12, "total": 0, "pages": 0 }
  }
}
```

### Create Category

`POST /api/categories`

Authorization: `admin`, `super_admin`.

Content type: `multipart/form-data`

Fields:

| Field | Required | Description |
| --- | --- | --- |
| `name` | Yes | Category name |
| `description` | No | Category description |
| `image` | No | Image file or image URL |
| `isActive` | No | Boolean |

Response:

```json
{
  "success": true,
  "message": "Category created",
  "data": { "category": {} }
}
```

### Update Category

`PATCH /api/categories/:id`

Authorization: `admin`, `super_admin`.

Content type: `multipart/form-data`

Body: Any create category fields.

Response:

```json
{
  "success": true,
  "message": "Category updated",
  "data": { "category": {} }
}
```

### Delete Category

`DELETE /api/categories/:id`

Authorization: `admin`, `super_admin`.

Response:

```json
{
  "success": true,
  "message": "Category deleted",
  "data": null
}
```

### List Brands

`GET /api/brands/admin`

Authorization: `admin`, `super_admin`.

Description: Returns brands for CRM management, including inactive brands by default.

Query parameters:

| Name | Required | Description |
| --- | --- | --- |
| `isActive` | No | `true` or `false`. When omitted, active and inactive brands are returned. |
| `page` | No | Defaults to `1` |
| `limit` | No | Defaults to `12`, max `100` |

Response:

```json
{
  "success": true,
  "message": "Brands fetched",
  "data": {
    "brands": [],
    "pagination": { "page": 1, "limit": 12, "total": 0, "pages": 0 }
  }
}
```

### Create Brand

`POST /api/brands`

Authorization: `admin`, `super_admin`.

Content type: `multipart/form-data`

Fields:

| Field | Required | Description |
| --- | --- | --- |
| `name` | Yes | Brand name |
| `description` | No | Brand description |
| `logo` | No | Image file or logo URL |
| `isActive` | No | Boolean |

Response:

```json
{
  "success": true,
  "message": "Brand created",
  "data": { "brand": {} }
}
```

### Update Brand

`PATCH /api/brands/:id`

Authorization: `admin`, `super_admin`.

Content type: `multipart/form-data`

Body: Any create brand fields.

Response:

```json
{
  "success": true,
  "message": "Brand updated",
  "data": { "brand": {} }
}
```

### Delete Brand

`DELETE /api/brands/:id`

Authorization: `admin`, `super_admin`.

Response:

```json
{
  "success": true,
  "message": "Brand deleted",
  "data": null
}
```

### List Products

`GET /api/products/admin`

Authorization: `admin`, `super_admin`, `inventory_manager`.

Description: Returns products for CRM management, including inactive products by default.

Query parameters:

| Name | Required | Description |
| --- | --- | --- |
| `category` | No | Category ObjectId |
| `brand` | No | Brand ObjectId |
| `flavor` | No | Matches product `flavors` |
| `isActive` | No | `true` or `false`. When omitted, active and inactive products are returned. |
| `isStack` | No | `true` or `false` |
| `isFeatured` | No | `true` or `false` |
| `minPrice` | No | Minimum price |
| `maxPrice` | No | Maximum price |
| `search` | No | Case-insensitive name search |
| `page` | No | Defaults to `1` |
| `limit` | No | Defaults to `12`, max `100` |
| `sort` | No | Mongoose sort string, defaults to `-createdAt` |

Response:

```json
{
  "success": true,
  "message": "Products fetched",
  "data": {
    "products": [],
    "pagination": { "page": 1, "limit": 12, "total": 0, "pages": 0 }
  }
}
```

### Get Product By Slug

`GET /api/products/admin/:slug`

Authorization: `admin`, `super_admin`, `inventory_manager`.

Description: Returns one product by slug for CRM management, including inactive products.

Response:

```json
{
  "success": true,
  "message": "Product fetched",
  "data": { "product": {} }
}
```

### Create Product

`POST /api/products`

Authorization: `admin`, `super_admin`, `inventory_manager`.

Content type: `multipart/form-data`

Minimum fields:

```json
{
  "name": "Whey Protein",
  "description": "Product description",
  "brand": "64f000000000000000000001",
  "category": "64f000000000000000000002",
  "price": 1500,
  "sku": "WHEY-001"
}
```

Optional fields:

```json
{
  "shortDescription": "Short text",
  "images": ["https://example.com/image.jpg"],
  "discountPrice": 1200,
  "stock": 20,
  "flavors": ["Chocolate", "Vanilla"],
  "size": "2kg",
  "weight": "2kg",
  "servings": 60,
  "ingredients": ["Whey"],
  "nutritionFacts": { "protein": "24g" },
  "warnings": ["Contains milk"],
  "usageInstructions": ["Mix one scoop with water", "Use once daily"],
  "expiryDate": "2026-12-31",
  "isActive": true,
  "isFeatured": false,
  "isStack": false
}
```

File field:

| Field | Required | Description |
| --- | --- | --- |
| `images` | No | Up to 8 image files |

Response:

```json
{
  "success": true,
  "message": "Product created",
  "data": { "product": {} }
}
```

### Update Product

`PATCH /api/products/:id`

Authorization: `admin`, `super_admin`, `inventory_manager`.

Content type: `multipart/form-data`

Body: Any create product fields.

Response:

```json
{
  "success": true,
  "message": "Product updated",
  "data": { "product": {} }
}
```

### Update Product Stock

`PATCH /api/products/:id/stock`

Authorization: `admin`, `super_admin`, `inventory_manager`.

Body:

```json
{
  "stock": 25
}
```

Response:

```json
{
  "success": true,
  "message": "Stock updated",
  "data": { "product": {} }
}
```

### Delete Product

`DELETE /api/products/:id`

Authorization: `admin`, `super_admin`.

Response:

```json
{
  "success": true,
  "message": "Product deleted",
  "data": null
}
```

## Customers

### List Customers

`GET /api/customers/admin`

Authorization: `admin`, `super_admin`, `customer_support`.

Query parameters:

| Name | Required | Description |
| --- | --- | --- |
| `search` | No | Case-insensitive match against customer `fullName`, `email`, or `phone` |
| `isBlocked` | No | `true` or `false` |
| `page` | No | Defaults to `1` |
| `limit` | No | Defaults to `12`, max `100` |

Response:

```json
{
  "success": true,
  "message": "Customers fetched",
  "data": {
    "customers": [],
    "pagination": { "page": 1, "limit": 12, "total": 0, "pages": 0 }
  }
}
```

### Get Customer

`GET /api/customers/admin/:id`

Authorization: `admin`, `super_admin`, `customer_support`.

Response:

```json
{
  "success": true,
  "message": "Customer fetched",
  "data": { "customer": {} }
}
```

### Block Or Unblock Customer

`PATCH /api/customers/admin/:id/block`

`PATCH /api/customers/admin/:id/unblock`

Authorization: `admin`, `super_admin`, `customer_support`.

Response:

```json
{
  "success": true,
  "message": "Customer blocked",
  "data": { "customer": {} }
}
```

## Orders

Order statuses:

- `pending_payment`
- `payment_submitted`
- `confirmed`
- `processing`
- `shipped`
- `delivered`
- `completed`
- `cancelled`
- `refunded`
- `payment_rejected`

### List Orders

`GET /api/orders`

Authorization: `order_manager`, `admin`, `super_admin`.

Description: Returns all orders with customer, vendor, assigned user, and payment populated.

Query parameters:

| Name | Required | Description |
| --- | --- | --- |
| `search` | No | Case-insensitive search by `orderNumber`, customer `fullName`, or customer `phone` |
| `orderStatus` | No | Filters by one order status value |
| `paymentStatus` | No | Filters by one payment status value |
| `paymentMethod` | No | Filters by one payment method: `vodafone_cash` or `instapay` |
| `dateFrom` | No | Filters orders created on or after this date, format `YYYY-MM-DD` |
| `dateTo` | No | Filters orders created on or before this date, format `YYYY-MM-DD` |
| `page` | No | Defaults to `1` |
| `limit` | No | Defaults to `12`, max `100` |

Response:

```json
{
  "success": true,
  "message": "Orders fetched",
  "data": {
    "orders": [],
    "pagination": { "page": 1, "limit": 12, "total": 0, "pages": 0 }
  }
}
```

### Get Order

`GET /api/orders/:id`

Authorization: `order_manager`, `admin`, `super_admin`.

Response:

```json
{
  "success": true,
  "message": "Order fetched",
  "data": { "order": {} }
}
```

### Assign Order

`PATCH /api/orders/:id/assign`

Authorization: `order_manager`, `admin`, `super_admin`.

Description: Assigns an active order staff user to manage the order.

Body:

```json
{
  "assignedTo": "64f000000000000000000001"
}
```

Assignee must be active and have one of these roles: `order_manager`, `admin`, `super_admin`.

Response:

```json
{
  "success": true,
  "message": "Order assigned",
  "data": { "order": {} }
}
```

### My Assigned Orders

`GET /api/orders/assigned/me`

Authorization: `order_manager`, `admin`, `super_admin`.

Description: Returns orders where `assignedTo` is the logged-in internal user.

Response:

```json
{
  "success": true,
  "message": "Assigned orders fetched",
  "data": {
    "orders": [],
    "pagination": { "page": 1, "limit": 12, "total": 0, "pages": 0 }
  }
}
```

### Update Order Status

`PATCH /api/orders/:id/status`

Authorization: `order_manager`, `admin`, `super_admin`.

Body:

```json
{
  "orderStatus": "confirmed"
}
```

Side effects:

- `confirmed`: deducts product stock once, marks payment as `paid`, sets `paid` to `total`, clears `reminder`, and sets `paidAt` / `confirmedAt`.
- `completed`: deducts product stock if needed, marks payment as `paid`, sets `paid` to `subtotal`, clears `reminder`, and sets `paidAt` / `confirmedAt` / `completedAt`.
- `cancelled`: restores product stock if it had been deducted, and sets `cancelledAt`.
- `refunded`: restores product stock if it had been deducted, marks payment as `refunded`, and sets `refundedAt`.
- `shipped`: sets `shippedAt`.
- `delivered`: sets `deliveredAt`.

Response:

```json
{
  "success": true,
  "message": "Order status updated",
  "data": { "order": {} }
}
```

## Payments

Payment statuses:

- `pending`
- `awaiting_review`
- `paid`
- `partially_paid`
- `rejected`
- `failed`
- `refunded`

### List Payments

`GET /api/payments`

Authorization: `order_manager`, `admin`, `super_admin`.

Response:

```json
{
  "success": true,
  "message": "Payments fetched",
  "data": {
    "payments": [],
    "pagination": { "page": 1, "limit": 12, "total": 0, "pages": 0 }
  }
}
```

### Get Payment

`GET /api/payments/:id`

Authorization: `order_manager`, `admin`, `super_admin`.

Response:

```json
{
  "success": true,
  "message": "Payment fetched",
  "data": { "payment": {} }
}
```

### Approve Payment

`PATCH /api/payments/:id/approve`

Authorization: `order_manager`, `admin`, `super_admin`.

Description: Approves payment proof, deducts product stock once, sets order to `confirmed`, and stores the approved payment state on both payment and order.

Body:

```json
{
  "paymentStatus": "paid",
  "paidAmount": 1000
}
```

Use `paymentStatus: "paid"` for full approval. The backend sets `paid` to the order `total` and `reminder` to `0`; `paidAmount` is optional and ignored for full approval.

Use `paymentStatus: "partially_paid"` for partial approval. `paidAmount` is required, must be greater than `0`, and must be less than the order `total`; the backend sets `paid` to that amount and calculates `reminder`.

Response:

```json
{
  "success": true,
  "message": "Payment approved",
  "data": { "payment": {} }
}
```

### Reject Payment

`PATCH /api/payments/:id/reject`

Authorization: `order_manager`, `admin`, `super_admin`.

Body:

```json
{
  "rejectionReason": "Amount does not match"
}
```

Response:

```json
{
  "success": true,
  "message": "Payment rejected",
  "data": { "payment": {} }
}
```

## Coupons

Coupon types:

- `percentage`
- `fixed`
- `free_shipping`

### Create Coupon

`POST /api/coupons`

Authorization: `admin`, `super_admin`.

Minimum body:

```json
{
  "code": "SAVE10",
  "type": "percentage"
}
```

Optional body:

```json
{
  "value": 10,
  "minOrderAmount": 500,
  "maxDiscount": 100,
  "startsAt": "2026-05-01",
  "expiresAt": "2026-06-01",
  "usageLimit": 100,
  "isActive": true,
  "vendor": "64f000000000000000000001",
  "applicableCategories": ["64f000000000000000000001"],
  "applicableProducts": ["64f000000000000000000002"]
}
```

Notes:

- `vendor` is optional and can be omitted or set to `null`.
- If `vendor` is provided, it must be an active internal user.
- Coupon codes are stored uppercase.
- `usedCount` increments only when an order is created with the coupon.

Response:

```json
{
  "success": true,
  "message": "Coupon created",
  "data": { "coupon": {} }
}
```

### List Coupons

`GET /api/coupons`

Authorization: `admin`, `super_admin`.

Response:

```json
{
  "success": true,
  "message": "Coupons fetched",
  "data": {
    "coupons": [],
    "pagination": { "page": 1, "limit": 12, "total": 0, "pages": 0 }
  }
}
```

### My Vendor Coupons

`GET /api/coupons/mine`

Authorization: Any internal user.

Description: Returns coupons whose `vendor` is the logged-in user.

Response:

```json
{
  "success": true,
  "message": "Coupons fetched",
  "data": {
    "coupons": [],
    "pagination": { "page": 1, "limit": 12, "total": 0, "pages": 0 }
  }
}
```

### Get Coupon

`GET /api/coupons/:id`

Authorization: `admin`, `super_admin`.

Response:

```json
{
  "success": true,
  "message": "Coupon fetched",
  "data": { "coupon": {} }
}
```

### Update Coupon

`PATCH /api/coupons/:id`

Authorization: `admin`, `super_admin`.

Body: Any create coupon fields.

Response:

```json
{
  "success": true,
  "message": "Coupon updated",
  "data": { "coupon": {} }
}
```

### Delete Coupon

`DELETE /api/coupons/:id`

Authorization: `admin`, `super_admin`.

Response:

```json
{
  "success": true,
  "message": "Coupon deleted",
  "data": null
}
```

## Inventory

### Low Stock

`GET /api/inventory/low-stock`

Authorization: `super_admin`, `admin`, `inventory_manager`.

Query parameters:

| Name | Required | Description |
| --- | --- | --- |
| `threshold` | No | Defaults to service value |

Response:

```json
{
  "success": true,
  "message": "Low stock products fetched",
  "data": {
    "products": [],
    "pagination": { "page": 1, "limit": 12, "total": 0, "pages": 0 }
  }
}
```

### Out Of Stock

`GET /api/inventory/out-of-stock`

Authorization: `super_admin`, `admin`, `inventory_manager`.

Response:

```json
{
  "success": true,
  "message": "Out of stock products fetched",
  "data": {
    "products": [],
    "pagination": { "page": 1, "limit": 12, "total": 0, "pages": 0 }
  }
}
```

### Near Expiry

`GET /api/inventory/near-expiry`

Authorization: `super_admin`, `admin`, `inventory_manager`.

Query parameters:

| Name | Required | Description |
| --- | --- | --- |
| `days` | No | Number of days ahead |

Response:

```json
{
  "success": true,
  "message": "Near expiry products fetched",
  "data": {
    "products": [],
    "pagination": { "page": 1, "limit": 12, "total": 0, "pages": 0 }
  }
}
```

### Adjust Stock

`PATCH /api/inventory/products/:productId/adjust`

Authorization: `super_admin`, `admin`, `inventory_manager`.

Body:

```json
{
  "quantity": 5,
  "reason": "Manual stock correction"
}
```

Use negative `quantity` to decrease stock. Stock cannot become negative.

Response:

```json
{
  "success": true,
  "message": "Stock adjusted",
  "data": {
    "product": {},
    "reason": "Manual stock correction"
  }
}
```

## Review Moderation

### Delete Review As Admin

`DELETE /api/reviews/:id/admin`

Authorization: `admin`, `super_admin`, `customer_support`.

Response:

```json
{
  "success": true,
  "message": "Review deleted",
  "data": null
}
```

## Admin Workflow Notes

- Use `/api/users/auth/login` to get an internal JWT.
- Use customer endpoints only with customer JWTs and admin endpoints only with internal user JWTs.
- Manual payment approval deducts stock once using `stockDeducted`.
- Cancelling or refunding a stock-deducted order restores product stock once.
- Order responses include `payment`, `vendor`, `assignedTo`, and `assignedBy` where available.
- Image uploads use `multipart/form-data`; image files must have an image MIME type and are limited to 5MB.

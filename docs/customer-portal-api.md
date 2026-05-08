# Customer Portal API Documentation

Base URL: `http://localhost:5000`

All responses use this envelope:

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

Customer-protected endpoints require:

```http
Authorization: Bearer <customer_token>
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

## Public Catalog

### Health Check

`GET /`

Description: Confirms the API is running.

Authorization: None.

Response:

```json
{
  "success": true,
  "message": "Supplements Store API is healthy",
  "data": { "status": "ok" }
}
```

### List Categories

`GET /api/categories`

Description: Returns active categories sorted by name.

Authorization: None.

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

### Get Category By Slug

`GET /api/categories/:slug`

Description: Returns one active category by slug.

Authorization: None.

Response:

```json
{
  "success": true,
  "message": "Category fetched",
  "data": { "category": {} }
}
```

### List Brands

`GET /api/brands`

Description: Returns active brands sorted by name.

Authorization: None.

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

### Get Brand By Slug

`GET /api/brands/:slug`

Description: Returns one active brand by slug.

Authorization: None.

Response:

```json
{
  "success": true,
  "message": "Brand fetched",
  "data": { "brand": {} }
}
```

### List Products

`GET /api/products`

Description: Returns active products with pagination and optional filters.

Authorization: None.

Query parameters:

| Name | Required | Description |
| --- | --- | --- |
| `category` | No | Category ObjectId |
| `brand` | No | Brand ObjectId |
| `flavor` | No | Matches product `flavors` |
| `isStack` | No | `true` or `false` |
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

`GET /api/products/:slug`

Description: Returns one active product by slug with brand and category populated.

Authorization: None.

Response:

```json
{
  "success": true,
  "message": "Product fetched",
  "data": { "product": {} }
}
```

### List Product Reviews

`GET /api/reviews/products/:productId`

Description: Returns approved reviews for a product.

Authorization: None.

Response:

```json
{
  "success": true,
  "message": "Reviews fetched",
  "data": {
    "reviews": [],
    "pagination": { "page": 1, "limit": 12, "total": 0, "pages": 0 }
  }
}
```

## Customer Auth

### Register

`POST /api/customers/auth/register`

Description: Creates a customer account and returns a customer JWT.

Authorization: None.

Minimum body:

```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "01000000000",
  "password": "password123"
}
```

Response:

```json
{
  "success": true,
  "message": "Customer registered",
  "data": {
    "customer": {},
    "token": "jwt_token"
  }
}
```

### Login

`POST /api/customers/auth/login`

Description: Logs in a customer and returns a customer JWT.

Authorization: None.

Body:

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

Response:

```json
{
  "success": true,
  "message": "Customer logged in",
  "data": {
    "customer": {},
    "token": "jwt_token"
  }
}
```

## Customer Profile

### Get My Profile

`GET /api/customers/me`

Authorization: Customer token.

Response:

```json
{
  "success": true,
  "message": "Customer profile",
  "data": { "customer": {} }
}
```

### Update My Profile

`PATCH /api/customers/me`

Authorization: Customer token.

Body, all fields optional:

```json
{
  "fullName": "John Updated",
  "phone": "01111111111"
}
```

Response:

```json
{
  "success": true,
  "message": "Customer updated",
  "data": { "customer": {} }
}
```

### Change Password

`PATCH /api/customers/me/password`

Authorization: Customer token.

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

## Addresses

Address object:

```json
{
  "fullName": "John Doe",
  "phone": "01000000000",
  "city": "Cairo",
  "area": "Nasr City",
  "street": "Main Street",
  "buildingNumber": "12",
  "apartmentNumber": "5",
  "notes": "Call on arrival",
  "isDefault": true
}
```

### Add Address

`POST /api/customers/me/addresses`

Authorization: Customer token.

Minimum body:

```json
{
  "fullName": "John Doe",
  "phone": "01000000000",
  "city": "Cairo",
  "area": "Nasr City",
  "street": "Main Street"
}
```

Response:

```json
{
  "success": true,
  "message": "Address added",
  "data": { "customer": {} }
}
```

### Update Address

`PATCH /api/customers/me/addresses/:addressId`

Authorization: Customer token.

Body: Any address fields.

Response:

```json
{
  "success": true,
  "message": "Address updated",
  "data": { "customer": {} }
}
```

### Delete Address

`DELETE /api/customers/me/addresses/:addressId`

Authorization: Customer token.

Response:

```json
{
  "success": true,
  "message": "Address deleted",
  "data": { "customer": {} }
}
```

### Set Default Address

`PATCH /api/customers/me/addresses/:addressId/default`

Authorization: Customer token.

Response:

```json
{
  "success": true,
  "message": "Default address updated",
  "data": { "customer": {} }
}
```

## Cart

All cart endpoints require a customer token.

### Get Cart

`GET /api/cart`

Response:

```json
{
  "success": true,
  "message": "Cart fetched",
  "data": { "cart": {} }
}
```

### Add Item

`POST /api/cart/items`

Body:

```json
{
  "productId": "64f000000000000000000001",
  "quantity": 2,
  "selectedFlavor": "Chocolate"
}
```

Response:

```json
{
  "success": true,
  "message": "Cart item added",
  "data": { "cart": {} }
}
```

### Update Item Quantity

`PATCH /api/cart/items/:itemId`

Body:

```json
{
  "quantity": 3
}
```

Response:

```json
{
  "success": true,
  "message": "Cart item updated",
  "data": { "cart": {} }
}
```

### Remove Item

`DELETE /api/cart/items/:itemId`

Response:

```json
{
  "success": true,
  "message": "Cart item removed",
  "data": { "cart": {} }
}
```

### Clear Cart

`DELETE /api/cart`

Response:

```json
{
  "success": true,
  "message": "Cart cleared",
  "data": null
}
```

## Coupons

### Validate Coupon

`POST /api/coupons/validate`

Description: Checks a coupon without incrementing its `usedCount`.

Authorization: Customer token.

Body:

```json
{
  "code": "SAVE10",
  "orderTotal": 1000
}
```

Response:

```json
{
  "success": true,
  "message": "Coupon validated",
  "data": {
    "coupon": {},
    "discount": 100,
    "freeShipping": false
  }
}
```

## Orders

### Create Order

`POST /api/orders`

Description: Creates an order from the current cart and creates a related payment record. Product stock is not deducted until payment approval. Coupon `usedCount` increments only after the order is successfully created.

Authorization: Customer token.

Minimum body:

```json
{
  "shippingDetails": {
    "fullName": "John Doe",
    "phone": "01000000000",
    "city": "Cairo",
    "area": "Nasr City",
    "street": "Main Street"
  },
  "paymentMethod": "vodafone_cash"
}
```

Optional body:

```json
{
  "couponCode": "SAVE10",
  "notes": "Please call before delivery",
  "shippingFee": 50
}
```

Valid payment methods: `vodafone_cash`, `instapay`.

Response:

```json
{
  "success": true,
  "message": "Order created",
  "data": {
    "order": {
      "paymentStatus": "pending",
      "orderStatus": "pending_payment",
      "payment": {}
    }
  }
}
```

### My Orders

`GET /api/orders/my-orders`

Authorization: Customer token.

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

### My Order Details

`GET /api/orders/my-orders/:id`

Authorization: Customer token.

Response:

```json
{
  "success": true,
  "message": "Order fetched",
  "data": { "order": {} }
}
```

### Cancel My Order

`PATCH /api/orders/my-orders/:id/cancel`

Description: Customer can cancel only while order status is `pending_payment`.

Authorization: Customer token.

Response:

```json
{
  "success": true,
  "message": "Order cancelled",
  "data": { "order": {} }
}
```

## Payments

### Get Payment Instructions

`GET /api/payments/instructions/:orderId`

Description: Returns payment instructions for the order payment method and amount.

Authorization: Customer token.

Response:

```json
{
  "success": true,
  "message": "Payment instructions",
  "data": { "instructions": {} }
}
```

### Submit Payment Proof

`POST /api/payments/:orderId/proof`

Description: Uploads payment proof for review. Sets payment status to `awaiting_review` and order status to `payment_submitted`.

Authorization: Customer token.

Content type: `multipart/form-data`

File field:

| Field | Required | Description |
| --- | --- | --- |
| `proofImage` | Yes, unless `proofImage` URL is sent in body | Image file, max 5MB |

Body fields:

```json
{
  "transactionReference": "TX-12345",
  "senderPhone": "01000000000",
  "senderName": "John Doe",
  "paidAmount": 1050
}
```

All body fields are currently optional, but `proofImage` is required either as an uploaded file or URL.

Response:

```json
{
  "success": true,
  "message": "Payment proof submitted",
  "data": { "payment": {} }
}
```

## Reviews

### Create Product Review

`POST /api/reviews/products/:productId`

Authorization: Customer token.

Minimum body:

```json
{
  "rating": 5
}
```

Optional body:

```json
{
  "comment": "Great product",
  "order": "64f000000000000000000001"
}
```

Response:

```json
{
  "success": true,
  "message": "Review created",
  "data": { "review": {} }
}
```

### Update My Review

`PATCH /api/reviews/:id`

Authorization: Customer token.

Body:

```json
{
  "rating": 4,
  "comment": "Updated comment"
}
```

Response:

```json
{
  "success": true,
  "message": "Review updated",
  "data": { "review": {} }
}
```

### Delete My Review

`DELETE /api/reviews/:id`

Authorization: Customer token.

Response:

```json
{
  "success": true,
  "message": "Review deleted",
  "data": null
}
```

## Customer Workflow Notes

- Customer tokens and internal user tokens are different and cannot be used interchangeably.
- Cart stock checks happen when adding/updating cart items and again when creating an order.
- Product stock is deducted only after payment approval by internal staff.
- If a paid/confirmed order is later cancelled or refunded by staff, stock is restored once.
- Orders include related `payment` data when available.
- Orders with coupons include `vendor` metadata from the coupon when the coupon has a vendor; otherwise order `vendor` is `null`.

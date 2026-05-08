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
  "data": { "users": [] }
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
  "warnings": "Contains milk",
  "usageInstructions": "Mix with water",
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

Response:

```json
{
  "success": true,
  "message": "Customers fetched",
  "data": { "customers": [] }
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
- `cancelled`
- `refunded`
- `payment_rejected`

### List Orders

`GET /api/orders`

Authorization: `order_manager`, `admin`, `super_admin`.

Description: Returns all orders with customer, vendor, assigned user, and payment populated.

Response:

```json
{
  "success": true,
  "message": "Orders fetched",
  "data": { "orders": [] }
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
  "data": { "orders": [] }
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

- `confirmed`: deducts product stock once, marks payment as `paid`, and sets `paidAt` / `confirmedAt`.
- `cancelled`: restores product stock if it had been deducted, and sets `cancelledAt`.
- `refunded`: restores product stock if it had been deducted, marks payment as `refunded`, and sets `refundedAt`.
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
  "data": { "payments": [] }
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

Description: Approves payment proof, deducts product stock once, sets payment to `paid`, and order to `confirmed`.

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
  "data": { "coupons": [] }
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
  "data": { "coupons": [] }
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
  "data": { "products": [] }
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
  "data": { "products": [] }
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
  "data": { "products": [] }
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

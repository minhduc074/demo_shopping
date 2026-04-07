# API Specification

## Conventions
- Base path: `/api`
- Content type: `application/json`
- Authentication:
  - cookie-based session for web clients
  - admin routes require role checks
- Error envelope:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Readable explanation",
    "details": {},
    "requestId": "req_123"
  }
}
```

## Auth

### POST `/api/auth/register`
Purpose:
- Register a customer account

Request:
```json
{
  "email": "user@example.com",
  "password": "StrongPass123!",
  "fullName": "Nguyen Van A"
}
```

Response:
```json
{
  "user": {
    "id": "usr_123",
    "email": "user@example.com",
    "fullName": "Nguyen Van A",
    "role": "customer"
  }
}
```

### POST `/api/auth/login`
Purpose:
- Create authenticated session

### POST `/api/auth/logout`
Purpose:
- Destroy current session

### GET `/api/auth/me`
Purpose:
- Return current authenticated user

## Catalog

### GET `/api/products`
Purpose:
- List products

Query params:
- `category`
- `page`
- `pageSize`
- `sort`

Response:
```json
{
  "items": [
    {
      "id": "prd_1",
      "slug": "ao-linen-voan-core",
      "name": "Áo Linen Voan Core",
      "category": "Thời trang nữ",
      "price": 890000,
      "compareAtPrice": 1120000,
      "imageUrl": "https://cdn.example.com/products/p1.jpg",
      "inStock": true
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 24,
    "total": 120
  }
}
```

### GET `/api/products/:slug`
Purpose:
- Fetch product detail

Response:
```json
{
  "id": "prd_1",
  "slug": "ao-linen-voan-core",
  "name": "Áo Linen Voan Core",
  "description": "Phom áo nhẹ...",
  "longDescription": "Thiết kế được định hướng...",
  "price": 890000,
  "compareAtPrice": 1120000,
  "inventory": 24,
  "rating": 4.9,
  "sold": 128,
  "images": [
    "https://cdn.example.com/products/p1-1.jpg"
  ],
  "tags": ["Bestseller", "Linen"]
}
```

### GET `/api/categories`
Purpose:
- List storefront categories

## Cart

### GET `/api/cart`
Purpose:
- Return current cart by session/cart token

Response:
```json
{
  "id": "cart_123",
  "itemCount": 2,
  "subtotal": 2180000,
  "shipping": 30000,
  "discount": 50000,
  "total": 2160000,
  "items": [
    {
      "id": "ci_1",
      "productId": "prd_1",
      "productName": "Áo Linen Voan Core",
      "quantity": 1,
      "size": "M",
      "color": "Mặc định",
      "unitPrice": 890000
    }
  ]
}
```

### POST `/api/cart/items`
Purpose:
- Add item to cart

Request:
```json
{
  "productId": "prd_1",
  "quantity": 1,
  "size": "M",
  "color": "Mặc định"
}
```

### PATCH `/api/cart/items/:itemId`
Purpose:
- Update cart item quantity

Request:
```json
{
  "quantity": 2
}
```

### DELETE `/api/cart/items/:itemId`
Purpose:
- Remove item from cart

## Checkout

### POST `/api/checkout/session`
Purpose:
- Create Stripe Checkout session

Response:
```json
{
  "sessionId": "cs_test_xxx",
  "url": "https://checkout.stripe.com/c/pay/cs_test_xxx"
}
```

Errors:
- `400 CART_EMPTY`
- `422 INVENTORY_UNAVAILABLE`
- `502 STRIPE_UPSTREAM_ERROR`

### GET `/api/checkout/session/:id`
Purpose:
- Inspect checkout session state

### POST `/api/webhooks/stripe`
Purpose:
- Receive Stripe webhook events

Expected events:
- `checkout.session.completed`
- `payment_intent.payment_failed`

## Orders

### GET `/api/orders`
Purpose:
- List current user orders

### GET `/api/orders/:id`
Purpose:
- Fetch order detail

Response:
```json
{
  "id": "ord_123",
  "orderNumber": "SH-20260406-0001",
  "status": "paid",
  "total": 2160000,
  "currency": "vnd",
  "items": [
    {
      "productName": "Áo Linen Voan Core",
      "quantity": 1,
      "unitPrice": 890000
    }
  ]
}
```

## Admin

### POST `/api/admin/products`
Purpose:
- Create draft product

### PATCH `/api/admin/products/:id`
Purpose:
- Update product

### POST `/api/admin/products/:id/publish`
Purpose:
- Publish product to storefront

### GET `/api/admin/orders`
Purpose:
- Search and list all orders

## Common Error Codes
| HTTP | Code | Meaning |
|---|---|---|
| 400 | VALIDATION_ERROR | Request shape invalid |
| 401 | UNAUTHENTICATED | Missing or expired login |
| 403 | FORBIDDEN | Role not allowed |
| 404 | NOT_FOUND | Resource missing |
| 409 | CONFLICT | Duplicate or version conflict |
| 422 | BUSINESS_RULE_VIOLATION | Domain rule failed |
| 429 | RATE_LIMITED | Too many requests |
| 500 | INTERNAL_ERROR | Unexpected server failure |
| 502 | UPSTREAM_FAILURE | Stripe or other dependency failed |

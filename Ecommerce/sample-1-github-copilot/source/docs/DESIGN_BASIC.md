# Demo Shopping — Basic Design

---

## What Is This App?

Demo Shopping is an e-commerce web app inspired by Shopee. Users can browse products, add items to a cart, log in with Google/email, and pay via Stripe.

---

## Who Uses It?

| User | What They Do |
|---|---|
| **Shopper** | Browse products, add to cart, checkout |
| **Admin** | Seeds the product database via a script |

---

## Main Pages

```
┌─────────────────────────────────────────────────────┐
│  /  (Homepage)                                       │
│  • Banner                                            │
│  • 8 category icons                                  │
│  • Flash Sale section (6 products)                   │
│  • Daily Discover grid (infinite scroll)             │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  /login                                              │
│  • Email / password sign-in & sign-up                │
│  • One-click login: Google, Facebook, Apple          │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  /checkout                                           │
│  • Review cart items                                 │
│  • Enter delivery address                            │
│  • Select payment method → pay with Stripe           │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  /checkout/success                                   │
│  • Order confirmed                                   │
│  • Cart is cleared automatically                     │
└─────────────────────────────────────────────────────┘
```

---

## How the System Is Built

```
                  ┌──────────────┐
                  │   Browser    │
                  │  (Next.js)   │
                  └──────┬───────┘
                         │
           ┌─────────────┼──────────────┐
           ▼             ▼              ▼
    ┌─────────────┐ ┌─────────┐ ┌────────────┐
    │  Supabase   │ │Postgres │ │   Stripe   │
    │    Auth     │ │Products │ │  Payments  │
    └─────────────┘ └─────────┘ └────────────┘
```

| Layer | Tool | Why |
|---|---|---|
| **Frontend** | Next.js 15 + React 19 | Fast pages, server + client rendering |
| **Styling** | Tailwind CSS | Utility-first, Shopee-inspired theme |
| **Auth** | Supabase Auth | Email + Google/Facebook/Apple sign-in |
| **Database** | Supabase PostgreSQL | Stores 10,000 products |
| **Payments** | Stripe Checkout | Secure hosted payment page |

---

## User Journeys

### 1. Browse & Add to Cart

```
Open site  →  See products  →  Hover product card  →  "Add to Cart"
                                                            │
                                              Cart icon badge updates
                                                            │
                                              Open Cart Drawer (slide-in)
```

### 2. Login

```
Click Login  →  /login page
                    │
          ┌─────────┴──────────┐
          │                    │
   Email + Password      Click "Google"
          │                    │
     Sign in / up       Google consent page
          │                    │
          └────────┬───────────┘
                   │
         Redirected back to site
         Header shows username + Logout
```

### 3. Checkout & Pay

```
Cart Drawer  →  "Checkout" link  →  /checkout page
                                          │
                                  Fill address form
                                          │
                                  Select payment method
                                          │
                                  "Place Order"
                                          │
                                  Stripe payment page
                                          │
                                  ┌───────┴───────┐
                                  │               │
                               Paid           Cancelled
                                  │               │
                         /checkout/success   /checkout
                         Cart cleared
```

---

## Data at a Glance

### What's in the Database

```
products table  (10,000 rows)
┌────────────┬───────────────────────────────────────┐
│ Field      │ Example                               │
├────────────┼───────────────────────────────────────┤
│ name       │ "Premium Wireless Headphones"         │
│ price      │ 150,000 VND                           │
│ discount   │ 25%                                   │
│ category   │ Electronics                           │
│ is_flash   │ false                                 │
│ sold_count │ 4,520                                 │
└────────────┴───────────────────────────────────────┘
```

### What's in the Cart (Browser Only)

Cart is **never saved to the database** — it lives in the browser's localStorage. It clears when the order is completed.

---

## Key Design Decisions

| Decision | Choice | Reason |
|---|---|---|
| Cart storage | Browser `localStorage` | No login required to shop |
| Product data | PostgreSQL via direct query | Fine-grained SQL control, 10k products with indexes |
| Auth | Supabase | Built-in OAuth, session cookies, no password hashing to manage |
| Payments | Stripe hosted page | PCI-compliant, no card data on our server |
| Homepage caching | Rebuilt every 60 seconds | Fast load + reasonably fresh product data |

---

## What's Not Yet Built

- Product detail page (`/product/[id]`)
- Search results page
- Category filter pages
- Order history
- Admin dashboard
- COD / ShopeePay / Banking payment (UI only, not functional)

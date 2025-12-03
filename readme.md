## Assignment Name: Coupon Management

### Project Overview

This project is a simple e-commerce **Coupon Management** service that exposes HTTP APIs to **create coupons** and **compute the best applicable coupon** for a given user + cart.  
Coupons and users are stored **in memory** and initialized from seed JSON files so the service is ready to demo immediately (including the required reviewer login).

### Tech Stack

- **Language**: Node.js (JavaScript)
- **Framework**: Express
- **Other libraries**: `cors`, `nodemon` (dev)

### Data Model Overview

- **Coupon**
  - **code**: string (unique, e.g. `"WELCOME100"`)
  - **description**: string
  - **discountType**: `"FLAT"` or `"PERCENT"`
  - **discountValue**: number
  - **maxDiscountAmount**: number (optional, cap for percent discounts)
  - **startDate** / **endDate**: ISO date strings, coupon valid in this window
  - **usageLimitPerUser**: number (optional; max uses per user)
  - **eligibility** (object, all fields optional)
    - **allowedUserTiers**: `["NEW", "REGULAR", "GOLD"]`
    - **minLifetimeSpend**: number
    - **minOrdersPlaced**: number
    - **firstOrderOnly**: boolean
    - **allowedCountries**: list of country codes, e.g. `["IN", "US"]`
    - **minCartValue**: number
    - **applicableCategories**: list of allowed categories
    - **excludedCategories**: list of forbidden categories
    - **minItemsCount**: minimum total quantity of items in cart

- **User Context** (request payload, simulated)
  - **userId**: string
  - **userTier**: `"NEW" | "REGULAR" | "GOLD"`
  - **country**: string (e.g. `"IN"`)
  - **lifetimeSpend**: number
  - **ordersPlaced**: number
  - **couponUsage**: object (optional) – simulated history per coupon
    - Example: `{ "WELCOME100": 1 }`

- **Cart**
  - **items**: array of:
    - **productId**: string
    - **category**: string
    - **unitPrice**: number
    - **quantity**: number

### Seed Data and Demo Login

- **Seed users**: `src/utils/seedUsers.json`
  - Contains the required reviewer account:
    - **Email**: `hire-me@anshumat.org`
    - **Password**: `HireMe@2025!`
    - Additional fields for coupon eligibility (tier, country, etc.).
- **Seed coupons**: `src/utils/seedCoupons.json`
  - Example coupons:
    - `WELCOME100` – flat ₹100 off, new users, first order only.
    - `FESTIVE10` – 10% off electronics/fashion with max discount cap.
    - `GOLD20` – 20% off for GOLD users with spend/order thresholds.

Seed data is loaded into memory by `src/models/memoryStore.js` when the server starts.

### API Overview

- **Base URL (local)**: `http://localhost:5000`

- **Health Check**
  - **GET** `/health`
  - **Response**: `{ "status": "OK", "service": "Coupon Management Service" }`

- **Authentication (Demo Only)**
  - **POST** `/api/auth/login`
  - **Body**:
    ```json
    {
      "email": "hire-me@anshumat.org",
      "password": "HireMe@2025!"
    }
    ```
  - **Response**:
    ```json
    {
      "user": {
        "email": "hire-me@anshumat.org",
        "userId": "demo-user-1",
        "userTier": "NEW",
        "country": "IN",
        "lifetimeSpend": 0,
        "ordersPlaced": 0
      },
      "token": "demo-token"
    }
    ```
  - Note: This is intentionally **not** production-grade auth; it simply validates credentials against hard-coded seed users.

- **Create Coupon**
  - **POST** `/api/coupons/create`
  - **Body** (example):
    ```json
    {
      "code": "WELCOME200",
      "description": "Flat 200 off for new users",
      "discountType": "FLAT",
      "discountValue": 200,
      "startDate": "2025-01-01T00:00:00.000Z",
      "endDate": "2025-12-31T23:59:59.000Z",
      "usageLimitPerUser": 1,
      "eligibility": {
        "allowedUserTiers": ["NEW"],
        "firstOrderOnly": true,
        "minCartValue": 1000
      }
    }
    ```
  - **Behavior**:
    - Stores the coupon in in-memory array.
    - **Rejects duplicate codes** with HTTP 400 and an error message.

- **List Coupons**
  - **GET** `/api/coupons`
  - **Response**:
    ```json
    {
      "coupons": [ /* all coupons in memory */ ]
    }
    ```

- **Best Coupon**
  - **POST** `/api/coupons/best`
  - **Body** (example):
    ```json
    {
      "user": {
        "userId": "u123",
        "userTier": "NEW",
        "country": "IN",
        "lifetimeSpend": 1200,
        "ordersPlaced": 2,
        "couponUsage": {
          "WELCOME100": 1
        }
      },
      "cart": {
        "items": [
          {
            "productId": "p1",
            "category": "electronics",
            "unitPrice": 1500,
            "quantity": 1
          },
          {
            "productId": "p2",
            "category": "fashion",
            "unitPrice": 500,
            "quantity": 2
          }
        ]
      }
    }
    ```
  - **Behavior**:
    - Filters coupons that:
      - Are within validity window (`startDate ≤ now ≤ endDate`).
      - Respect `usageLimitPerUser` for the user:
        - Uses `user.couponUsage[code]` if provided,
        - Otherwise falls back to in-memory tracker.
      - Satisfy all eligibility rules for user + cart.
    - Computes discount:
      - FLAT → `discountValue`.
      - PERCENT → `(discountValue% of cartValue)` capped by `maxDiscountAmount` when set.
    - Selects the **best coupon** using:
      - Highest discount amount
      - If tie, earliest `endDate`
      - If still tie, lexicographically smaller `code`
    - **Response**:
      ```json
      {
        "coupon": { /* best coupon object or null */ },
        "discount": 150
      }
      ```

### How to Run

- **Prerequisites**
  - Node.js **18+** (LTS recommended)
  - npm (comes with Node)

- **Setup**
  - In project root:
    ```bash
    npm install
    ```

- **Start the Service + Web UI**
  - Development (with auto-restart using nodemon):
    ```bash
    npm run dev
    ```
  - Production-style run:
    ```bash
    npm start
    ```
  - The server listens on **port 5000** by default (or `process.env.PORT` if set).
  - Open the **responsive demo UI** in your browser:
    - `http://localhost:5000/`
    - From there you can:
      - Log in using the demo credentials.
      - See all available coupons.
      - Simulate user + cart scenarios and preview the best coupon.

### How to Run Tests

- Minimal tests are included as a Node script:
  ```bash
  npm test
  ```
- This runs `tests/coupon.test.js`, which:
  - Verifies seed coupons are loaded.
  - Calls `findBestCoupon` with a sample user + cart and checks the shape of the result.

### AI Usage Note

- **How AI was used**
  - AI (ChatGPT / Cursor) was used to:
    - Help design the project structure and in-memory models.
    - Generate boilerplate Express routes, controllers, and services.
    - Draft the README content and basic test scaffolding.
- **Representative prompts**
  - "Build an Express-based coupon management API with create and best-coupon endpoints, in-memory storage, and eligibility rules for user and cart."
  - "Add a demo login endpoint with a hard-coded user (hire-me@anshumat.org / HireMe@2025!) loaded from seed data."
  - "Explain and document the data models and how to run the project for a recruiter reviewing this assignment."

### Assignment Requirement Mapping

- **Create Coupon API**
  - Requirement: Provide an API to create coupons with eligibility rules.
  - Implemented in:
    - `POST /api/coupons/create`
    - Code: `coupon.controller.js` → `createCoupon`, `coupon.service.js` → `addCoupon`.

- **Best Coupon API**
  - Requirement: Given user + cart, return best matching coupon.
  - Implemented in:
    - `POST /api/coupons/best`
    - Code: `coupon.controller.js` → `getBestCoupon`, `coupon.service.js` → `findBestCoupon`,
      `eligibility.service.js`, `discount.service.js`.

- **Eligibility Rules**
  - Requirement: User + cart conditions (tiers, lifetime spend, orders, firstOrderOnly, countries, cart value, categories, item count).
  - Implemented in:
    - `src/services/eligibility.service.js`
    - Used by `findBestCoupon` in `coupon.service.js`.

- **Discount Calculation**
  - Requirement: FLAT vs PERCENT, cap by `maxDiscountAmount`.
  - Implemented in:
    - `src/services/discount.service.js`
    - Used by `findBestCoupon` in `coupon.service.js`.

- **Validity Window + Usage Limit**
  - Requirement: `startDate` / `endDate` and `usageLimitPerUser`.
  - Implemented in:
    - Date checks in `findBestCoupon` (`coupon.service.js`).
    - Per-user limit logic with simulated history in `findBestCoupon` using `couponUsageByUser` and optional `user.couponUsage`.

- **In-Memory Storage / Seed Data**
  - Requirement: Simple storage; DB optional.
  - Implemented in:
    - `src/models/memoryStore.js` (arrays + usage map in memory).
    - Seed files: `src/utils/seedCoupons.json`, `src/utils/seedUsers.json`.

- **Hard-Coded Demo User**
  - Requirement: Demo login `hire-me@anshumat.org` / `HireMe@2025!`.
  - Implemented in:
    - Seed user in `src/utils/seedUsers.json`.
    - Loaded via `memoryStore.js` into `demoUsers`.
    - Login endpoint: `POST /api/auth/login` using `auth.controller.js` + `auth.service.js`.

- **README + Tests**
  - Requirement: Clear documentation; tests are a bonus.
  - Implemented in:
    - `readme.md` (this file).
    - Minimal test suite in `tests/coupon.test.js` wired via `npm test`.



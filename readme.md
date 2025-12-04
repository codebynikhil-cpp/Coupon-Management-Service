# 🎟️ Coupon Management Service

> **Assignment Name:** Coupon Management  
> **Role:** Software Developer  
> **A smart e-commerce coupon selection engine** that automatically finds the best applicable discount for any user and cart combination.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-blue.svg)](https://expressjs.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 📋 Project Overview

This is a simple e-commerce coupon management system that provides HTTP APIs to create coupons with sophisticated eligibility rules and compute the best applicable coupon for any given user and shopping cart. The service features intelligent discount calculation with support for user-tier restrictions, spending history, geographic limitations, and cart-based conditions. Built with Node.js and Express, it uses in-memory storage with JSON seed data for immediate demonstration.

## 🛠️ Tech Stack

- **Language:** JavaScript (Node.js 18+)
- **Framework:** Express.js 4.x
- **Libraries:**
  - `cors` - Cross-Origin Resource Sharing support
  - `nodemon` - Development auto-reload (dev dependency)
- **Storage:** In-memory arrays with JSON seed files
- **Testing:** Node.js native test runner

## 🚀 How to Run

### Prerequisites

- **Node.js** 18+ (LTS recommended) - [Download here](https://nodejs.org/)
- **npm** (comes bundled with Node.js)

### Setup Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/codebynikhil-cpp/Coupon-Management-Service.git
   cd Coupon-Management-Service
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the service:**
   
   **Development mode** (with auto-restart on file changes):
   ```bash
   npm run dev
   ```
   
   **Production mode:**
   ```bash
   npm start
   ```

4. **Access the application:**
   - The server will start on **port 5000** (or `process.env.PORT` if set)
   - Open your browser: `http://localhost:5000/`
   - API Base URL: `http://localhost:5000/api`

### Demo Credentials

The following credentials are hard-coded in seed data for reviewer access:

```
Email: hire-me@anshumat.org
Password: HireMe@2025!
```

**User Details:**
- User ID: `demo-user-1`
- Tier: `NEW`
- Country: `IN`
- Lifetime Spend: ₹0
- Orders Placed: 0

## 🧪 How to Run Tests

Run the test suite with:

```bash
npm test
```

**Test Coverage:**
- Seed data validation (coupons and users load correctly)
- Best coupon selection algorithm
- Eligibility rule evaluation
- Discount calculation (FLAT and PERCENT types)
- Response structure validation

## 📊 Data Models

### Coupon Schema

```javascript
{
  "code": "WELCOME100",              // Unique identifier (required)
  "description": "Flat 100 off for new users",
  "discountType": "FLAT",            // "FLAT" or "PERCENT" (required)
  "discountValue": 100,              // Amount or percentage (required)
  "maxDiscountAmount": 500,          // Optional: cap for percent discounts
  "startDate": "2025-01-01T00:00:00.000Z",  // Validity window start
  "endDate": "2025-12-31T23:59:59.000Z",    // Validity window end
  "usageLimitPerUser": 1,            // Optional: max uses per user
  "eligibility": {                   // All fields optional
    // User-based attributes
    "allowedUserTiers": ["NEW", "REGULAR", "GOLD"],
    "minLifetimeSpend": 1000,
    "minOrdersPlaced": 2,
    "firstOrderOnly": true,
    "allowedCountries": ["IN", "US"],
    
    // Cart-based attributes
    "minCartValue": 500,
    "applicableCategories": ["electronics", "fashion"],
    "excludedCategories": ["gift-cards"],
    "minItemsCount": 2
  }
}
```

### User Context (Input)

```javascript
{
  "userId": "u123",
  "userTier": "NEW",                 // NEW, REGULAR, or GOLD
  "country": "IN",
  "lifetimeSpend": 1200,             // Total historical spend
  "ordersPlaced": 2                  // Number of completed orders
}
```

### Cart (Input)

```javascript
{
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
```

## 🔌 API Endpoints

### Base URL
```
http://localhost:5000/api
```

### 1. Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "OK",
  "service": "Coupon Management Service"
}
```

---

### 2. Create Coupon API

```http
POST /api/coupons/create
```

**Request Body:**
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

**Success Response (201):**
```json
{
  "message": "Coupon created successfully",
  "coupon": { /* created coupon object */ }
}
```

**Error Response (400):**
```json
{
  "error": "Coupon with code WELCOME200 already exists"
}
```

**Behavior:**
- Stores coupon in in-memory array
- Validates that `code` is unique
- Rejects duplicate codes with HTTP 400 error

---

### 3. List All Coupons (Optional Debug Endpoint)

```http
GET /api/coupons
```

**Response:**
```json
{
  "coupons": [
    { /* coupon object 1 */ },
    { /* coupon object 2 */ }
  ]
}
```

---

### 4. Best Coupon API

```http
POST /api/coupons/best
```

**Request Body:**
```json
{
  "user": {
    "userId": "u123",
    "userTier": "NEW",
    "country": "IN",
    "lifetimeSpend": 1200,
    "ordersPlaced": 2,
    "couponUsage": {              // Optional: simulated usage history
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

**Success Response (200):**
```json
{
  "coupon": {
    "code": "FESTIVE10",
    "description": "10% off on electronics and fashion",
    "discountType": "PERCENT",
    "discountValue": 10,
    "maxDiscountAmount": 200
  },
  "discount": 150,
  "cartValue": 2500
}
```

**No Coupon Available (200):**
```json
{
  "coupon": null,
  "discount": 0,
  "cartValue": 2500
}
```

**Algorithm:**
1. **Filter eligible coupons:**
   - Within validity window (`startDate ≤ now ≤ endDate`)
   - Not exceeding `usageLimitPerUser` for this user
   - Satisfying all eligibility criteria (user + cart attributes)

2. **Calculate discount for each eligible coupon:**
   - **FLAT:** `discount = discountValue`
   - **PERCENT:** `discount = (discountValue% × cartValue)` capped by `maxDiscountAmount`

3. **Select best coupon:**
   - Highest discount amount
   - If tie: Earliest `endDate`
   - If still tie: Lexicographically smaller `code`

4. **Return:** Best coupon object with computed discount, or `null` if none applies

---

### 5. Demo Authentication (Optional)

```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "hire-me@anshumat.org",
  "password": "HireMe@2025!"
}
```

**Response:**
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

> **Note:** This is a simplified demo endpoint, not production-grade authentication.

## 🎯 Eligibility Rules Implementation

### User-Based Attributes

| Rule | Type | Description | Example |
|------|------|-------------|---------|
| `allowedUserTiers` | Array | Restrict to specific user tiers | `["NEW", "REGULAR", "GOLD"]` |
| `minLifetimeSpend` | Number | Minimum total historical spend | `5000` (₹5000) |
| `minOrdersPlaced` | Number | Minimum completed orders | `3` |
| `firstOrderOnly` | Boolean | Valid only for first-time orders | `true` |
| `allowedCountries` | Array | Geographic restrictions | `["IN", "US"]` |

### Cart-Based Attributes

| Rule | Type | Description | Example |
|------|------|-------------|---------|
| `minCartValue` | Number | Minimum total cart value | `500` (₹500) |
| `applicableCategories` | Array | Whitelist of product categories | `["electronics", "fashion"]` |
| `excludedCategories` | Array | Blacklist of product categories | `["gift-cards"]` |
| `minItemsCount` | Number | Minimum total quantity of items | `2` |

**Evaluation Logic:**
- All eligibility fields are **optional**
- If a field is not provided, that condition is **ignored**
- A coupon is eligible only if **ALL** provided conditions are satisfied
- Implementation: `src/services/eligibility.service.js`

## 📁 Project Structure

```
Coupon-Management-Service/
├── src/
│   ├── controllers/              # Request handlers
│   │   ├── auth.controller.js    # Demo authentication
│   │   └── coupon.controller.js  # Coupon CRUD + best coupon
│   ├── services/                 # Business logic
│   │   ├── auth.service.js       # Auth logic
│   │   ├── coupon.service.js     # Coupon operations
│   │   ├── eligibility.service.js # Eligibility evaluation
│   │   └── discount.service.js   # Discount calculation
│   ├── models/                   # Data models
│   │   └── memoryStore.js        # In-memory storage + seed loading
│   ├── routes/                   # API route definitions
│   │   ├── auth.routes.js
│   │   └── coupon.routes.js
│   ├── utils/                    # Seed data files
│   │   ├── seedCoupons.json      # Pre-loaded coupons
│   │   └── seedUsers.json        # Demo users (including reviewer)
│   └── app.js                    # Express app configuration
├── tests/                        # Test suite
│   └── coupon.test.js
├── public/                       # Static web UI files
│   ├── index.html
│   ├── styles.css
│   └── script.js
├── server.js                     # Application entry point
├── package.json                  # Dependencies and scripts
└── README.md                     # This file
```

## 🌟 Pre-loaded Example Coupons

The service comes with these seed coupons in `src/utils/seedCoupons.json`:

### 1. WELCOME100
- **Type:** FLAT ₹100 off
- **Eligibility:** NEW users only, first order only
- **Min Cart:** ₹500
- **Use Case:** New customer acquisition

### 2. FESTIVE10
- **Type:** 10% off (max ₹200)
- **Eligibility:** Electronics or Fashion categories
- **Min Cart:** ₹1000
- **Use Case:** Category-specific promotion

### 3. GOLD20
- **Type:** 20% off (max ₹500)
- **Eligibility:** GOLD tier, min ₹10,000 lifetime spend, 5+ orders
- **Use Case:** Loyalty reward for premium customers

### 4. NEWUSER50
- **Type:** FLAT ₹50 off
- **Eligibility:** NEW users, first order only
- **Min Cart:** ₹300
- **Use Case:** Low-barrier entry offer

### 5. BULK15
- **Type:** 15% off (max ₹300)
- **Eligibility:** Minimum 3 items in cart
- **Min Cart:** ₹2000
- **Use Case:** Bulk purchase incentive

## ✅ Assignment Requirements Coverage

### Core Requirements

| Requirement | Implementation | Location |
|-------------|----------------|----------|
| **Create Coupon API** | ✅ `POST /api/coupons/create` | `coupon.controller.js` → `coupon.service.js` |
| **Best Coupon API** | ✅ `POST /api/coupons/best` | `coupon.controller.js` → `coupon.service.js` |
| **User-based eligibility** | ✅ All 5 attributes supported | `eligibility.service.js` |
| **Cart-based eligibility** | ✅ All 4 attributes supported | `eligibility.service.js` |
| **FLAT discount** | ✅ Direct value subtraction | `discount.service.js` |
| **PERCENT discount** | ✅ With maxDiscountAmount cap | `discount.service.js` |
| **Validity window** | ✅ startDate/endDate validation | `coupon.service.js` |
| **Usage limits** | ✅ Per-user tracking | `memoryStore.js` + `coupon.service.js` |
| **Best coupon selection** | ✅ Deterministic algorithm | `coupon.service.js` |
| **In-memory storage** | ✅ Arrays + JSON seed files | `memoryStore.js` |
| **Hard-coded demo user** | ✅ `hire-me@anshumat.org` | `seedUsers.json` |

### Selection Algorithm (Deterministic)

The "best coupon" is selected using this tie-breaking logic:

1. **Primary:** Highest discount amount
2. **Secondary:** Earliest `endDate` (coupon expiring soonest)
3. **Tertiary:** Lexicographically smallest `code` (alphabetical order)

This ensures a single, predictable result every time.

### Error Handling

- ✅ Invalid input validation (missing required fields)
- ✅ Duplicate coupon code detection (HTTP 400)
- ✅ Invalid date format handling
- ✅ Empty cart handling
- ✅ Graceful handling when no coupons apply

## 🧠 AI Usage Note

### How AI Was Used

AI tools (ChatGPT and GitHub Copilot) were used throughout development to:

1. **Architecture & Design:**
   - Design the project structure and file organization
   - Plan the service layer separation (eligibility, discount, coupon)
   - Suggest in-memory storage patterns

2. **Code Generation:**
   - Generate Express.js boilerplate for routes and controllers
   - Create initial implementations of eligibility evaluation logic
   - Draft discount calculation functions

3. **Documentation:**
   - Generate this README structure and content
   - Create API documentation examples
   - Draft test case scenarios

4. **Debugging & Refinement:**
   - Troubleshoot edge cases in eligibility logic
   - Optimize the best coupon selection algorithm
   - Improve error messages and response formats

### Representative Prompts Used

1. **Project Setup:**
   ```
   "Create an Express.js project structure for a coupon management system 
   with controllers, services, and routes. Include in-memory storage and 
   seed data loading from JSON files."
   ```

2. **Business Logic:**
   ```
   "Write a function to evaluate coupon eligibility based on user attributes 
   (tier, spend, orders, country) and cart attributes (value, categories, 
   item count). All conditions should be optional."
   ```

3. **Algorithm Design:**
   ```
   "Implement a best coupon selection algorithm that filters eligible coupons, 
   calculates discounts (FLAT and PERCENT with caps), and selects the best one 
   using: highest discount → earliest expiry → smallest code."
   ```

4. **Documentation:**
   ```
   "Generate a comprehensive README for an e-commerce coupon management API 
   including: project overview, setup instructions, API documentation with 
   examples, data models, and assignment requirements coverage."
   ```

5. **Testing:**
   ```
   "Create test cases for coupon eligibility evaluation covering edge cases: 
   empty cart, no eligible coupons, tie-breaking scenarios, and usage limit 
   validation."
   ```

### AI's Role

AI accelerated development by providing boilerplate code and initial implementations, but **all business logic was reviewed, tested, and refined manually** to ensure correctness and meet assignment requirements. The final code represents a collaborative effort between AI assistance and human oversight.

## 🎨 Additional Features (Bonus)

Beyond the minimum requirements, this project includes:

- ✅ **Web UI:** Responsive demo interface for testing all APIs
- ✅ **Authentication:** Demo login endpoint with seed user
- ✅ **Test Suite:** Automated tests for core functionality
- ✅ **CORS Support:** Ready for frontend integration
- ✅ **Error Handling:** Comprehensive validation and error messages
- ✅ **List Coupons:** Debug endpoint to view all stored coupons
- ✅ **Usage Tracking:** Both in-memory and simulated user history
- ✅ **Documentation:** Detailed README with examples and API docs

## 🚦 Testing the Application

### Using the Web UI

1. Start the service: `npm start`
2. Open browser: `http://localhost:5000/`
3. Login with demo credentials
4. View available coupons
5. Simulate user + cart scenarios
6. See the best coupon recommendation

### Using cURL

**Create a Coupon:**
```bash
curl -X POST http://localhost:5000/api/coupons/create \
  -H "Content-Type: application/json" \
  -d '{
    "code": "TEST50",
    "description": "Test coupon",
    "discountType": "FLAT",
    "discountValue": 50,
    "startDate": "2025-01-01T00:00:00.000Z",
    "endDate": "2025-12-31T23:59:59.000Z"
  }'
```

**Get Best Coupon:**
```bash
curl -X POST http://localhost:5000/api/coupons/best \
  -H "Content-Type: application/json" \
  -d '{
    "user": {
      "userId": "u1",
      "userTier": "NEW",
      "country": "IN",
      "lifetimeSpend": 0,
      "ordersPlaced": 0
    },
    "cart": {
      "items": [
        {
          "productId": "p1",
          "category": "electronics",
          "unitPrice": 1000,
          "quantity": 1
        }
      ]
    }
  }'
```

## 📝 Design Decisions

### 1. Duplicate Coupon Codes
**Decision:** Reject duplicates with HTTP 400 error  
**Rationale:** Prevents accidental overwrites and maintains data integrity

### 2. Usage Limit Tracking
**Decision:** Dual approach - in-memory tracker + optional user.couponUsage  
**Rationale:** Supports both persistent tracking simulation and flexible testing

### 3. Eligibility Evaluation
**Decision:** All conditions must pass (AND logic)  
**Rationale:** Provides precise control over coupon applicability

### 4. Best Coupon Selection
**Decision:** Three-level tie-breaking (discount → date → code)  
**Rationale:** Ensures deterministic, reproducible results

### 5. Date Validation
**Decision:** Inclusive range check (startDate ≤ now ≤ endDate)  
**Rationale:** Coupons are valid on both boundary dates

## 🐛 Known Limitations

1. **In-Memory Storage:** Data is lost on server restart (by design)
2. **No Authentication:** Demo login is not secure (assignment requirement)
3. **No Rate Limiting:** APIs are unprotected from abuse
4. **Single Instance:** No support for horizontal scaling
5. **Simulated History:** Usage limits rely on simulated user data

These are intentional trade-offs for a demonstration project.

## 📄 License

This project is licensed under the MIT License.

## 👤 Author

**Nikhil**
- GitHub: [@codebynikhil-cpp](https://github.com/codebynikhil-cpp)

---

**Built as part of the Coupon Management assignment for Software Developer role**

For questions or feedback, please open an issue on GitHub.

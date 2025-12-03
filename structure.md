coupon-management/
│
├── src/
│   ├── app.js                # Express setup
│   ├── server.js             # Server start
│   │
│   ├── routes/
│   │   ├── coupon.routes.js  # Routes for coupon APIs
│   │
│   ├── controllers/
│   │   ├── coupon.controller.js  # Request handling
│   │
│   ├── services/
│   │   ├── coupon.service.js     # Core business logic
│   │   ├── eligibility.service.js# Eligibility checking logic
│   │   ├── discount.service.js   # Discount calculation logic
│   │
│   ├── models/
│   │   ├── coupon.model.js       # Schema-like structure for coupons
│   │   ├── memoryStore.js        # In-memory DB storage
│   │
│   ├── utils/
│   │   ├── validators.js         # Input validation helpers
│   │   ├── dateUtils.js          # Date comparison helpers
│   │
│   ├── data/
│   │   ├── seedUsers.json        # Contains hardcoded login user
│   │   ├── seedCoupons.json      # Sample coupons (optional)
│   │
│   ├── middleware/
│   │   ├── errorHandler.js       # Common error handler
│   │
│   └── config/
│       ├── constants.js          # Global constants
│
├── tests/                        # Optional, for bonus points
│   ├── coupon.test.js
│
├── README.md
├── package.json
├── .gitignore

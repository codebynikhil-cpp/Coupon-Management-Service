const Joi = require("joi");

// Schema for Coupon Creation/Update
const couponSchema = Joi.object({
    code: Joi.string().required(),
    description: Joi.string().required(),
    discountType: Joi.string().valid("FLAT", "PERCENT").required(),
    discountValue: Joi.number().positive().required(),
    maxDiscountAmount: Joi.number().positive().optional(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().greater(Joi.ref("startDate")).required(),
    usageLimitPerUser: Joi.number().integer().min(1).optional(),
    eligibility: Joi.object({
        allowedUserTiers: Joi.array().items(Joi.string()).optional(),
        minLifetimeSpend: Joi.number().min(0).optional(),
        minOrdersPlaced: Joi.number().min(0).optional(),
        firstOrderOnly: Joi.boolean().optional(),
        allowedCountries: Joi.array().items(Joi.string()).optional(),
        minCartValue: Joi.number().min(0).optional(),
        applicableCategories: Joi.array().items(Joi.string()).optional(),
        excludedCategories: Joi.array().items(Joi.string()).optional(),
        minItemsCount: Joi.number().min(0).optional()
    }).optional()
});

// Middleware function
exports.validateCoupon = (req, res, next) => {
    // For updates (PUT), code is in URL, so body might not have it or it might match.
    // We'll validate the body. If it's a PUT, we might want to allow partials or full replace.
    // The assignment implies full update or create structure validation.

    // If it's an update, we might strip 'code' from validation if it's immutable in body, 
    // but let's keep it simple: validate the payload structure.

    const { error } = couponSchema.validate(req.body, { abortEarly: false });

    if (error) {
        return res.status(400).json({
            error: "Validation Error",
            details: error.details.map((d) => d.message)
        });
    }

    next();
};

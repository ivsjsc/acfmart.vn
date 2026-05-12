"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
const shipping_providers_1 = require("../../../../lib/shipping-providers");
const POST = async (req, res) => {
    try {
        const rates = await (0, shipping_providers_1.quoteShippingProviders)(req.body);
        res.status(200).json({ success: true, rates });
    }
    catch (error) {
        res.status(503).json({
            success: false,
            error: error instanceof Error ? error.message : "Shipping rates are unavailable",
        });
    }
};
exports.POST = POST;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL3NoaXBwaW5nL3JhdGVzL3JvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLDJFQUEyRTtBQVNwRSxNQUFNLElBQUksR0FBRyxLQUFLLEVBQ3ZCLEdBQTZCLEVBQzdCLEdBQW1CLEVBQ25CLEVBQUU7SUFDRixJQUFJLENBQUM7UUFDSCxNQUFNLEtBQUssR0FBRyxNQUFNLElBQUEsMkNBQXNCLEVBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFBO1FBQ3BELEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFBO0lBQ2hELENBQUM7SUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1FBQ2YsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDbkIsT0FBTyxFQUFFLEtBQUs7WUFDZCxLQUFLLEVBQUUsS0FBSyxZQUFZLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsZ0NBQWdDO1NBQ2pGLENBQUMsQ0FBQTtJQUNKLENBQUM7QUFDSCxDQUFDLENBQUE7QUFiWSxRQUFBLElBQUksUUFhaEIifQ==
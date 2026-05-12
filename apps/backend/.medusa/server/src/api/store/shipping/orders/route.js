"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
const shipping_providers_1 = require("../../../../lib/shipping-providers");
const POST = async (req, res) => {
    try {
        const shippingOrder = await (0, shipping_providers_1.createShippingProviderOrder)(req.body);
        res.status(200).json({ success: true, shippingOrder });
    }
    catch (error) {
        res.status(503).json({
            success: false,
            error: error instanceof Error ? error.message : "Shipping order creation failed",
        });
    }
};
exports.POST = POST;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL3NoaXBwaW5nL29yZGVycy9yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSwyRUFBZ0Y7QUFnQnpFLE1BQU0sSUFBSSxHQUFHLEtBQUssRUFDdkIsR0FBMkMsRUFDM0MsR0FBbUIsRUFDbkIsRUFBRTtJQUNGLElBQUksQ0FBQztRQUNILE1BQU0sYUFBYSxHQUFHLE1BQU0sSUFBQSxnREFBMkIsRUFBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUE7UUFDakUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLGFBQWEsRUFBRSxDQUFDLENBQUE7SUFDeEQsQ0FBQztJQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7UUFDZixHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUNuQixPQUFPLEVBQUUsS0FBSztZQUNkLEtBQUssRUFBRSxLQUFLLFlBQVksS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxnQ0FBZ0M7U0FDakYsQ0FBQyxDQUFBO0lBQ0osQ0FBQztBQUNILENBQUMsQ0FBQTtBQWJZLFFBQUEsSUFBSSxRQWFoQiJ9
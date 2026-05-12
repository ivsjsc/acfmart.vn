"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
const env_1 = require("../../../../../lib/env");
const http_1 = require("../../../../../lib/http");
const payment_security_1 = require("../../../../../lib/payment-security");
const POST = async (req, res) => {
    try {
        const partnerCode = (0, env_1.requireEnv)("MOMO_PARTNER_CODE");
        const accessKey = (0, env_1.requireEnv)("MOMO_ACCESS_KEY");
        const secretKey = (0, env_1.requireEnv)("MOMO_SECRET_KEY");
        const endpoint = (0, env_1.env)("MOMO_CREATE_URL") || "https://test-payment.momo.vn/v2/gateway/api/create";
        const orderId = req.body.orderId || `ACF${Date.now()}`;
        const requestId = `${orderId}_${Date.now()}`;
        const requestType = req.body.requestType || "payWithMethod";
        const extraData = req.body.extraData || "";
        const ipnUrl = req.body.ipnUrl || `${(0, env_1.backendUrl)().replace(/\/$/, "")}/store/payment/webhooks`;
        const orderInfo = req.body.orderInfo || `Thanh toan don hang ${orderId}`;
        const rawSignature = [
            `accessKey=${accessKey}`,
            `amount=${req.body.amount}`,
            `extraData=${extraData}`,
            `ipnUrl=${ipnUrl}`,
            `orderId=${orderId}`,
            `orderInfo=${orderInfo}`,
            `partnerCode=${partnerCode}`,
            `redirectUrl=${req.body.redirectUrl}`,
            `requestId=${requestId}`,
            `requestType=${requestType}`,
        ].join("&");
        const payload = {
            partnerCode,
            partnerName: (0, env_1.env)("MOMO_PARTNER_NAME") || "ACFMart",
            storeId: (0, env_1.env)("MOMO_STORE_ID") || "ACFMart",
            requestId,
            amount: req.body.amount,
            orderId,
            orderInfo,
            redirectUrl: req.body.redirectUrl,
            ipnUrl,
            lang: "vi",
            requestType,
            autoCapture: true,
            extraData,
            signature: (0, payment_security_1.hmacHex)("sha256", secretKey, rawSignature),
        };
        const data = await (0, http_1.postJson)(endpoint, payload);
        res.status(200).json({
            success: data.resultCode === 0,
            ...data,
        });
    }
    catch (error) {
        res.status(503).json({
            success: false,
            error: error instanceof Error ? error.message : "MoMo is not configured",
        });
    }
};
exports.POST = POST;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL3BheW1lbnQvbW9tby9pbml0L3JvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLGdEQUFvRTtBQUNwRSxrREFBa0Q7QUFDbEQsMEVBQTZEO0FBWXRELE1BQU0sSUFBSSxHQUFHLEtBQUssRUFDdkIsR0FBZ0MsRUFDaEMsR0FBbUIsRUFDbkIsRUFBRTtJQUNGLElBQUksQ0FBQztRQUNILE1BQU0sV0FBVyxHQUFHLElBQUEsZ0JBQVUsRUFBQyxtQkFBbUIsQ0FBQyxDQUFBO1FBQ25ELE1BQU0sU0FBUyxHQUFHLElBQUEsZ0JBQVUsRUFBQyxpQkFBaUIsQ0FBQyxDQUFBO1FBQy9DLE1BQU0sU0FBUyxHQUFHLElBQUEsZ0JBQVUsRUFBQyxpQkFBaUIsQ0FBQyxDQUFBO1FBQy9DLE1BQU0sUUFBUSxHQUNaLElBQUEsU0FBRyxFQUFDLGlCQUFpQixDQUFDLElBQUksb0RBQW9ELENBQUE7UUFFaEYsTUFBTSxPQUFPLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLElBQUksTUFBTSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQTtRQUN0RCxNQUFNLFNBQVMsR0FBRyxHQUFHLE9BQU8sSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQTtRQUM1QyxNQUFNLFdBQVcsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsSUFBSSxlQUFlLENBQUE7UUFDM0QsTUFBTSxTQUFTLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLElBQUksRUFBRSxDQUFBO1FBQzFDLE1BQU0sTUFBTSxHQUNWLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLEdBQUcsSUFBQSxnQkFBVSxHQUFFLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMseUJBQXlCLENBQUE7UUFDaEYsTUFBTSxTQUFTLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLElBQUksdUJBQXVCLE9BQU8sRUFBRSxDQUFBO1FBRXhFLE1BQU0sWUFBWSxHQUFHO1lBQ25CLGFBQWEsU0FBUyxFQUFFO1lBQ3hCLFVBQVUsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDM0IsYUFBYSxTQUFTLEVBQUU7WUFDeEIsVUFBVSxNQUFNLEVBQUU7WUFDbEIsV0FBVyxPQUFPLEVBQUU7WUFDcEIsYUFBYSxTQUFTLEVBQUU7WUFDeEIsZUFBZSxXQUFXLEVBQUU7WUFDNUIsZUFBZSxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRTtZQUNyQyxhQUFhLFNBQVMsRUFBRTtZQUN4QixlQUFlLFdBQVcsRUFBRTtTQUM3QixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUVYLE1BQU0sT0FBTyxHQUFHO1lBQ2QsV0FBVztZQUNYLFdBQVcsRUFBRSxJQUFBLFNBQUcsRUFBQyxtQkFBbUIsQ0FBQyxJQUFJLFNBQVM7WUFDbEQsT0FBTyxFQUFFLElBQUEsU0FBRyxFQUFDLGVBQWUsQ0FBQyxJQUFJLFNBQVM7WUFDMUMsU0FBUztZQUNULE1BQU0sRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU07WUFDdkIsT0FBTztZQUNQLFNBQVM7WUFDVCxXQUFXLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXO1lBQ2pDLE1BQU07WUFDTixJQUFJLEVBQUUsSUFBSTtZQUNWLFdBQVc7WUFDWCxXQUFXLEVBQUUsSUFBSTtZQUNqQixTQUFTO1lBQ1QsU0FBUyxFQUFFLElBQUEsMEJBQU8sRUFBQyxRQUFRLEVBQUUsU0FBUyxFQUFFLFlBQVksQ0FBQztTQUN0RCxDQUFBO1FBRUQsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFBLGVBQVEsRUFBMEIsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFBO1FBRXZFLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQ25CLE9BQU8sRUFBRSxJQUFJLENBQUMsVUFBVSxLQUFLLENBQUM7WUFDOUIsR0FBRyxJQUFJO1NBQ1IsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7UUFDZixHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUNuQixPQUFPLEVBQUUsS0FBSztZQUNkLEtBQUssRUFBRSxLQUFLLFlBQVksS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyx3QkFBd0I7U0FDekUsQ0FBQyxDQUFBO0lBQ0osQ0FBQztBQUNILENBQUMsQ0FBQTtBQTdEWSxRQUFBLElBQUksUUE2RGhCIn0=
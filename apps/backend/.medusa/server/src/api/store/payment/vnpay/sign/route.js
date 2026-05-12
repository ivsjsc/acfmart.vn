"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
const env_1 = require("../../../../../lib/env");
const payment_security_1 = require("../../../../../lib/payment-security");
const POST = async (req, res) => {
    try {
        const tmnCode = (0, env_1.requireEnv)("VNPAY_TMN_CODE");
        const hashSecret = (0, env_1.requireEnv)("VNPAY_HASH_SECRET");
        const paymentUrl = req.body.baseUrl ||
            (0, env_1.env)("VNPAY_PAYMENT_URL") ||
            "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
        const createdAt = (0, payment_security_1.vnpayDate)();
        const expireAt = (0, payment_security_1.vnpayDate)(new Date(Date.now() + (req.body.expireMinutes ?? 15) * 60 * 1000));
        const params = req.body.params ??
            {
                vnp_Version: "2.1.0",
                vnp_Command: "pay",
                vnp_TmnCode: tmnCode,
                vnp_Amount: String(Math.round(Number(req.body.amount ?? 0)) * 100),
                vnp_CurrCode: "VND",
                vnp_TxnRef: req.body.orderId ?? `ACF${Date.now()}`,
                vnp_OrderInfo: (req.body.orderInfo ?? "Thanh toan don hang ACFMart")
                    .replace(/[^\p{L}\p{N}\s._-]/gu, "")
                    .slice(0, 255),
                vnp_OrderType: "other",
                vnp_Locale: "vn",
                vnp_ReturnUrl: req.body.returnUrl ?? `${(0, env_1.env)("STORE_URL") || ""}/order-success`,
                vnp_IpAddr: req.body.ipAddress ?? "127.0.0.1",
                vnp_CreateDate: createdAt,
                vnp_ExpireDate: expireAt,
            };
        params.vnp_TmnCode = params.vnp_TmnCode || tmnCode;
        params.vnp_CreateDate = params.vnp_CreateDate || createdAt;
        const signData = (0, payment_security_1.sortedQuery)(params);
        const secureHash = (0, payment_security_1.hmacHex)("sha512", hashSecret, signData);
        const redirectUrl = `${paymentUrl}?${signData}&vnp_SecureHash=${secureHash}`;
        res.status(200).json({
            success: true,
            redirectUrl,
            providerTxnRef: params.vnp_TxnRef,
        });
    }
    catch (error) {
        res.status(503).json({
            success: false,
            error: error instanceof Error ? error.message : "VNPay is not configured",
        });
    }
};
exports.POST = POST;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL3BheW1lbnQvdm5wYXkvc2lnbi9yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSxnREFBd0Q7QUFDeEQsMEVBQXFGO0FBYTlFLE1BQU0sSUFBSSxHQUFHLEtBQUssRUFDdkIsR0FBaUMsRUFDakMsR0FBbUIsRUFDbkIsRUFBRTtJQUNGLElBQUksQ0FBQztRQUNILE1BQU0sT0FBTyxHQUFHLElBQUEsZ0JBQVUsRUFBQyxnQkFBZ0IsQ0FBQyxDQUFBO1FBQzVDLE1BQU0sVUFBVSxHQUFHLElBQUEsZ0JBQVUsRUFBQyxtQkFBbUIsQ0FBQyxDQUFBO1FBQ2xELE1BQU0sVUFBVSxHQUNkLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTztZQUNoQixJQUFBLFNBQUcsRUFBQyxtQkFBbUIsQ0FBQztZQUN4QixvREFBb0QsQ0FBQTtRQUV0RCxNQUFNLFNBQVMsR0FBRyxJQUFBLDRCQUFTLEdBQUUsQ0FBQTtRQUM3QixNQUFNLFFBQVEsR0FBRyxJQUFBLDRCQUFTLEVBQ3hCLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsYUFBYSxJQUFJLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FDbEUsQ0FBQTtRQUVELE1BQU0sTUFBTSxHQUNWLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTTtZQUNmO2dCQUNFLFdBQVcsRUFBRSxPQUFPO2dCQUNwQixXQUFXLEVBQUUsS0FBSztnQkFDbEIsV0FBVyxFQUFFLE9BQU87Z0JBQ3BCLFVBQVUsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7Z0JBQ2xFLFlBQVksRUFBRSxLQUFLO2dCQUNuQixVQUFVLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLElBQUksTUFBTSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUU7Z0JBQ2xELGFBQWEsRUFBRSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxJQUFJLDZCQUE2QixDQUFDO3FCQUNqRSxPQUFPLENBQUMsc0JBQXNCLEVBQUUsRUFBRSxDQUFDO3FCQUNuQyxLQUFLLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQztnQkFDaEIsYUFBYSxFQUFFLE9BQU87Z0JBQ3RCLFVBQVUsRUFBRSxJQUFJO2dCQUNoQixhQUFhLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLElBQUksR0FBRyxJQUFBLFNBQUcsRUFBQyxXQUFXLENBQUMsSUFBSSxFQUFFLGdCQUFnQjtnQkFDOUUsVUFBVSxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxJQUFJLFdBQVc7Z0JBQzdDLGNBQWMsRUFBRSxTQUFTO2dCQUN6QixjQUFjLEVBQUUsUUFBUTthQUN6QixDQUFBO1FBRUgsTUFBTSxDQUFDLFdBQVcsR0FBRyxNQUFNLENBQUMsV0FBVyxJQUFJLE9BQU8sQ0FBQTtRQUNsRCxNQUFNLENBQUMsY0FBYyxHQUFHLE1BQU0sQ0FBQyxjQUFjLElBQUksU0FBUyxDQUFBO1FBRTFELE1BQU0sUUFBUSxHQUFHLElBQUEsOEJBQVcsRUFBQyxNQUFNLENBQUMsQ0FBQTtRQUNwQyxNQUFNLFVBQVUsR0FBRyxJQUFBLDBCQUFPLEVBQUMsUUFBUSxFQUFFLFVBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQTtRQUMxRCxNQUFNLFdBQVcsR0FBRyxHQUFHLFVBQVUsSUFBSSxRQUFRLG1CQUFtQixVQUFVLEVBQUUsQ0FBQTtRQUU1RSxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUNuQixPQUFPLEVBQUUsSUFBSTtZQUNiLFdBQVc7WUFDWCxjQUFjLEVBQUUsTUFBTSxDQUFDLFVBQVU7U0FDbEMsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7UUFDZixHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUNuQixPQUFPLEVBQUUsS0FBSztZQUNkLEtBQUssRUFBRSxLQUFLLFlBQVksS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyx5QkFBeUI7U0FDMUUsQ0FBQyxDQUFBO0lBQ0osQ0FBQztBQUNILENBQUMsQ0FBQTtBQXZEWSxRQUFBLElBQUksUUF1RGhCIn0=
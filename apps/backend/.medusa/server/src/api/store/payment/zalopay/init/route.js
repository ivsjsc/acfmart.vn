"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
const env_1 = require("../../../../../lib/env");
const http_1 = require("../../../../../lib/http");
const payment_security_1 = require("../../../../../lib/payment-security");
function zaloPayTransId(orderId) {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    return `${yy}${mm}${dd}_${orderId || Date.now()}`;
}
const POST = async (req, res) => {
    try {
        const appId = (0, env_1.requireEnv)("ZALOPAY_APP_ID");
        const key1 = (0, env_1.requireEnv)("ZALOPAY_KEY1");
        const endpoint = (0, env_1.env)("ZALOPAY_CREATE_URL") || "https://sb-openapi.zalopay.vn/v2/create";
        const appTransId = req.body.app_trans_id || zaloPayTransId(req.body.orderId);
        const appUser = req.body.app_user || "guest";
        const appTime = Date.now();
        const item = JSON.stringify(req.body.item || []);
        const embedData = JSON.stringify(req.body.embed_data || {});
        const description = req.body.description || `Thanh toan don hang ${req.body.orderId || appTransId}`;
        const macData = [
            appId,
            appTransId,
            appUser,
            req.body.amount,
            appTime,
            embedData,
            item,
        ].join("|");
        const payload = {
            app_id: appId,
            app_user: appUser,
            app_trans_id: appTransId,
            app_time: appTime,
            amount: req.body.amount,
            item,
            embed_data: embedData,
            description,
            bank_code: req.body.bank_code || "",
            mac: (0, payment_security_1.hmacHex)("sha256", key1, macData),
        };
        const data = await (0, http_1.postForm)(endpoint, payload);
        res.status(200).json({
            success: data.return_code === 1,
            ...data,
        });
    }
    catch (error) {
        res.status(503).json({
            success: false,
            error: error instanceof Error ? error.message : "ZaloPay is not configured",
        });
    }
};
exports.POST = POST;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL3BheW1lbnQvemFsb3BheS9pbml0L3JvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLGdEQUF3RDtBQUN4RCxrREFBa0Q7QUFDbEQsMEVBQTZEO0FBYTdELFNBQVMsY0FBYyxDQUFDLE9BQWdCO0lBQ3RDLE1BQU0sR0FBRyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUE7SUFDdEIsTUFBTSxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQzlDLE1BQU0sRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQTtJQUN0RCxNQUFNLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQTtJQUNqRCxPQUFPLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksT0FBTyxJQUFJLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFBO0FBQ25ELENBQUM7QUFFTSxNQUFNLElBQUksR0FBRyxLQUFLLEVBQ3ZCLEdBQW1DLEVBQ25DLEdBQW1CLEVBQ25CLEVBQUU7SUFDRixJQUFJLENBQUM7UUFDSCxNQUFNLEtBQUssR0FBRyxJQUFBLGdCQUFVLEVBQUMsZ0JBQWdCLENBQUMsQ0FBQTtRQUMxQyxNQUFNLElBQUksR0FBRyxJQUFBLGdCQUFVLEVBQUMsY0FBYyxDQUFDLENBQUE7UUFDdkMsTUFBTSxRQUFRLEdBQ1osSUFBQSxTQUFHLEVBQUMsb0JBQW9CLENBQUMsSUFBSSx5Q0FBeUMsQ0FBQTtRQUV4RSxNQUFNLFVBQVUsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLFlBQVksSUFBSSxjQUFjLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQTtRQUM1RSxNQUFNLE9BQU8sR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsSUFBSSxPQUFPLENBQUE7UUFDNUMsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQzFCLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLENBQUE7UUFDaEQsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsSUFBSSxFQUFFLENBQUMsQ0FBQTtRQUMzRCxNQUFNLFdBQVcsR0FDZixHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsSUFBSSx1QkFBdUIsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLElBQUksVUFBVSxFQUFFLENBQUE7UUFFakYsTUFBTSxPQUFPLEdBQUc7WUFDZCxLQUFLO1lBQ0wsVUFBVTtZQUNWLE9BQU87WUFDUCxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU07WUFDZixPQUFPO1lBQ1AsU0FBUztZQUNULElBQUk7U0FDTCxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUVYLE1BQU0sT0FBTyxHQUFHO1lBQ2QsTUFBTSxFQUFFLEtBQUs7WUFDYixRQUFRLEVBQUUsT0FBTztZQUNqQixZQUFZLEVBQUUsVUFBVTtZQUN4QixRQUFRLEVBQUUsT0FBTztZQUNqQixNQUFNLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNO1lBQ3ZCLElBQUk7WUFDSixVQUFVLEVBQUUsU0FBUztZQUNyQixXQUFXO1lBQ1gsU0FBUyxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxJQUFJLEVBQUU7WUFDbkMsR0FBRyxFQUFFLElBQUEsMEJBQU8sRUFBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQztTQUN0QyxDQUFBO1FBRUQsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFBLGVBQVEsRUFBMEIsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFBO1FBRXZFLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQ25CLE9BQU8sRUFBRSxJQUFJLENBQUMsV0FBVyxLQUFLLENBQUM7WUFDL0IsR0FBRyxJQUFJO1NBQ1IsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7UUFDZixHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUNuQixPQUFPLEVBQUUsS0FBSztZQUNkLEtBQUssRUFBRSxLQUFLLFlBQVksS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQywyQkFBMkI7U0FDNUUsQ0FBQyxDQUFBO0lBQ0osQ0FBQztBQUNILENBQUMsQ0FBQTtBQXJEWSxRQUFBLElBQUksUUFxRGhCIn0=
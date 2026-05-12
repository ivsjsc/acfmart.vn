"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
const env_1 = require("../../../../lib/env");
const payment_security_1 = require("../../../../lib/payment-security");
function verifyVNPay(payload) {
    const hashSecret = (0, env_1.requireEnv)("VNPAY_HASH_SECRET");
    const secureHash = payload.vnp_SecureHash;
    const unsigned = { ...payload };
    delete unsigned.vnp_SecureHash;
    delete unsigned.vnp_SecureHashType;
    const expected = (0, payment_security_1.hmacHex)("sha512", hashSecret, (0, payment_security_1.sortedQuery)(unsigned));
    if (expected !== secureHash) {
        throw new Error("Invalid VNPay signature");
    }
    return {
        provider: "vnpay",
        orderId: payload.vnp_TxnRef,
        status: payload.vnp_ResponseCode === "00" ? "paid" : "failed",
        providerTxnRef: payload.vnp_TransactionNo,
        amount: Number(payload.vnp_Amount || 0) / 100,
    };
}
function verifyMomo(payload) {
    const secretKey = (0, env_1.requireEnv)("MOMO_SECRET_KEY");
    const signature = payload.signature;
    const rawSignature = [
        `accessKey=${(0, env_1.env)("MOMO_ACCESS_KEY")}`,
        `amount=${payload.amount}`,
        `extraData=${payload.extraData || ""}`,
        `message=${payload.message || ""}`,
        `orderId=${payload.orderId}`,
        `orderInfo=${payload.orderInfo || ""}`,
        `orderType=${payload.orderType || ""}`,
        `partnerCode=${payload.partnerCode}`,
        `payType=${payload.payType || ""}`,
        `requestId=${payload.requestId}`,
        `responseTime=${payload.responseTime}`,
        `resultCode=${payload.resultCode}`,
        `transId=${payload.transId}`,
    ].join("&");
    const expected = (0, payment_security_1.hmacHex)("sha256", secretKey, rawSignature);
    if (signature && expected !== signature) {
        throw new Error("Invalid MoMo signature");
    }
    return {
        provider: "momo",
        orderId: payload.orderId,
        status: Number(payload.resultCode) === 0 ? "paid" : "failed",
        providerTxnRef: payload.transId,
        amount: Number(payload.amount || 0),
    };
}
function verifyZaloPay(payload) {
    const key2 = (0, env_1.requireEnv)("ZALOPAY_KEY2");
    const data = typeof payload.data === "string" ? payload.data : JSON.stringify(payload.data);
    const expected = (0, payment_security_1.hmacHex)("sha256", key2, data);
    if (payload.mac && expected !== payload.mac) {
        throw new Error("Invalid ZaloPay signature");
    }
    const parsed = typeof payload.data === "string" ? JSON.parse(payload.data) : payload.data;
    return {
        provider: "zalopay",
        orderId: parsed?.app_trans_id,
        status: Number(payload.type) === 1 ? "paid" : "failed",
        providerTxnRef: parsed?.zp_trans_id,
        amount: Number(parsed?.amount || 0),
    };
}
const POST = async (req, res) => {
    try {
        const provider = req.body.provider;
        const payload = req.body.payload || req.body;
        const result = provider === "vnpay"
            ? verifyVNPay(payload)
            : provider === "momo"
                ? verifyMomo(payload)
                : provider === "zalopay"
                    ? verifyZaloPay(payload)
                    : payload.vnp_TxnRef
                        ? verifyVNPay(payload)
                        : payload.partnerCode
                            ? verifyMomo(payload)
                            : verifyZaloPay(payload);
        req.scope.resolve("logger").info(`Payment webhook accepted: ${JSON.stringify(result)}`);
        res.status(200).json({
            success: true,
            payment: result,
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error instanceof Error ? error.message : "Invalid payment webhook",
        });
    }
};
exports.POST = POST;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL3BheW1lbnQvd2ViaG9va3Mvcm91dGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsNkNBQXFEO0FBQ3JELHVFQUF1RTtBQVF2RSxTQUFTLFdBQVcsQ0FBQyxPQUErQjtJQUNsRCxNQUFNLFVBQVUsR0FBRyxJQUFBLGdCQUFVLEVBQUMsbUJBQW1CLENBQUMsQ0FBQTtJQUNsRCxNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFBO0lBQ3pDLE1BQU0sUUFBUSxHQUFHLEVBQUUsR0FBRyxPQUFPLEVBQUUsQ0FBQTtJQUMvQixPQUFPLFFBQVEsQ0FBQyxjQUFjLENBQUE7SUFDOUIsT0FBTyxRQUFRLENBQUMsa0JBQWtCLENBQUE7SUFFbEMsTUFBTSxRQUFRLEdBQUcsSUFBQSwwQkFBTyxFQUFDLFFBQVEsRUFBRSxVQUFVLEVBQUUsSUFBQSw4QkFBVyxFQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUE7SUFDckUsSUFBSSxRQUFRLEtBQUssVUFBVSxFQUFFLENBQUM7UUFDNUIsTUFBTSxJQUFJLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxDQUFBO0lBQzVDLENBQUM7SUFFRCxPQUFPO1FBQ0wsUUFBUSxFQUFFLE9BQU87UUFDakIsT0FBTyxFQUFFLE9BQU8sQ0FBQyxVQUFVO1FBQzNCLE1BQU0sRUFBRSxPQUFPLENBQUMsZ0JBQWdCLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVE7UUFDN0QsY0FBYyxFQUFFLE9BQU8sQ0FBQyxpQkFBaUI7UUFDekMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBVSxJQUFJLENBQUMsQ0FBQyxHQUFHLEdBQUc7S0FDOUMsQ0FBQTtBQUNILENBQUM7QUFFRCxTQUFTLFVBQVUsQ0FBQyxPQUE0QjtJQUM5QyxNQUFNLFNBQVMsR0FBRyxJ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
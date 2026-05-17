import { Request, Response, NextFunction } from "express";
import { paymentService } from "../services/PaymentService";
import { PaymentGatewayFactory } from "../gateways/PaymentGatewayFactory";
import { PaymentProvider } from "../gateways/IPaymentGateway";
import { ValidationError } from "../middleware/errorHandler";

const SUPPORTED_WEBHOOK_PROVIDERS: PaymentProvider[] = ["vnpay", "momo", "zalopay", "stripe"];

export const webhookController = {
  async receive(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const provider = req.params.provider as PaymentProvider;
      if (!SUPPORTED_WEBHOOK_PROVIDERS.includes(provider)) {
        throw new ValidationError(`Provider ${provider} không hỗ trợ webhook`);
      }

      // Đảm bảo gateway đã được đăng ký - throw nếu chưa
      PaymentGatewayFactory.getGateway(provider);

      const rawBody = (req as Request & { rawBody?: Buffer }).rawBody ?? Buffer.from(JSON.stringify(req.body));

      const result = await paymentService.processWebhook(
        provider,
        {
          rawBody,
          headers: req.headers as Record<string, string | string[]>,
          body: req.body as Record<string, unknown>,
          query: req.query as Record<string, unknown>,
        },
        req.ip
      );

      // VNPay yêu cầu body { RspCode, Message }, Stripe yêu cầu 200 trống.
      // Trả format chung; provider-specific response sẽ wrap thêm ở route.
      if (provider === "vnpay") {
        res.status(200).json({
          RspCode: result.accepted ? "00" : "97",
          Message: result.accepted ? "Confirm Success" : "Invalid Signature",
        });
        return;
      }

      res.status(result.accepted ? 200 : 401).json({
        success: result.accepted,
        transaction_id: result.transactionId,
      });
    } catch (err) {
      next(err);
    }
  },
};

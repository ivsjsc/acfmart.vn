import { PaymentGatewayFactory } from "../src/gateways/PaymentGatewayFactory";
import { VNPayGateway } from "../src/gateways/VNPayGateway";
import { MoMoGateway } from "../src/gateways/MoMoGateway";
import { ZaloPayGateway } from "../src/gateways/ZaloPayGateway";
import { StripeGateway } from "../src/gateways/StripeGateway";

describe("PaymentGatewayFactory", () => {
  beforeEach(() => {
    PaymentGatewayFactory.__resetForTests();
  });

  test("trả về VNPayGateway cho provider 'vnpay'", () => {
    const gw = PaymentGatewayFactory.getGateway("vnpay");
    expect(gw).toBeInstanceOf(VNPayGateway);
    expect(gw.provider).toBe("vnpay");
  });

  test("trả về MoMoGateway cho provider 'momo'", () => {
    const gw = PaymentGatewayFactory.getGateway("momo");
    expect(gw).toBeInstanceOf(MoMoGateway);
  });

  test("trả về ZaloPayGateway cho provider 'zalopay'", () => {
    const gw = PaymentGatewayFactory.getGateway("zalopay");
    expect(gw).toBeInstanceOf(ZaloPayGateway);
  });

  test("trả về StripeGateway cho provider 'stripe'", () => {
    const gw = PaymentGatewayFactory.getGateway("stripe");
    expect(gw).toBeInstanceOf(StripeGateway);
  });

  test("ném lỗi rõ ràng cho provider chưa implement", () => {
    expect(() => PaymentGatewayFactory.getGateway("paypal")).toThrow(/paypal.*chưa được triển khai/i);
  });

  test("idempotent: cùng provider trả về cùng instance", () => {
    const a = PaymentGatewayFactory.getGateway("vnpay");
    const b = PaymentGatewayFactory.getGateway("vnpay");
    expect(a).toBe(b);
  });

  test("listProviders trả về danh sách provider đã đăng ký", () => {
    const list = PaymentGatewayFactory.listProviders();
    expect(list).toEqual(expect.arrayContaining(["vnpay", "momo", "zalopay", "stripe"]));
    expect(list).not.toContain("paypal"); // chưa đăng ký
  });
});

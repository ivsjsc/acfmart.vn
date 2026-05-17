// Test environment defaults - tránh fail khi assertEnv trong constructor gateway
process.env.NODE_ENV = "test";
process.env.LOG_LEVEL = "silent";

process.env.VNPAY_TMNCODE = process.env.VNPAY_TMNCODE ?? "TEST_TMNCODE";
process.env.VNPAY_HASHSECRET = process.env.VNPAY_HASHSECRET ?? "TEST_HASHSECRET";
process.env.VNPAY_API_URL = process.env.VNPAY_API_URL ?? "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";

process.env.MOMO_PARTNER_CODE = process.env.MOMO_PARTNER_CODE ?? "TEST_PARTNER";
process.env.MOMO_ACCESS_KEY = process.env.MOMO_ACCESS_KEY ?? "TEST_ACCESS";
process.env.MOMO_SECRET_KEY = process.env.MOMO_SECRET_KEY ?? "TEST_SECRET";
process.env.MOMO_API_URL = process.env.MOMO_API_URL ?? "https://test-payment.momo.vn/v2/gateway/api/create";

process.env.ZALOPAY_APP_ID = process.env.ZALOPAY_APP_ID ?? "1";
process.env.ZALOPAY_KEY1 = process.env.ZALOPAY_KEY1 ?? "TEST_KEY1";
process.env.ZALOPAY_KEY2 = process.env.ZALOPAY_KEY2 ?? "TEST_KEY2";
process.env.ZALOPAY_API_URL = process.env.ZALOPAY_API_URL ?? "https://sb-openapi.zalopay.vn/v2/create";

process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY ?? "sk_test_123";
process.env.STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "whsec_test";

process.env.INTERNAL_API_KEY = process.env.INTERNAL_API_KEY ?? "test-internal-api-key-1234567890";

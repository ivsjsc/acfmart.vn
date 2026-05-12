// Configuration for external integrations
export const MODERATORS_JSON = import.meta.env.VITE_MODERATORS_LIST || '[]';
export const ZALO_ACCESS_TOKEN = import.meta.env.VITE_ZALO_ACCESS_TOKEN || '';

// Third-party Integration Configuration
export interface IntegrationConfig {
  vnpay: VNPAYConfig;
  momo: MoMoConfig;
  zalopay: ZaloPayConfig;
  ghn: GHNConfig;
  viettelpost: ViettelPostConfig;
  ghtk: GHTKConfig;
  email: EmailConfig;
  sms: SMSConfig;
  storage: StorageConfig;
}

export interface VNPAYConfig {
  enabled: boolean;
  tmnCode: string;
  secretKey: string;
  paymentUrl: string;
  queryUrl: string;
  returnUrl: string;
  notifyUrl: string;
  environment: 'sandbox' | 'production';
}

export interface MoMoConfig {
  enabled: boolean;
  partnerCode: string;
  accessKey: string;
  secretKey: string;
  paymentUrl: string;
  queryUrl: string;
  returnUrl: string;
  notifyUrl: string;
  environment: 'sandbox' | 'production';
}

export interface ZaloPayConfig {
  enabled: boolean;
  appId: string;
  key1: string;
  key2: string;
  paymentUrl: string;
  queryUrl: string;
  returnUrl: string;
  environment: 'sandbox' | 'production';
}

export interface GHNConfig {
  enabled: boolean;
  token: string;
  apiUrl: string;
  shopId: string;
  environment: 'sandbox' | 'production';
}

export interface ViettelPostConfig {
  enabled: boolean;
  token: string;
  apiUrl: string;
  customerCode: string;
  environment: 'sandbox' | 'production';
}

export interface GHTKConfig {
  enabled: boolean;
  token: string;
  apiUrl: string;
  shopId: string;
  environment: 'sandbox' | 'production';
}

export interface EmailConfig {
  enabled: boolean;
  provider: 'sendgrid' | 'ses' | 'smtp';
  apiKey?: string;
  fromEmail: string;
  fromName: string;
  smtp?: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
}

export interface SMSConfig {
  enabled: boolean;
  provider: 'twilio' | 'viettel' | 'vinaphone';
  apiKey?: string;
  apiSecret?: string;
  fromNumber?: string;
}

export interface StorageConfig {
  enabled: boolean;
  provider: 'aws-s3' | 'google-cloud' | 'azure' | 'local';
  bucket?: string;
  region?: string;
  accessKey?: string;
  secretKey?: string;
  endpoint?: string;
}

// Default configuration
export const defaultIntegrationConfig: IntegrationConfig = {
  vnpay: {
    enabled: true,
    tmnCode: process.env.REACT_APP_VNPAY_TMN_CODE || '',
    secretKey: process.env.REACT_APP_VNPAY_SECRET_KEY || '',
    paymentUrl: process.env.REACT_APP_VNPAY_PAYMENT_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
    queryUrl: process.env.REACT_APP_VNPAY_QUERY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
    returnUrl: `${window.location.origin}/payment/vnpay/return`,
    notifyUrl: `${window.location.origin}/api/payment/vnpay/notify`,
    environment: (process.env.REACT_APP_VNPAY_ENV as 'sandbox' | 'production') || 'sandbox'
  },
  momo: {
    enabled: true,
    partnerCode: process.env.REACT_APP_MOMO_PARTNER_CODE || '',
    accessKey: process.env.REACT_APP_MOMO_ACCESS_KEY || '',
    secretKey: process.env.REACT_APP_MOMO_SECRET_KEY || '',
    paymentUrl: process.env.REACT_APP_MOMO_PAYMENT_URL || 'https://test-payment.momo.vn/gw_payment/transactionProcessor',
    queryUrl: process.env.REACT_APP_MOMO_QUERY_URL || 'https://test-payment.momo.vn/gw_payment/transactionProcessor',
    returnUrl: `${window.location.origin}/payment/momo/return`,
    notifyUrl: `${window.location.origin}/api/payment/momo/notify`,
    environment: (process.env.REACT_APP_MOMO_ENV as 'sandbox' | 'production') || 'sandbox'
  },
  zalopay: {
    enabled: true,
    appId: process.env.REACT_APP_ZALOPAY_APP_ID || '',
    key1: process.env.REACT_APP_ZALOPAY_KEY1 || '',
    key2: process.env.REACT_APP_ZALOPAY_KEY2 || '',
    paymentUrl: process.env.REACT_APP_ZALOPAY_PAYMENT_URL || 'https://sb-openapi.zalopay.vn/v2/create',
    queryUrl: process.env.REACT_APP_ZALOPAY_QUERY_URL || 'https://sb-openapi.zalopay.vn/v2/query',
    returnUrl: `${window.location.origin}/payment/zalopay/return`,
    environment: (process.env.REACT_APP_ZALOPAY_ENV as 'sandbox' | 'production') || 'sandbox'
  },
  ghn: {
    enabled: true,
    token: process.env.REACT_APP_GHN_TOKEN || '',
    apiUrl: process.env.REACT_APP_GHN_API_URL || 'https://dev-online-gateway.ghn.vn/shiip/public-api',
    shopId: process.env.REACT_APP_GHN_SHOP_ID || '',
    environment: (process.env.REACT_APP_GHN_ENV as 'sandbox' | 'production') || 'sandbox'
  },
  viettelpost: {
    enabled: true,
    token: process.env.REACT_APP_VIETTEL_TOKEN || '',
    apiUrl: process.env.REACT_APP_VIETTEL_API_URL || 'https://api.viettelpost.vn/api',
    customerCode: process.env.REACT_APP_VIETTEL_CUSTOMER_CODE || '',
    environment: (process.env.REACT_APP_VIETTEL_ENV as 'sandbox' | 'production') || 'sandbox'
  },
  ghtk: {
    enabled: false,
    token: process.env.REACT_APP_GHTK_TOKEN || '',
    apiUrl: process.env.REACT_APP_GHTK_API_URL || 'https://services.giaohangtietkiem.vn/services',
    shopId: process.env.REACT_APP_GHTK_SHOP_ID || '',
    environment: (process.env.REACT_APP_GHTK_ENV as 'sandbox' | 'production') || 'sandbox'
  },
  email: {
    enabled: true,
    provider: (process.env.REACT_APP_EMAIL_PROVIDER as 'sendgrid' | 'ses' | 'smtp') || 'smtp',
    apiKey: process.env.REACT_APP_EMAIL_API_KEY || '',
    fromEmail: process.env.REACT_APP_EMAIL_FROM || 'noreply@acf.com',
    fromName: process.env.REACT_APP_EMAIL_FROM_NAME || 'ACF Mall',
    smtp: {
      host: process.env.REACT_APP_SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.REACT_APP_SMTP_PORT || '587'),
      secure: process.env.REACT_APP_SMTP_SECURE === 'true',
      auth: {
        user: process.env.REACT_APP_SMTP_USER || '',
        pass: process.env.REACT_APP_SMTP_PASS || ''
      }
    }
  },
  sms: {
    enabled: false,
    provider: (process.env.REACT_APP_SMS_PROVIDER as 'twilio' | 'viettel' | 'vinaphone') || 'viettel',
    apiKey: process.env.REACT_APP_SMS_API_KEY || '',
    apiSecret: process.env.REACT_APP_SMS_API_SECRET || '',
    fromNumber: process.env.REACT_APP_SMS_FROM_NUMBER || ''
  },
  storage: {
    enabled: true,
    provider: (process.env.REACT_APP_STORAGE_PROVIDER as 'aws-s3' | 'google-cloud' | 'azure' | 'local') || 'local',
    bucket: process.env.REACT_APP_STORAGE_BUCKET || '',
    region: process.env.REACT_APP_STORAGE_REGION || '',
    accessKey: process.env.REACT_APP_STORAGE_ACCESS_KEY || '',
    secretKey: process.env.REACT_APP_STORAGE_SECRET_KEY || '',
    endpoint: process.env.REACT_APP_STORAGE_ENDPOINT || ''
  }
};

// Integration validation
export const validateIntegrationConfig = (config: IntegrationConfig): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Validate VNPAY
  if (config.vnpay.enabled) {
    if (!config.vnpay.tmnCode) errors.push('VNPAY: TMN Code is required');
    if (!config.vnpay.secretKey) errors.push('VNPAY: Secret Key is required');
    if (!config.vnpay.paymentUrl) errors.push('VNPAY: Payment URL is required');
    if (!config.vnpay.returnUrl) errors.push('VNPAY: Return URL is required');
    if (!config.vnpay.notifyUrl) errors.push('VNPAY: Notify URL is required');
  }

  // Validate MoMo
  if (config.momo.enabled) {
    if (!config.momo.partnerCode) errors.push('MoMo: Partner Code is required');
    if (!config.momo.accessKey) errors.push('MoMo: Access Key is required');
    if (!config.momo.secretKey) errors.push('MoMo: Secret Key is required');
    if (!config.momo.paymentUrl) errors.push('MoMo: Payment URL is required');
    if (!config.momo.returnUrl) errors.push('MoMo: Return URL is required');
    if (!config.momo.notifyUrl) errors.push('MoMo: Notify URL is required');
  }

  // Validate ZaloPay
  if (config.zalopay.enabled) {
    if (!config.zalopay.appId) errors.push('ZaloPay: App ID is required');
    if (!config.zalopay.key1) errors.push('ZaloPay: Key1 is required');
    if (!config.zalopay.key2) errors.push('ZaloPay: Key2 is required');
    if (!config.zalopay.paymentUrl) errors.push('ZaloPay: Payment URL is required');
    if (!config.zalopay.returnUrl) errors.push('ZaloPay: Return URL is required');
  }

  // Validate GHN
  if (config.ghn.enabled) {
    if (!config.ghn.token) errors.push('GHN: Token is required');
    if (!config.ghn.apiUrl) errors.push('GHN: API URL is required');
    if (!config.ghn.shopId) errors.push('GHN: Shop ID is required');
  }

  // Validate Viettel Post
  if (config.viettelpost.enabled) {
    if (!config.viettelpost.token) errors.push('Viettel Post: Token is required');
    if (!config.viettelpost.apiUrl) errors.push('Viettel Post: API URL is required');
    if (!config.viettelpost.customerCode) errors.push('Viettel Post: Customer Code is required');
  }

  // Validate Email
  if (config.email.enabled) {
    if (!config.email.fromEmail) errors.push('Email: From Email is required');
    if (!config.email.fromName) errors.push('Email: From Name is required');
    
    if (config.email.provider === 'smtp') {
      if (!config.email.smtp?.host) errors.push('Email SMTP: Host is required');
      if (!config.email.smtp?.auth.user) errors.push('Email SMTP: User is required');
      if (!config.email.smtp?.auth.pass) errors.push('Email SMTP: Password is required');
    } else {
      if (!config.email.apiKey) errors.push('Email: API Key is required');
    }
  }

  // Validate SMS
  if (config.sms.enabled) {
    if (!config.sms.apiKey) errors.push('SMS: API Key is required');
    if (!config.sms.apiSecret) errors.push('SMS: API Secret is required');
    if (config.sms.provider === 'twilio' && !config.sms.fromNumber) {
      errors.push('SMS Twilio: From Number is required');
    }
  }

  // Validate Storage
  if (config.storage.enabled) {
    if (config.storage.provider !== 'local') {
      if (!config.storage.bucket) errors.push('Storage: Bucket is required');
      if (!config.storage.accessKey) errors.push('Storage: Access Key is required');
      if (!config.storage.secretKey) errors.push('Storage: Secret Key is required');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Integration status checker
export const checkIntegrationStatus = async (config: IntegrationConfig): Promise<{
  vnpay: boolean;
  momo: boolean;
  zalopay: boolean;
  ghn: boolean;
  viettelpost: boolean;
  ghtk: boolean;
  email: boolean;
  sms: boolean;
  storage: boolean;
}> => {
  const status = {
    vnpay: false,
    momo: false,
    zalopay: false,
    ghn: false,
    viettelpost: false,
    ghtk: false,
    email: false,
    sms: false,
    storage: false
  };

  try {
    // Check VNPAY
    if (config.vnpay.enabled) {
      // Mock API call to check VNPAY status
      status.vnpay = true;
    }

    // Check MoMo
    if (config.momo.enabled) {
      // Mock API call to check MoMo status
      status.momo = true;
    }

    // Check ZaloPay
    if (config.zalopay.enabled) {
      // Mock API call to check ZaloPay status
      status.zalopay = true;
    }

    // Check GHN
    if (config.ghn.enabled) {
      // Mock API call to check GHN status
      status.ghn = true;
    }

    // Check Viettel Post
    if (config.viettelpost.enabled) {
      // Mock API call to check Viettel Post status
      status.viettelpost = true;
    }

    // Check GHTK
    if (config.ghtk.enabled) {
      // Mock API call to check GHTK status
      status.ghtk = true;
    }

    // Check Email
    if (config.email.enabled) {
      // Mock API call to check email service status
      status.email = true;
    }

    // Check SMS
    if (config.sms.enabled) {
      // Mock API call to check SMS service status
      status.sms = true;
    }

    // Check Storage
    if (config.storage.enabled) {
      // Mock API call to check storage service status
      status.storage = true;
    }
  } catch (error) {
    console.error('Error checking integration status:', error);
  }

  return status;
};

// Integration helper functions
export const getPaymentMethods = (config: IntegrationConfig) => {
  const methods = [];

  if (config.vnpay.enabled) {
    methods.push({
      id: 'vnpay',
      name: 'VNPAY',
      type: 'ewallet',
      logo: '/logos/vnpay.png',
      config: config.vnpay
    });
  }

  if (config.momo.enabled) {
    methods.push({
      id: 'momo',
      name: 'MoMo',
      type: 'ewallet',
      logo: '/logos/momo.png',
      config: config.momo
    });
  }

  if (config.zalopay.enabled) {
    methods.push({
      id: 'zalopay',
      name: 'ZaloPay',
      type: 'ewallet',
      logo: '/logos/zalopay.png',
      config: config.zalopay
    });
  }

  return methods;
};

export const getShippingProviders = (config: IntegrationConfig) => {
  const providers = [];

  if (config.ghn.enabled) {
    providers.push({
      id: 'ghn',
      name: 'Giao Hàng Nhanh',
      logo: '/logos/ghn.png',
      config: config.ghn
    });
  }

  if (config.viettelpost.enabled) {
    providers.push({
      id: 'viettelpost',
      name: 'Viettel Post',
      logo: '/logos/viettel.png',
      config: config.viettelpost
    });
  }

  if (config.ghtk.enabled) {
    providers.push({
      id: 'ghtk',
      name: 'Giao Hàng Tiết Kiệm',
      logo: '/logos/ghtk.png',
      config: config.ghtk
    });
  }

  return providers;
};

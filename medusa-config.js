const { defineConfig } = require("@medusajs/utils")
const { Modules } = require("@medusajs/utils")

// Environment variables
const DATABASE_URL = process.env.DATABASE_URL || "postgres://localhost/acf_ecommerce"
const JWT_SECRET = process.env.JWT_SECRET || "supersecretstring"
const COOKIE_SECRET = process.env.COOKIE_SECRET || "supercookieecretstring"

module.exports = defineConfig({
  admin: {
    // Admin panel configuration
    cors: [
      "http://localhost:3000", 
      "http://localhost:3001", 
      "http://localhost:7000",
      "https://acf.vn",
      "https://seller.acf.vn",
      "https://admin.acf.vn"
    ],
  },
  projectConfig: {
    // Database configuration
    databaseUrl: DATABASE_URL,
    databaseType: "postgres",
    
    // HTTP configuration
    http: {
      jwtSecret: JWT_SECRET,
      cookieSecret: COOKIE_SECRET,
    },
  },
  
  // Feature flags
  featureFlags: {
    // Enable all features for now
  },

  // Modules configuration
  modules: [
    // Authentication module with VNeID provider
    {
      key: "auth",
      resolve: "@medusajs/auth",
      options: {
        providers: [
          {
            id: "vneid",
            resolve: "./modules/vneid-auth", // Custom VNeID authentication provider
          },
          {
            id: "emailpass",
            resolve: "@medusajs/auth-emailpass",
          },
          {
            id: "google",
            resolve: "@medusajs/auth-google",
          },
        ],
      },
    },
    
    // User management
    {
      key: Modules.USER,
      scope: "internal",
      resolve: "@medusajs/user",
      options: {
        jwt_secret: JWT_SECRET,
      },
    },
    
    // RBAC (Role-Based Access Control) for managing permissions
    {
      key: Modules.RBAC,
      resolve: "@medusajs/rbac",
    },
    
    // Cache module
    {
      key: Modules.CACHE,
      resolve: process.env.REDIS_URL ? "@medusajs/cache-redis" : "@medusajs/cache-inmemory",
      options: process.env.REDIS_URL ? { 
        redis_url: process.env.REDIS_URL 
      } : { 
        ttl: 300 // 5 minutes default TTL
      },
    },
    
    // Product module
    {
      key: Modules.PRODUCT,
      resolve: "@medusajs/product",
    },
    
    // Inventory module
    {
      key: Modules.INVENTORY,
      resolve: "@medusajs/inventory",
    },
    
    // Stock location module
    {
      key: Modules.STOCK_LOCATION,
      resolve: "@medusajs/stock-location",
    },
    
    // Pricing module
    {
      key: Modules.PRICING,
      resolve: "@medusajs/pricing",
    },
    
    // Promotion module
    {
      key: Modules.PROMOTION,
      resolve: "@medusajs/promotion",
    },
    
    // Region module
    {
      key: Modules.REGION,
      resolve: "@medusajs/region",
    },
    
    // Customer module
    {
      key: Modules.CUSTOMER,
      resolve: "@medusajs/customer",
    },
    
    // Sales channel module
    {
      key: Modules.SALES_CHANNEL,
      resolve: "@medusajs/sales-channel",
    },
    
    // Cart module
    {
      key: Modules.CART,
      resolve: "@medusajs/cart",
    },
    
    // Order module
    {
      key: Modules.ORDER,
      resolve: "@medusajs/order",
    },
    
    // Payment module with multiple providers
    {
      key: Modules.PAYMENT,
      resolve: "@medusajs/payment",
      options: {
        providers: [
          {
            resolve: "@medusajs/payment-stripe",
            id: "stripe",
          },
          {
            resolve: "./modules/vnpay", // Custom VNPay provider
            id: "vnpay",
          },
          {
            resolve: "./modules/momo", // Custom MoMo provider
            id: "momo",
          },
          {
            resolve: "./modules/zalopay", // Custom ZaloPay provider
            id: "zalopay",
          },
        ],
      },
    },
    
    // Fulfillment module
    {
      key: Modules.FULFILLMENT,
      resolve: "@medusajs/fulfillment",
      options: {
        providers: [
          {
            resolve: "@medusajs/fulfillment-manual",
            id: "manual",
          },
          {
            resolve: "./modules/ghn", // Custom GHN provider
            id: "ghn",
          },
          {
            resolve: "./modules/viettelpost", // Custom Viettel Post provider
            id: "viettelpost",
          },
        ],
      },
    },
    
    // Tax module
    {
      key: Modules.TAX,
      resolve: "@medusajs/tax",
    },
    
    // Currency module
    {
      key: Modules.CURRENCY,
      resolve: "@medusajs/currency",
    },
    
    // Notification module
    {
      key: Modules.NOTIFICATION,
      resolve: "@medusajs/notification",
      options: {
        providers: [
          {
            resolve: "@medusajs/notification-local",
            id: "local",
          },
          {
            resolve: "@medusajs/notification-sendgrid",
            id: "sendgrid",
          },
        ],
      },
    },
    
    // API key module
    {
      key: Modules.API_KEY,
      resolve: "@medusajs/api-key",
    },
    
    // Store module
    {
      key: Modules.STORE,
      resolve: "@medusajs/store",
    },
    
    // Workflow engine
    {
      key: Modules.WORKFLOW_ENGINE,
      resolve: process.env.USE_REDIS_WORKFLOWS ? "@medusajs/workflow-engine-redis" : "@medusajs/workflow-engine-inmemory",
      options: process.env.USE_REDIS_WORKFLOWS ? {
        redis: {
          url: process.env.REDIS_URL
        }
      } : {}
    },
    
    // Index module for search
    {
      key: Modules.INDEX,
      resolve: "@medusajs/index",
    },
    
    // Anti-counterfeit module (custom)
    {
      key: "anti-counterfeit",
      resolve: "./modules/anti-counterfeit",
    },
    
    // Escrow module (custom)
    {
      key: "escrow",
      resolve: "./modules/escrow",
    },
  ],

  // Plugins
  plugins: [
    // Analytics plugin
    {
      resolve: "@medusajs/analytics",
      options: {
        posthogApiKey: process.env.POSTHOG_API_KEY,
        posthogHost: process.env.POSTHOG_HOST || "https://app.posthog.com",
      },
    },
  ],
})
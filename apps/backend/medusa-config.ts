import { loadEnv, defineConfig } from "@medusajs/framework/utils"

loadEnv(process.env.NODE_ENV || "development", process.cwd())

export default defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
  },
  admin: {
    backendUrl: process.env.MEDUSA_BACKEND_URL || "http://localhost:9000",
  },
  modules: [
    // File / storage
    {
      resolve: "@medusajs/file",
      options: {
        providers: [
          {
            resolve: "@medusajs/file-local",
            id: "local",
            options: { upload_dir: "static", backend_url: `${process.env.MEDUSA_BACKEND_URL}/static` },
          },
        ],
      },
    },
    // Cache (Redis if available, else in-memory)
    ...(process.env.REDIS_URL
      ? [
          {
            resolve: "@medusajs/cache-redis",
            options: { redisUrl: process.env.REDIS_URL },
          },
          {
            resolve: "@medusajs/event-bus-redis",
            options: { redisUrl: process.env.REDIS_URL },
          },
          {
            resolve: "@medusajs/workflow-engine-redis",
            options: {
              redis: { url: process.env.REDIS_URL },
            },
          },
        ]
      : []),
    // Notification (console for dev)
    {
      resolve: "@medusajs/notification",
      options: {
        providers: [
          {
            resolve: "@medusajs/notification-local",
            id: "local",
            options: {
              name: "Local Notification",
              channels: ["feed"],
            },
          },
        ],
      },
    },
    // Shipping module
    {
      resolve: "./modules/shipping-module",
      options: {},
    },
    // Payment module. Vietnam gateway redirects are created by secure
    // backend routes under /store/payment/* so secrets never reach the browser.
    {
      resolve: "@medusajs/payment",
      options: {
        providers: [
          {
            resolve: "@medusajs/payment-stripe",
            id: "stripe",
            options: {
              apiKey: process.env.STRIPE_API_KEY,
            },
          },
        ],
      },
    },
  ],
})

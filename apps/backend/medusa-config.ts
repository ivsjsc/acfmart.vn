import { defineConfig, loadEnv, Modules } from "@medusajs/framework/utils"

loadEnv(process.env.NODE_ENV || "development", process.cwd())

const backendUrl = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"

export default defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS || "http://localhost:3000,http://localhost:4173",
      adminCors: process.env.ADMIN_CORS || "http://localhost:7000,http://localhost:7001",
      authCors: process.env.AUTH_CORS || "http://localhost:7000,http://localhost:7001",
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
  },
  admin: {
    backendUrl,
    disable: process.env.MEDUSA_ADMIN_DISABLED !== "false",
  },
  modules: [
    {
      resolve: "@medusajs/file",
      options: {
        providers: [
          {
            resolve: "@medusajs/file-local",
            id: "local",
            options: {
              upload_dir: "static",
              backend_url: `${backendUrl}/static`,
            },
          },
        ],
      },
    },
    ...(process.env.REDIS_URL
      ? [
          {
            key: Modules.EVENT_BUS,
            resolve: "@medusajs/event-bus-redis",
            options: { redisUrl: process.env.REDIS_URL },
          },
          {
            key: Modules.WORKFLOW_ENGINE,
            resolve: "@medusajs/workflow-engine-redis",
            options: {
              redis: { url: process.env.REDIS_URL },
            },
          },
        ]
      : []),
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
    {
      resolve: "@medusajs/payment",
      options: {
        providers: [
          ...(process.env.STRIPE_API_KEY
            ? [
                {
                  resolve: "@medusajs/payment-stripe",
                  id: "stripe",
                  options: {
                    apiKey: process.env.STRIPE_API_KEY,
                  },
                },
              ]
            : []),
        ],
      },
    },
  ],
})

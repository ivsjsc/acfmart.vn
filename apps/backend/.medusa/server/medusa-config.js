"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
(0, utils_1.loadEnv)(process.env.NODE_ENV || "development", process.cwd());
const backendUrl = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000";
exports.default = (0, utils_1.defineConfig)({
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
                    key: utils_1.Modules.EVENT_BUS,
                    resolve: "@medusajs/event-bus-redis",
                    options: { redisUrl: process.env.REDIS_URL },
                },
                {
                    key: utils_1.Modules.WORKFLOW_ENGINE,
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
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVkdXNhLWNvbmZpZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL21lZHVzYS1jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxREFBMEU7QUFFMUUsSUFBQSxlQUFPLEVBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLElBQUksYUFBYSxFQUFFLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFBO0FBRTdELE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQWtCLElBQUksdUJBQXVCLENBQUE7QUFFNUUsa0JBQWUsSUFBQSxvQkFBWSxFQUFDO0lBQzFCLGFBQWEsRUFBRTtRQUNiLFdBQVcsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVk7UUFDckMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUztRQUMvQixJQUFJLEVBQUU7WUFDSixTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLElBQUksNkNBQTZDO1lBQ2xGLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsSUFBSSw2Q0FBNkM7WUFDbEYsUUFBUSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxJQUFJLDZDQUE2QztZQUNoRixTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLElBQUksYUFBYTtZQUNsRCxZQUFZLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLElBQUksYUFBYTtTQUN6RDtLQUNGO0lBQ0QsS0FBSyxFQUFFO1FBQ0wsVUFBVTtRQUNWLE9BQU8sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLHFCQUFxQixLQUFLLE9BQU87S0FDdkQ7SUFDRCxPQUFPLEVBQUU7UUFDUDtZQUNFLE9BQU8sRUFBRSxnQkFBZ0I7WUFDekIsT0FBTyxFQUFFO2dCQUNQLFNBQVMsRUFBRTtvQkFDVDt3QkFDRSxPQUFPLEVBQUUsc0JBQXNCO3dCQUMvQixFQUFFLEVBQUUsT0FBTzt3QkFDWCxPQUFPLEVBQUU7NEJBQ1AsVUFBVSxFQUFFLFFBQVE7NEJBQ3BCLFdBQVcsRUFBRSxHQUFHLFVBQVUsU0FBUzt5QkFDcEM7cUJBQ0Y7aUJBQ0Y7YUFDRjtTQUNGO1FBQ0QsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUztZQUN2QixDQUFDLENBQUM7Z0JBQ0U7b0JBQ0UsR0FBRyxFQUFFLGVBQU8sQ0FBQyxTQUFTO29CQUN0QixPQUFPLEVBQUUsMkJBQTJCO29CQUNwQyxPQUFPLEVBQUUsRUFBRSxRQUFRLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUU7aUJBQzdDO2dCQUNEO29CQUNFLEdBQUcsRUFBRSxlQUFPLENBQUMsZUFBZTtvQkFDNUIsT0FBTyxFQUFFLGlDQUFpQztvQkFDMUMsT0FBTyxFQUFFO3dCQUNQLEtBQUssRUFBRSxFQUFFLEdBQUcsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRTtxQkFDdEM7aUJBQ0Y7YUFDRjtZQUNILENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDUDtZQUNFLE9BQU8sRUFBRSx3QkFBd0I7WUFDakMsT0FBTyxFQUFFO2dCQUNQLFNBQVMsRUFBRTtvQkFDVDt3QkFDRSxPQUFPLEVBQUUsOEJBQThCO3dCQUN2QyxFQUFFLEVBQUUsT0FBTzt3QkFDWCxPQUFPLEVBQUU7NEJBQ1AsSUFBSSxFQUFFLG9CQUFvQjs0QkFDMUIsUUFBUSxFQUFFLENBQUMsTUFBTSxDQUFDO3lCQUNuQjtxQkFDRjtpQkFDRjthQUNGO1NBQ0Y7UUFDRDtZQUNFLE9BQU8sRUFBRSxtQkFBbUI7WUFDNUIsT0FBTyxFQUFFO2dCQUNQLFNBQVMsRUFBRTtvQkFDVCxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjO3dCQUM1QixDQUFDLENBQUM7NEJBQ0U7Z0NBQ0UsT0FBTyxFQUFFLDBCQUEwQjtnQ0FDbkMsRUFBRSxFQUFFLFFBQVE7Z0NBQ1osT0FBTyxFQUFFO29DQUNQLE1BQU0sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWM7aUNBQ25DOzZCQUNGO3lCQUNGO3dCQUNILENBQUMsQ0FBQyxFQUFFLENBQUM7aUJBQ1I7YUFDRjtTQUNGO0tBQ0Y7Q0FDRixDQUFDLENBQUEifQ==
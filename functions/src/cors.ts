// Define CORS options
export const corsOptions = {
  origin: [
    "http://localhost:5173",           // Vite default dev server
    "http://localhost:3000",           // Common React dev server
    "https://acfmart.web.app",         // Primary Firebase hosting domain
    "https://acfmart.online",          // Production domain from error logs
    "https://qr-ivs.web.app",         // IVS QR Guard app
    "https://qr-ivs.firebaseapp.com", // IVS QR Guard legacy domain
    "https://*.web.app",               // Wildcard for Firebase hosting staging
    "https://*.firebaseapp.com",       // Legacy Firebase hosting
  ],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,                   // Allow cookies/auth headers
  optionsSuccessStatus: 200,          // Set OPTIONS success status
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
    "Access-Control-Request-Method",
    "Access-Control-Request-Headers"
  ],
  exposedHeaders: [
    "Access-Control-Allow-Origin",
    "Access-Control-Allow-Credentials"
  ]
};
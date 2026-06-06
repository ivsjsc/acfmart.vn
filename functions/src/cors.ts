// Define CORS options
export const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://acfmart.vn",
    "https://www.acfmart.vn",
    "https://acfmart.store",
    "https://www.acfmart.store",
    "https://acfmart.online",
    "https://www.acfmart.online",
    "https://acfmart.cloud",
    "https://www.acfmart.cloud",
    "https://qr.acfmart.vn",
    "https://api.acfmart.vn",
    "https://acfmart.web.app",
    "https://acfmart.firebaseapp.com",
    "https://acfmartstore.web.app",
    "https://acfmartstore.firebaseapp.com",
    "https://acfmartonline.web.app",
    "https://acfmartonline.firebaseapp.com",
    "https://acfmartcloud.web.app",
    "https://acfmartcloud.firebaseapp.com",
    "https://qr-ivs.web.app",
    "https://qr-ivs.firebaseapp.com",
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
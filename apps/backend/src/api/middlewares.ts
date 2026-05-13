import { defineMiddlewares } from "@medusajs/framework/http"
import {
  requireFirebaseAuth,
  optionalFirebaseAuth,
} from "./middlewares/firebase-auth"

export default defineMiddlewares({
  routes: [
    { matcher: "/store/vendors/me", middlewares: [optionalFirebaseAuth] },
    { matcher: "/store/vendors/register", middlewares: [requireFirebaseAuth] },
    {
      matcher: "/store/affiliate/*",
      method: ["GET", "POST", "PUT", "DELETE"],
      middlewares: [requireFirebaseAuth],
    },
    {
      matcher: "/store/loyalty/*",
      method: ["GET", "POST"],
      middlewares: [requireFirebaseAuth],
    },
    { matcher: "/store/qr-verify/*", middlewares: [optionalFirebaseAuth] },
    {
      matcher: "/store/counterfeit-reports",
      method: ["POST"],
      middlewares: [requireFirebaseAuth],
    },
    {
      matcher: "/store/live-streams/schedule",
      method: ["POST"],
      middlewares: [requireFirebaseAuth],
    },
  ],
})

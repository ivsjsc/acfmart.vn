import { RouterProvider } from "react-router-dom"
import { QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "react-hot-toast"
import { router } from "./routes"
import { queryClient } from "./lib/query-client"
import { useAuthSubscription } from "./hooks/use-auth"

export default function App() {
  // Keep Zustand auth store in sync with Firebase auth state across reloads
  useAuthSubscription()

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#171717",
            color: "#fff",
            fontSize: "14px",
            fontFamily: "Be Vietnam Pro, system-ui, sans-serif",
          },
        }}
      />
    </QueryClientProvider>
  )
}

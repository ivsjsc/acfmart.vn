import { Suspense } from "react"
import { Outlet, ScrollRestoration } from "react-router-dom"
import { Loader2 } from "lucide-react"
import { Header } from "./Header"
import { Footer } from "./Footer"
import { BottomNav } from "./BottomNav"
import { AivyFloatingButton } from "../features/aivy"
import { DomainRedirect } from "../components/DomainRedirect"

function RouteFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="animate-spin text-brand-red-500" size={28} />
    </div>
  )
}

export function MainLayout() {
  return (
    <DomainRedirect>
      <div className="flex min-h-screen flex-col bg-neutral-50">
        <Header />
        <main className="flex-1 pb-20 lg:pb-0">
          <Suspense fallback={<RouteFallback />}>
            <Outlet />
          </Suspense>
        </main>
        <Footer />
        <BottomNav />
        <AivyFloatingButton />
        <ScrollRestoration />
      </div>
    </DomainRedirect>
  )
}
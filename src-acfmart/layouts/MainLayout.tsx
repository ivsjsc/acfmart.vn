import { Outlet, ScrollRestoration } from "react-router-dom"
import { Header } from "./Header"
import { Footer } from "./Footer"
import { BottomNav } from "./BottomNav"
import { AivyFloatingButton } from "../features/aivy"

export function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <Header />
      <main className="flex-1 pb-20 lg:pb-0">
        <Outlet />
      </main>
      <Footer />
      <BottomNav />
      <AivyFloatingButton />
      <ScrollRestoration />
    </div>
  )
}

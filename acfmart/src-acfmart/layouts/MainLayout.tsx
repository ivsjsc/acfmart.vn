export function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <Header />
      <main className="flex-1 pb-24 lg:pb-0"> {/* 增加 padding-bottom 到 24 */}
        <Outlet />
      </main>
      <Footer />
      <BottomNav />
      <AivyFloatingButton />
      <ScrollRestoration />
    </div>
  )
}
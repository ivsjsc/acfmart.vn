export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white">
      <div className="container-acf flex items-center justify-between px-4 py-3 md:px-6">
        <Link to="/" className="flex items-center gap-2">
          {/* 添加主Logo */}
          <img src="/logo.png" alt="ACFMart" className="h-10 w-10" />
          <span className="text-xl font-bold text-brand-red-600">ACFMart</span>
        </Link>
      </div>
    </header>
  )
}
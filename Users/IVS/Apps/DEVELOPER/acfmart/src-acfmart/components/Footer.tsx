export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="container-acf py-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            {/* 添加主Logo */}
            <img src="/logo.png" alt="ACFMart" className="h-10 w-10" />
            <span className="text-lg font-bold text-brand-red-600">ACFMart</span>
          </div>
          <div className="text-center text-sm text-neutral-600">
            <p>Bảo mật bởi IVS & Quỹ Chống Hàng Giả VN</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
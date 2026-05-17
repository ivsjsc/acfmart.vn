import { useState } from "react"
import { Loader2, Plus } from "lucide-react"
import toast from "react-hot-toast"

const AffiliateShowcase = () => {
  const [link, setLink] = useState("")
  const [loading, setLoading] = useState(false)

  const handlePasteLink = async () => {
    if (!link.trim()) return
    setLoading(true)
    try {
      const res = await fetch("/api/affiliate/showcase/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: link }),
      })
      if (res.ok) {
        toast.success("Đã thêm link thành công")
        setLink("")
      } else {
        toast.error("Link không hợp lệ hoặc không phải từ shop chính hãng")
      }
    } catch (err) {
      console.error(err)
      toast.error("Lỗi khi thêm link")
    } finally {
      setLoading(false)
    }
  }

  const examples = [
    { name: "Áo sơ mi nam", category: "Thời trang nam", link: "https://acfmart.vn/p/abc123" },
    { name: "Giày thể thao", category: "Giày dép", link: "https://acfmart.vn/p/def456" },
  ]

  return (
    <section className="card p-5">
      <h2 className="mb-3 text-base font-bold text-neutral-900">Trang trưng bày</h2>
      <div className="flex gap-2">
        <input
          className="input"
          placeholder="Dán link sản phẩm từ shop chính hãng"
          value={link}
          onChange={(e) => setLink(e.target.value)}
        />
        <button
          type="button"
          onClick={handlePasteLink}
          disabled={loading || !link.trim()}
          className="btn-primary shrink-0"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          Thêm
        </button>
      </div>

      <div className="mt-4 divide-y divide-neutral-100 rounded-lg border border-neutral-100">
        {examples.map((item) => (
          <div key={item.link} className="flex items-center justify-between gap-3 p-3">
            <div>
              <div className="text-sm font-semibold text-neutral-900">{item.name}</div>
              <span className="mt-1 inline-flex rounded bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                {item.category}
              </span>
            </div>
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-brand-red-600 hover:underline"
            >
              Xem sản phẩm
            </a>
          </div>
        ))}
      </div>
    </section>
  )
}

export default AffiliateShowcase

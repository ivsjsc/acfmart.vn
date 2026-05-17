import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import {
  Play,
  Pause,
  Volume2,
  MessageCircle,
  Heart,
  Share2,
  ShoppingBag,
  ShieldCheck,
  Eye,
  Send,
  X,
} from "lucide-react"
import { cn } from "../../../lib/cn"
import { formatCurrency } from "../../../lib/format"
import { useLiveStream } from "../../../hooks/use-live-stream"
import toast from "react-hot-toast"

type ChatMessage = {
  id: string
  userId: string
  userName: string
  avatar?: string
  content: string
  timestamp: number
  isSeller?: boolean
}

type LiveProduct = {
  id: string
  name: string
  price: number
  originalPrice?: number
  thumbnail: string
  stock: number
  soldCount: number
  badge?: string
}

export default function LiveStreamRoomScreen() {
  const { id } = useParams<{ id: string }>()
  const [isMuted, setIsMuted] = useState(false)
  const [isPlaying, setIsPlaying] = useState(true)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState("")
  const [liked, setLiked] = useState(false)
  const [viewerCount, setViewerCount] = useState(0)
  const [showProductList, setShowProductList] = useState(false)

  const { stream, loading, error, joinStream, leaveStream, sendMessage } = useLiveStream(id || "")

  const mockProducts: LiveProduct[] = [
    {
      id: "prod-lip-spf",
      name: "Son dưỡng SPF 15 có tem QR",
      price: 159000,
      originalPrice: 299000,
      thumbnail: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=200&q=80",
      stock: 150,
      soldCount: 847,
      badge: "Đã xác thực QR",
    },
    {
      id: "prod-serum-vit-c",
      name: "Serum Vitamin C 20% chính hãng",
      price: 450000,
      originalPrice: 680000,
      thumbnail: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=200&q=80",
      stock: 89,
      soldCount: 523,
      badge: "Shop tin cậy",
    },
    {
      id: "prod-sunscreen",
      name: "Kem chống nắng SPF 50+ PA++++",
      price: 320000,
      originalPrice: 450000,
      thumbnail: "https://images.unsplash.com/photo-1556228720-1957be83f3bf?auto=format&fit=crop&w=200&q=80",
      stock: 200,
      soldCount: 1205,
      badge: "Best seller",
    },
  ]

  const mockComments: ChatMessage[] = [
    {
      id: "1",
      userId: "u1",
      userName: "Minh Anh",
      content: "Son này dùng tốt không shop?",
      timestamp: Date.now() - 60000,
    },
    {
      id: "2",
      userId: "u2",
      userName: "Hoa Nguyễn",
      content: "Check tem QR ở đâu vậy?",
      timestamp: Date.now() - 45000,
    },
    {
      id: "3",
      userId: "seller",
      userName: "Natural Beauty Official",
      content: "Dạ tem QR ở mặt sau sản phẩm ạ, quét ra trang xác thực của ACFMart luôn nè",
      timestamp: Date.now() - 30000,
      isSeller: true,
    },
  ]

  useEffect(() => {
    if (id) {
      joinStream()
      setChatMessages(mockComments)
      setViewerCount(Math.floor(Math.random() * 2000) + 500)
    }

    return () => {
      leaveStream()
    }
  }, [id])

  useEffect(() => {
    // Simulate viewer count fluctuation
    const interval = setInterval(() => {
      setViewerCount(prev => prev + Math.floor(Math.random() * 21) - 10)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleSendChat = () => {
    if (!chatInput.trim()) return
    
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      userId: "current-user",
      userName: "Bạn",
      content: chatInput.trim(),
      timestamp: Date.now(),
    }
    
    setChatMessages(prev => [...prev, newMessage])
    sendMessage(chatInput.trim())
    setChatInput("")
  }

  const handleLike = () => {
    setLiked(!liked)
    toast.success(liked ? "Bỏ thích livestream" : "Đã thích livestream")
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success("Đã sao chép liên kết livestream!")
  }

  const handleAddToCart = (product: LiveProduct) => {
    toast.success(`Đã thêm "${product.name}" vào giỏ hàng`)
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-900">
        <div className="text-center text-white">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-brand-red-500 border-t-transparent" />
          <p className="text-lg font-semibold">Đang tải phòng livestream...</p>
        </div>
      </div>
    )
  }

  if (error || !stream) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-900">
        <div className="max-w-md rounded-2xl border border-dashed border-neutral-700 bg-neutral-800 p-8 text-center">
          <h1 className="text-2xl font-bold text-white">Không tìm thấy livestream</h1>
          <p className="mt-2 text-sm text-neutral-400">
            Phiên livestream này đã kết thúc hoặc không tồn tại
          </p>
          <Link to="/live" className="btn-primary mt-6 inline-flex">
            Về danh sách live
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex h-screen bg-neutral-900">
      {/* Video Player */}
      <div className="absolute inset-0">
        <video
          src={stream.videoUrl || "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"}
          className="h-full w-full object-cover"
          autoPlay
          playsInline
          muted={isMuted}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
        
        {/* Video Controls Overlay */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="rounded-full bg-white/20 p-3 text-white backdrop-blur hover:bg-white/30"
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </button>
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="rounded-full bg-white/20 p-3 text-white backdrop-blur hover:bg-white/30"
              >
                <Volume2 size={20} />
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded bg-brand-red-600 px-3 py-1 text-xs font-bold text-white">
                <Eye size={14} /> {viewerCount.toLocaleString("vi-VN")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Left Sidebar - Product List */}
      <div className={cn(
        "absolute left-0 top-0 z-10 h-full w-80 transform bg-white transition-transform duration-300 lg:relative lg:transform-none",
        showProductList ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex h-full flex-col">
          <div className="border-b border-neutral-200 p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-neutral-900">Sản phẩm trong live</h2>
              <button
                onClick={() => setShowProductList(false)}
                className="lg:hidden rounded p-1 text-neutral-500 hover:bg-neutral-100"
              >
                <X size={20} />
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            {mockProducts.map((product) => (
              <div
                key={product.id}
                className="mb-4 overflow-hidden rounded-lg border border-neutral-200 bg-white transition hover:border-brand-red-300"
              >
                <div className="relative">
                  <img
                    src={product.thumbnail}
                    alt={product.name}
                    className="h-32 w-full object-cover"
                  />
                  {product.badge && (
                    <span className="absolute left-2 top-2 rounded bg-brand-gold-500 px-2 py-0.5 text-xs font-bold text-white">
                      {product.badge}
                    </span>
                  )}
                  {product.originalPrice && (
                    <span className="absolute right-2 top-2 rounded bg-brand-red-600 px-2 py-0.5 text-xs font-bold text-white">
                      -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="line-clamp-2 text-sm font-semibold text-neutral-900">
                    {product.name}
                  </h3>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-lg font-extrabold text-brand-red-600">
                      {formatCurrency(product.price)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-xs text-neutral-400 line-through">
                        {formatCurrency(product.originalPrice)}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-neutral-500">
                    <span>Đã bán: {product.soldCount}</span>
                    <span>Còn: {product.stock}</span>
                  </div>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="btn-primary mt-3 w-full justify-center text-sm"
                  >
                    <ShoppingBag size={16} /> Thêm vào giỏ
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Sidebar - Chat */}
      <div className="absolute right-0 top-0 z-10 hidden h-full w-80 flex-col bg-white lg:flex">
        <div className="border-b border-neutral-200 p-4">
          <h2 className="text-lg font-bold text-neutral-900">Bình luận</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "mb-3 flex gap-2",
                msg.isSeller ? "bg-brand-gold-50 -mx-2 rounded-lg p-2" : ""
              )}
            >
              <div className="h-8 w-8 shrink-0 rounded-full bg-neutral-200" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-xs font-semibold",
                    msg.isSeller ? "text-brand-gold-700" : "text-neutral-700"
                  )}>
                    {msg.userName}
                  </span>
                  {msg.isSeller && (
                    <ShieldCheck size={12} className="text-brand-gold-500" />
                  )}
                </div>
                <p className="text-sm text-neutral-800 break-words">{msg.content}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Chat Input */}
        <div className="border-t border-neutral-200 p-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendChat()}
              placeholder="Nhập bình luận..."
              className="flex-1 rounded-full border border-neutral-300 px-4 py-2 text-sm focus:border-brand-red-500 focus:outline-none focus:ring-1 focus:ring-brand-red-500"
            />
            <button
              onClick={handleSendChat}
              className="rounded-full bg-brand-red-500 p-2 text-white hover:bg-brand-red-600"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Action Buttons (Mobile) */}
      <div className="absolute bottom-20 right-4 z-10 flex flex-col gap-3 lg:hidden">
        <button
          onClick={() => setShowProductList(!showProductList)}
          className="rounded-full bg-white/90 p-3 text-neutral-800 shadow-lg backdrop-blur"
        >
          <ShoppingBag size={20} />
        </button>
        <button
          onClick={handleLike}
          className={cn(
            "rounded-full p-3 shadow-lg backdrop-blur",
            liked ? "bg-pink-500 text-white" : "bg-white/90 text-neutral-800"
          )}
        >
          <Heart size={20} fill={liked ? "currentColor" : "none"} />
        </button>
        <button
          onClick={handleShare}
          className="rounded-full bg-white/90 p-3 text-neutral-800 shadow-lg backdrop-blur"
        >
          <Share2 size={20} />
        </button>
      </div>

      {/* Mobile Chat Toggle */}
      <button
        onClick={() => setShowProductList(!showProductList)}
        className="absolute bottom-4 left-4 z-10 rounded-full bg-brand-red-500 px-4 py-2 text-sm font-bold text-white lg:hidden"
      >
        {showProductList ? "Ẩn sản phẩm" : "Xem sản phẩm"}
      </button>
    </div>
  )
}

import { useEffect, useMemo, useState, type FormEvent } from "react"
import { Link } from "react-router-dom"
import {
  Heart,
  HelpCircle,
  Loader2,
  LogIn,
  MessageCircle,
  PackageSearch,
  Send,
  Share2,
  UserRound,
} from "lucide-react"
import toast from "react-hot-toast"
import { cn } from "../../../lib/cn"
import { formatCurrency, formatRelativeTime } from "../../../lib/format"
import {
  addSocialComment,
  createSocialPost,
  productToSocialSnapshot,
  shareSocialPost,
  subscribeSocialComments,
  subscribeSocialPosts,
  toggleSocialPostLike,
  type SocialComment,
  type SocialPost,
  type SocialPostType,
} from "../../../lib/social-feed-service"
import { useApprovedProducts } from "../../../hooks/use-products"
import { useAuthStore, type User } from "../../../stores/auth-store"
import { PLACEHOLDER_IMAGE } from "../../../lib/constants"

const POST_TYPES: Array<{
  id: SocialPostType
  label: string
  icon: typeof UserRound
}> = [
  { id: "status", label: "Chia sẻ", icon: UserRound },
  { id: "question", label: "Hỏi cộng đồng", icon: HelpCircle },
  { id: "product_share", label: "Chia sẻ sản phẩm", icon: PackageSearch },
]

const TYPE_LABEL: Record<SocialPostType, string> = {
  status: "Chia sẻ cộng đồng",
  question: "Câu hỏi cộng đồng",
  product_share: "Sản phẩm được chia sẻ",
}

export default function SocialFeed() {
  const user = useAuthStore((state) => state.user)
  const [posts, setPosts] = useState<SocialPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [postType, setPostType] = useState<SocialPostType>("status")
  const [content, setContent] = useState("")
  const [selectedProductId, setSelectedProductId] = useState("")
  const { data: products = [], isLoading: productsLoading } = useApprovedProducts({
    limit: 30,
  })

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === selectedProductId) ?? null,
    [products, selectedProductId]
  )

  useEffect(() => {
    setLoading(true)
    return subscribeSocialPosts(
      (nextPosts) => {
        setPosts(nextPosts)
        setLoading(false)
        setError(null)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      }
    )
  }, [])

  async function handleCreatePost(event: FormEvent) {
    event.preventDefault()
    if (!user) {
      toast.error("Vui lòng đăng nhập để đăng bài")
      return
    }
    if (!content.trim()) {
      toast.error("Vui lòng nhập nội dung")
      return
    }
    if (postType === "product_share" && !selectedProduct) {
      toast.error("Vui lòng chọn sản phẩm để chia sẻ")
      return
    }

    setSubmitting(true)
    try {
      await createSocialPost({
        type: postType,
        content,
        product: selectedProduct ? productToSocialSnapshot(selectedProduct) : null,
        user,
      })
      setContent("")
      setSelectedProductId("")
      toast.success("Đã đăng lên bảng tin")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể đăng bài")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleLike(post: SocialPost) {
    if (!user) {
      toast.error("Vui lòng đăng nhập để thích bài viết")
      return
    }
    try {
      await toggleSocialPostLike(post, user.id)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể cập nhật lượt thích")
    }
  }

  async function handleShare(post: SocialPost) {
    const url = `${window.location.origin}/social?post=${post.id}`
    try {
      if (navigator.share) {
        await navigator.share({
          title: "ACFMart Community",
          text: post.content,
          url,
        })
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url)
        toast.success("Đã sao chép liên kết bài viết")
      }
      await shareSocialPost(post.id)
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return
      toast.error("Không thể chia sẻ bài viết")
    }
  }

  return (
    <div className="bg-neutral-50 py-6 lg:py-8">
      <div className="container-acf grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <main className="min-w-0 space-y-5">
          <section className="card p-4 sm:p-5">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-neutral-900">
                  New Feed ACFMart
                </h1>
                <p className="mt-1 text-sm text-neutral-600">
                  Cộng đồng hỏi đáp, chia sẻ trải nghiệm và sản phẩm chính hãng.
                </p>
              </div>
              {!user && (
                <Link to="/login" className="btn-secondary shrink-0 text-xs">
                  <LogIn size={14} /> Đăng nhập
                </Link>
              )}
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {POST_TYPES.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setPostType(type.id)}
                    className={cn(
                      "inline-flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors",
                      postType === type.id
                        ? "border-brand-red-500 bg-brand-red-50 text-brand-red-700"
                        : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300"
                    )}
                  >
                    <type.icon size={16} />
                    {type.label}
                  </button>
                ))}
              </div>

              {postType === "product_share" && (
                <div className="grid gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-3 md:grid-cols-[1fr_220px]">
                  <select
                    value={selectedProductId}
                    onChange={(event) => setSelectedProductId(event.target.value)}
                    className="input bg-white"
                    disabled={productsLoading || products.length === 0}
                  >
                    <option value="">
                      {productsLoading
                        ? "Đang tải sản phẩm..."
                        : products.length === 0
                          ? "Chưa có sản phẩm được duyệt"
                          : "Chọn sản phẩm chính hãng"}
                    </option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.title}
                      </option>
                    ))}
                  </select>
                  {selectedProduct && (
                    <div className="flex items-center gap-3 overflow-hidden rounded-lg bg-white p-2 ring-1 ring-neutral-200">
                      <img
                        src={
                          selectedProduct.thumbnail ||
                          selectedProduct.images[0] ||
                          PLACEHOLDER_IMAGE
                        }
                        alt={selectedProduct.title}
                        className="h-12 w-12 rounded-md object-cover"
                      />
                      <div className="min-w-0">
                        <div className="truncate text-xs font-bold text-neutral-900">
                          {selectedProduct.title}
                        </div>
                        <div className="text-xs text-brand-red-600">
                          {formatCurrency(selectedProduct.basePrice)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder={
                  postType === "question"
                    ? "Bạn muốn hỏi cộng đồng điều gì?"
                    : postType === "product_share"
                      ? "Bạn muốn chia sẻ gì về sản phẩm này?"
                      : "Chia sẻ trải nghiệm của bạn..."
                }
                rows={4}
                className="input min-h-[120px] resize-y"
                disabled={!user || submitting}
              />

              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-neutral-500">
                  {user
                    ? "Bài đăng sẽ hiển thị công khai trên bảng tin cộng đồng."
                    : "Đăng nhập để tạo bài viết và bình luận."}
                </p>
                <button
                  type="submit"
                  disabled={!user || submitting}
                  className="btn-primary"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  Đăng bài
                </button>
              </div>
            </form>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-neutral-900">Bảng tin</h2>
              <span className="text-xs text-neutral-500">{posts.length} bài viết</span>
            </div>

            {loading ? (
              <div className="card flex items-center justify-center gap-2 p-8 text-sm text-neutral-500">
                <Loader2 size={16} className="animate-spin" />
                Đang tải bảng tin...
              </div>
            ) : error ? (
              <div className="card p-5 text-sm text-rose-600">
                Không thể tải bảng tin: {error}
              </div>
            ) : posts.length === 0 ? (
              <div className="card flex flex-col items-center justify-center py-14 text-center">
                <MessageCircle size={44} className="text-neutral-300" />
                <h3 className="mt-3 text-lg font-bold text-neutral-900">
                  Chưa có bài viết cộng đồng
                </h3>
                <p className="mt-1 max-w-md text-sm text-neutral-500">
                  Khi người dùng đặt câu hỏi, chia sẻ sản phẩm hoặc kinh nghiệm mua
                  hàng, bài viết sẽ xuất hiện tại đây.
                </p>
              </div>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  user={user}
                  onLike={handleLike}
                  onShare={handleShare}
                />
              ))
            )}
          </section>
        </main>

        <aside className="space-y-4">
          <div className="card p-4">
            <h2 className="text-base font-bold text-neutral-900">Hoạt động thật</h2>
            <div className="mt-3 space-y-3 text-sm text-neutral-600">
              <div className="flex items-start gap-2">
                <HelpCircle size={16} className="mt-0.5 text-brand-red-500" />
                <span>Người dùng đăng câu hỏi để cộng đồng và shop phản hồi.</span>
              </div>
              <div className="flex items-start gap-2">
                <PackageSearch size={16} className="mt-0.5 text-brand-red-500" />
                <span>Sản phẩm chia sẻ được lấy từ danh sách đã duyệt.</span>
              </div>
              <div className="flex items-start gap-2">
                <MessageCircle size={16} className="mt-0.5 text-brand-red-500" />
                <span>Bình luận, lượt thích và chia sẻ được lưu realtime.</span>
              </div>
            </div>
          </div>

          <div className="card p-4">
            <h2 className="text-base font-bold text-neutral-900">Sản phẩm có thể chia sẻ</h2>
            <div className="mt-3 space-y-3">
              {productsLoading ? (
                <div className="flex items-center gap-2 text-sm text-neutral-500">
                  <Loader2 size={14} className="animate-spin" /> Đang tải...
                </div>
              ) : products.length === 0 ? (
                <p className="text-sm text-neutral-500">
                  Chưa có sản phẩm đã duyệt để chia sẻ.
                </p>
              ) : (
                products.slice(0, 4).map((product) => (
                  <Link
                    key={product.id}
                    to={`/products/${product.handle}`}
                    className="flex items-center gap-3 rounded-lg p-2 hover:bg-neutral-50"
                  >
                    <img
                      src={product.thumbnail || product.images[0] || PLACEHOLDER_IMAGE}
                      alt={product.title}
                      className="h-12 w-12 rounded-md object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="line-clamp-1 text-sm font-semibold text-neutral-900">
                        {product.title}
                      </div>
                      <div className="text-xs text-brand-red-600">
                        {formatCurrency(product.basePrice)}
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

function PostCard({
  post,
  user,
  onLike,
  onShare,
}: {
  post: SocialPost
  user: User | null
  onLike: (post: SocialPost) => void
  onShare: (post: SocialPost) => void
}) {
  const [showComments, setShowComments] = useState(false)
  const liked = !!user && post.likedBy.includes(user.id)

  return (
    <article className="card overflow-hidden">
      <div className="p-4">
        <div className="flex items-start gap-3">
          {post.authorAvatar ? (
            <img
              src={post.authorAvatar}
              alt={post.authorName}
              className="h-11 w-11 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-red-100 text-sm font-bold text-brand-red-700">
              {post.authorName[0]?.toUpperCase() ?? "A"}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-neutral-900">{post.authorName}</span>
              <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-semibold text-neutral-600">
                {TYPE_LABEL[post.type]}
              </span>
            </div>
            <div className="text-xs text-neutral-500">
              {formatRelativeTime(post.createdAt)}
            </div>
          </div>
        </div>

        <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-neutral-800">
          {post.content}
        </p>

        {post.product && (
          <Link
            to={`/products/${post.product.handle}`}
            className="mt-4 grid overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-white sm:grid-cols-[160px_1fr]"
          >
            <div className="aspect-video bg-neutral-100 sm:aspect-square">
              <img
                src={post.product.image || PLACEHOLDER_IMAGE}
                alt={post.product.title}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="p-4">
              <div className="text-xs font-semibold uppercase text-brand-red-600">
                Sản phẩm chính hãng
              </div>
              <h3 className="mt-1 line-clamp-2 text-base font-bold text-neutral-900">
                {post.product.title}
              </h3>
              <div className="mt-2 text-lg font-extrabold text-brand-red-600">
                {formatCurrency(post.product.price)}
              </div>
              <div className="mt-1 text-sm text-neutral-500">
                Tại shop {post.product.shopName}
              </div>
            </div>
          </Link>
        )}

        <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3 text-xs text-neutral-500">
          <span>
            {post.likeCount} thích · {post.commentCount} bình luận · {post.shareCount} chia sẻ
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 border-t border-neutral-100">
        <button
          onClick={() => onLike(post)}
          className={cn(
            "flex items-center justify-center gap-2 px-3 py-3 text-sm font-semibold hover:bg-neutral-50",
            liked ? "text-brand-red-600" : "text-neutral-600"
          )}
        >
          <Heart size={17} fill={liked ? "currentColor" : "none"} />
          Thích
        </button>
        <button
          onClick={() => setShowComments((current) => !current)}
          className="flex items-center justify-center gap-2 px-3 py-3 text-sm font-semibold text-neutral-600 hover:bg-neutral-50"
        >
          <MessageCircle size={17} />
          Bình luận
        </button>
        <button
          onClick={() => onShare(post)}
          className="flex items-center justify-center gap-2 px-3 py-3 text-sm font-semibold text-neutral-600 hover:bg-neutral-50"
        >
          <Share2 size={17} />
          Chia sẻ
        </button>
      </div>

      {showComments && <CommentsPanel postId={post.id} user={user} />}
    </article>
  )
}

function CommentsPanel({ postId, user }: { postId: string; user: User | null }) {
  const [comments, setComments] = useState<SocialComment[]>([])
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setLoading(true)
    return subscribeSocialComments(
      postId,
      (nextComments) => {
        setComments(nextComments)
        setLoading(false)
      },
      () => setLoading(false)
    )
  }, [postId])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!user) {
      toast.error("Vui lòng đăng nhập để bình luận")
      return
    }
    if (!content.trim()) return

    setSubmitting(true)
    try {
      await addSocialComment({ postId, content, user })
      setContent("")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể gửi bình luận")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="border-t border-neutral-100 bg-neutral-50 p-4">
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <Loader2 size={14} className="animate-spin" />
            Đang tải bình luận...
          </div>
        ) : comments.length === 0 ? (
          <div className="text-sm text-neutral-500">Chưa có bình luận.</div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-2">
              {comment.authorAvatar ? (
                <img
                  src={comment.authorAvatar}
                  alt={comment.authorName}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-xs font-bold text-brand-red-700 ring-1 ring-neutral-200">
                  {comment.authorName[0]?.toUpperCase() ?? "A"}
                </div>
              )}
              <div className="min-w-0 flex-1 rounded-xl bg-white px-3 py-2 ring-1 ring-neutral-200">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-neutral-900">
                    {comment.authorName}
                  </span>
                  <span className="text-[11px] text-neutral-500">
                    {formatRelativeTime(comment.createdAt)}
                  </span>
                </div>
                <p className="mt-1 whitespace-pre-wrap break-words text-sm text-neutral-700">
                  {comment.content}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex items-end gap-2">
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder={user ? "Viết bình luận..." : "Đăng nhập để bình luận"}
          rows={1}
          className="max-h-28 flex-1 resize-none rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-brand-red-400 focus:outline-none focus:ring-1 focus:ring-brand-red-400"
          disabled={!user || submitting}
        />
        <button
          type="submit"
          disabled={!user || submitting || !content.trim()}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-red-500 text-white hover:bg-brand-red-600 disabled:bg-neutral-300"
          aria-label="Gửi bình luận"
        >
          {submitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
        </button>
      </form>
    </div>
  )
}

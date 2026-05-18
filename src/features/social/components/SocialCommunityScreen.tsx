import { Link } from "react-router-dom"
import { Users, MessageCircle, ShieldCheck, ArrowRight } from "lucide-react"

export function SocialCommunityScreen() {
  return (
    <div className="p-4 lg:p-8 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Cộng đồng ACFMart</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Tham gia thảo luận, chia sẻ kinh nghiệm và kết nối với cộng đồng mua sắm chính hãng.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
            <Users size={24} />
          </div>
          <h3 className="mt-3 text-sm font-bold text-neutral-900">Nhóm thảo luận</h3>
          <p className="mt-1 text-xs leading-5 text-neutral-500">
            Tham gia các nhóm thảo luận theo chủ đề: mỹ phẩm, thời trang, điện tử, thực phẩm...
          </p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            <MessageCircle size={24} />
          </div>
          <h3 className="mt-3 text-sm font-bold text-neutral-900">Hỏi đáp</h3>
          <p className="mt-1 text-xs leading-5 text-neutral-500">
            Đặt câu hỏi cho cộng đồng và nhận phản hồi từ người mua khác hoặc shop uy tín.
          </p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
            <ShieldCheck size={24} />
          </div>
          <h3 className="mt-3 text-sm font-bold text-neutral-900">Đánh giá sản phẩm</h3>
          <p className="mt-1 text-xs leading-5 text-neutral-500">
            Xem và viết đánh giá sản phẩm chính hãng từ trải nghiệm thực tế.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-5">
        <p className="text-sm text-neutral-600">
          Tính năng cộng đồng đang được phát triển. Trong thời gian chờ đợi, bạn có thể truy cập{" "}
          <Link to="/social/feed" className="font-semibold text-violet-600 hover:underline">
            Bảng tin <ArrowRight size={12} className="inline" />
          </Link>{" "}
          để chia sẻ và tương tác.
        </p>
      </div>
    </div>
  )
}

import { Search, Package, CreditCard, ShieldCheck, Users, MessageCircle, Star, BookOpen } from "lucide-react";

const faqs = [
  {
    category: "Đặt hàng & thanh toán",
    items: [
      { id: 1, question: "Làm thế nào để đặt hàng trên ACFMart?", answer: "..." },
      { id: 2, question: "Các phương thức thanh toán nào được hỗ trợ?", answer: "..." },
      { id: 3, question: "Tôi có thể hủy đơn hàng sau khi đặt không?", answer: "..." },
    ]
  },
  {
    category: "Giao nhận & vận chuyển",
    items: [
      { id: 4, question: "Thời gian giao hàng là bao lâu?", answer: "..." },
      { id: 5, question: "Tôi có thể đổi địa chỉ giao hàng sau khi đặt không?", answer: "..." },
      { id: 6, question: "Phí vận chuyển được tính như thế nào?", answer: "..." },
    ]
  },
  {
    category: "Chính sách đổi trả",
    items: [
      { id: 7, question: "Điều kiện đổi trả sản phẩm là gì?", answer: "..." },
      { id: 8, question: "Thời hạn đổi trả là bao lâu?", answer: "..." },
      { id: 9, question: "Tôi sẽ nhận lại tiền trong bao lâu sau khi trả hàng?", answer: "..." },
    ]
  }
];

const popularTopics = [
  { icon: ShieldCheck, title: "Xác thực hàng chính hãng", count: "12 bài viết" },
  { icon: Package, title: "Theo dõi đơn hàng", count: "8 bài viết" },
  { icon: CreditCard, title: "Phương thức thanh toán", count: "6 bài viết" },
  { icon: Users, title: "Chính sách thành viên", count: "5 bài viết" },
];

export function HelpCenterScreen() {
  return (
    <div className="container-acf py-6 lg:py-10">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-neutral-900">Trung tâm trợ giúp</h1>
        <p className="text-neutral-600">Tìm câu trả lời cho các câu hỏi thường gặp</p>
      </div>

      <div className="mx-auto max-w-2xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
          <input
            type="text"
            placeholder="Tìm kiếm câu trả lời..."
            className="input w-full pl-10"
          />
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {popularTopics.map((topic, index) => (
          <div 
            key={index} 
            className="flex cursor-pointer flex-col items-center rounded-xl border border-neutral-200 bg-white p-4 text-center transition-colors hover:border-brand-red-300 hover:bg-brand-red-50"
          >
            <div className="rounded-lg bg-brand-red-50 p-3 text-brand-red-600">
              <topic.icon size={20} />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-neutral-900">{topic.title}</h3>
            <p className="mt-1 text-xs text-neutral-500">{topic.count}</p>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-bold text-neutral-900">Câu hỏi thường gặp</h2>
        
        <div className="mt-6 space-y-8">
          {faqs.map((faq, index) => (
            <div key={index}>
              <h3 className="mb-4 flex items-center gap-2 border-b border-neutral-200 pb-2 text-lg font-semibold text-neutral-900">
                <BookOpen size={20} className="text-brand-red-600" />
                {faq.category}
              </h3>
              
              <div className="space-y-3">
                {faq.items.map((item) => (
                  <div 
                    key={item.id} 
                    className="cursor-pointer rounded-xl border border-neutral-200 bg-white p-4 hover:border-brand-red-300 hover:bg-brand-red-50"
                  >
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-neutral-900">{item.question}</h4>
                      <span className="ml-2 text-neutral-400">+</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 rounded-2xl bg-brand-red-50 p-6">
        <div className="flex flex-col items-center justify-between gap-6 lg:flex-row">
          <div>
            <h3 className="text-lg font-bold text-neutral-900">Vẫn chưa giải đáp được thắc mắc?</h3>
            <p className="mt-1 text-neutral-600">Liên hệ với chúng tôi để được hỗ trợ trực tiếp</p>
          </div>
          <div className="flex gap-3">
            <button className="btn-primary flex items-center gap-2">
              <MessageCircle size={16} />
              Chat với CSKH
            </button>
            <button className="btn-secondary flex items-center gap-2">
              <Star size={16} />
              Đánh giá hỗ trợ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
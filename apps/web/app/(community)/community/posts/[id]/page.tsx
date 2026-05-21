'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Heart, Bookmark, Share2, MessageCircle, ChevronRight, ThumbsUp, CornerDownRight } from 'lucide-react';

interface Comment {
  id: string;
  author: string;
  avatar: string;
  content: string;
  date: string;
  likes: number;
  replies: Comment[];
}

const post = {
  id: '1',
  title: 'Hướng dẫn mua hàng an toàn trên ACFMart — Tránh hàng giả 100%',
  category: 'Mẹo mua sắm',
  author: { name: 'Trần Minh Quang', avatar: 'MQ', badge: 'Thành viên VIP', joined: 'Tháng 1, 2025' },
  date: '20/05/2026 14:30',
  content: [
    'Với sự phát triển của thương mại điện tử, nạn hàng giả ngày càng trở nên tinh vi hơn. Bài viết này sẽ hướng dẫn bạn cách mua hàng an toàn trên ACFMart để tránh những rủi ro không đáng có.',
    '**1. Kiểm tra badge xác thực**\nKhi tìm kiếm sản phẩm, hãy chú ý đến badge "✓ Đã xác thực ACFmart" màu xanh lá ở dưới ảnh sản phẩm. Đây là dấu hiệu cho thấy sản phẩm đã qua quy trình kiểm định kỹ lưỡng của đội ngũ ACF.',
    '**2. Sử dụng tính năng QR Verify**\nMỗi sản phẩm chính hãng trên ACFMart đều có mã QR xác thực riêng. Khi nhận hàng, hãy quét mã QR này để xác nhận đây là hàng thật và chưa bị tráo đổi.',
    '**3. Mua từ shop có chứng nhận**\nCác shop đã qua quy trình xét duyệt KYC của ACFMart sẽ có badge "Shop chính hãng". Hãy ưu tiên mua từ những shop này.',
    '**4. Thanh toán qua Escrow**\nĐây là tính năng cực kỳ quan trọng! Khi thanh toán qua ACFMart Escrow, tiền của bạn được giữ an toàn cho đến khi bạn xác nhận nhận được hàng đúng như mô tả. Nếu có vấn đề, bạn có thể yêu cầu hoàn tiền 100% trong 7 ngày.',
    '**5. Đọc kỹ đánh giá từ người mua khác**\nCác đánh giá có badge "Đã mua" là những đánh giá thực từ người mua thực sự. Hãy ưu tiên đọc những đánh giá này và chú ý đến ảnh chụp thực tế sản phẩm.',
  ],
  tags: ['mua sắm an toàn', 'hàng chính hãng', 'escrow', 'QR verify', 'tips'],
  likes: 47,
  saves: 23,
  commentCount: 12,
  images: ['IMG1', 'IMG2'],
};

const initialComments: Comment[] = [
  {
    id: 'c1', author: 'Nguyễn Thị Lan', avatar: 'NL', date: '20/05/2026 15:10', likes: 8,
    content: 'Bài viết rất hữu ích! Mình đã dùng tính năng Escrow và thấy rất an tâm khi mua hàng. Cảm ơn bạn đã chia sẻ!',
    replies: [
      { id: 'r1', author: 'Trần Minh Quang', avatar: 'MQ', date: '20/05/2026 15:30', likes: 3, content: 'Cảm ơn bạn đã đọc! Đúng là Escrow là tính năng mình thích nhất trên ACFMart. An tâm hơn rất nhiều khi mua hàng online 😊', replies: [] },
    ],
  },
  {
    id: 'c2', author: 'Phạm Đức Hùng', avatar: 'PH', date: '20/05/2026 16:45', likes: 5,
    content: 'Cho mình hỏi thêm về tính năng QR Verify, mình cần tải app riêng hay quét trực tiếp trên app ACFMart được không?',
    replies: [
      { id: 'r2', author: 'Trần Minh Quang', avatar: 'MQ', date: '20/05/2026 17:00', likes: 4, content: 'Bạn quét trực tiếp trên app ACFMart được nhé! Vào mục "QR Verify" ở thanh menu dưới là dùng được ngay, không cần cài thêm app.', replies: [] },
    ],
  },
  {
    id: 'c3', author: 'Lê Thị Mai', avatar: 'LM', date: '21/05/2026 08:20', likes: 2,
    content: 'Mình đã bị mua nhầm hàng giả ở một sàn khác, sau khi chuyển sang ACFMart thì thấy an tâm hơn nhiều. Chất lượng sản phẩm thực sự tốt hơn.',
    replies: [],
  },
];

export default function PostDetailPage() {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likes, setLikes] = useState(post.likes);
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const handleLike = () => {
    setLiked(!liked);
    setLikes(l => liked ? l - 1 : l + 1);
  };

  const submitComment = () => {
    if (!newComment.trim()) return;
    const comment: Comment = {
      id: `c${Date.now()}`, author: 'Bạn', avatar: 'ME',
      content: newComment, date: 'Vừa xong', likes: 0, replies: [],
    };
    setComments(prev => [...prev, comment]);
    setNewComment('');
  };

  const submitReply = (commentId: string) => {
    if (!replyText.trim()) return;
    const reply: Comment = {
      id: `r${Date.now()}`, author: 'Bạn', avatar: 'ME',
      content: replyText, date: 'Vừa xong', likes: 0, replies: [],
    };
    setComments(prev => prev.map(c =>
      c.id === commentId ? { ...c, replies: [...c.replies, reply] } : c
    ));
    setReplyingTo(null);
    setReplyText('');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-1.5 flex-wrap">
        <Link href="/" className="hover:text-red-600">Trang chủ</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/community" className="hover:text-red-600">Cộng đồng</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-900 line-clamp-1">Bài viết</span>
      </nav>

      {/* Post */}
      <article className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-6">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-[#E31937] font-bold text-sm">
              {post.author.avatar}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">{post.author.name}</span>
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">{post.author.badge}</span>
              </div>
              <p className="text-xs text-gray-400">{post.date}</p>
            </div>
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">{post.category}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 leading-snug">{post.title}</h1>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {post.content.map((para, i) => (
            <p key={i} className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {para}
            </p>
          ))}

          {/* Images */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            {post.images.map((_, i) => (
              <div key={i} className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-sm">
                Hình {i + 1}
              </div>
            ))}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 pt-2">
            {post.tags.map(tag => (
              <span key={tag} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs rounded-full cursor-pointer transition-colors">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Like/Save/Share bar */}
        <div className="flex items-center gap-2 px-6 py-4 border-t border-gray-100">
          <button onClick={handleLike}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              liked ? 'bg-red-100 text-[#E31937]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
            {likes}
          </button>
          <button onClick={() => setSaved(!saved)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              saved ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
            {saved ? 'Đã lưu' : 'Lưu'}
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-medium transition-colors">
            <Share2 className="w-4 h-4" />
            Chia sẻ
          </button>
          <span className="ml-auto flex items-center gap-1.5 text-sm text-gray-400">
            <MessageCircle className="w-4 h-4" />
            {comments.length} bình luận
          </span>
        </div>
      </article>

      {/* Comment input */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
        <h3 className="text-base font-semibold text-gray-900 mb-3">Để lại bình luận</h3>
        <textarea
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          rows={3}
          placeholder="Chia sẻ ý kiến của bạn..."
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
        />
        <div className="flex justify-end mt-3">
          <button onClick={submitComment} disabled={!newComment.trim()}
            className="px-6 py-2 bg-[#E31937] hover:bg-red-700 disabled:opacity-40 text-white rounded-lg text-sm font-medium transition-colors">
            Đăng bình luận
          </button>
        </div>
      </div>

      {/* Comments */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-gray-900">{comments.length} bình luận</h3>
        {comments.map(comment => (
          <div key={comment.id} className="bg-white border border-gray-200 rounded-2xl p-5">
            {/* Comment */}
            <div className="flex gap-3">
              <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 text-xs font-bold shrink-0">
                {comment.avatar}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-gray-900">{comment.author}</span>
                  <span className="text-xs text-gray-400">{comment.date}</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{comment.content}</p>
                <div className="flex items-center gap-3 mt-2">
                  <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-600 transition-colors">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    {comment.likes}
                  </button>
                  <button onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                    className="text-xs text-gray-400 hover:text-[#E31937] transition-colors flex items-center gap-1">
                    <CornerDownRight className="w-3.5 h-3.5" />
                    Trả lời
                  </button>
                </div>
              </div>
            </div>

            {/* Replies */}
            {comment.replies.length > 0 && (
              <div className="mt-4 ml-12 space-y-3">
                {comment.replies.map(reply => (
                  <div key={reply.id} className="flex gap-3 bg-gray-50 rounded-xl p-3">
                    <div className="w-7 h-7 bg-red-100 rounded-full flex items-center justify-center text-[#E31937] text-xs font-bold shrink-0">
                      {reply.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-semibold text-gray-900">{reply.author}</span>
                        <span className="text-xs text-gray-400">{reply.date}</span>
                      </div>
                      <p className="text-xs text-gray-700 leading-relaxed">{reply.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Reply input */}
            {replyingTo === comment.id && (
              <div className="mt-3 ml-12">
                <textarea
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  rows={2}
                  placeholder={`Trả lời ${comment.author}...`}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                />
                <div className="flex gap-2 mt-2 justify-end">
                  <button onClick={() => setReplyingTo(null)} className="px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">Hủy</button>
                  <button onClick={() => submitReply(comment.id)} disabled={!replyText.trim()}
                    className="px-4 py-1.5 bg-[#E31937] hover:bg-red-700 disabled:opacity-40 text-white rounded-lg text-xs font-medium transition-colors">
                    Gửi
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        <button className="w-full py-3 border border-gray-200 hover:bg-gray-50 text-gray-500 rounded-xl text-sm font-medium transition-colors">
          Xem thêm bình luận
        </button>
      </div>
    </div>
  );
}

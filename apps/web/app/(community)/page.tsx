'use client';

import { useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, Image as ImageIcon, BarChart2, Link2, Trophy, Users, Calendar, TrendingUp } from 'lucide-react';

// Mock posts feed
const mockPosts = [
  {
    id: 'post1',
    author: { name: 'Minh Tuấn Affiliate', avatar: 'MT', badge: 'Top Contributor', badgeColor: 'bg-amber-100 text-amber-700' },
    category: { name: 'Affiliate', color: 'bg-blue-100 text-blue-700', emoji: '🎯' },
    title: 'Bí kíp tăng tỷ lệ chuyển đổi affiliate lên 300% với chiến lược Content Marketing',
    content: 'Sau 6 tháng thử nghiệm với hơn 50 chiến dịch affiliate khác nhau, tôi đã tìm ra công thức giúp tỷ lệ click-through rate (CTR) tăng đáng kể...',
    tags: ['#affiliate', '#content-marketing', '#seo', '#acfmart'],
    likes: 234,
    comments: 45,
    images: ['https://picsum.photos/seed/post1a/300/200', 'https://picsum.photos/seed/post1b/300/200'],
    timeAgo: '2 giờ trước',
    liked: false,
    saved: false,
  },
  {
    id: 'post2',
    author: { name: 'Thu Hà Beauty', avatar: 'TH', badge: 'Thành viên tích cực', badgeColor: 'bg-purple-100 text-purple-700' },
    category: { name: 'Giải trí', color: 'bg-orange-100 text-orange-700', emoji: '😄' },
    title: '',
    content: 'Hôm nay vừa nhận được đơn hàng đầu tiên qua link affiliate ACFMart! 🎉 Cảm giác thật tuyệt vời khi thấy công sức bỏ ra được đền đáp. Tip nhỏ: hãy review sản phẩm thật chi tiết và trung thực, khách hàng sẽ tin tưởng hơn nhiều!',
    tags: ['#affiliate', '#motivation', '#acfmart-community'],
    likes: 128,
    comments: 23,
    images: ['https://picsum.photos/seed/post2/400/300'],
    timeAgo: '4 giờ trước',
    liked: true,
    saved: false,
  },
  {
    id: 'post3',
    author: { name: 'Hoàng SEO Pro', avatar: 'HS', badge: 'Expert', badgeColor: 'bg-green-100 text-green-700' },
    category: { name: 'Liên kết', color: 'bg-purple-100 text-purple-700', emoji: '🔗' },
    title: 'Chia sẻ: Cách tạo landing page chuyển đổi cao cho sản phẩm ACFMart',
    content: 'Đã test 15 mẫu landing page khác nhau trong 3 tháng qua. Kết quả: trang có video review đạt CR 4.2% vs trang chỉ có ảnh đạt 1.8%. Dưới đây là breakdown chi tiết từng element...',
    tags: ['#landing-page', '#conversion', '#seo', '#tips'],
    likes: 456,
    comments: 89,
    images: [],
    timeAgo: '1 ngày trước',
    liked: false,
    saved: true,
  },
  {
    id: 'post4',
    author: { name: 'Lan Phương Shop', avatar: 'LP', badge: 'Seller Pro', badgeColor: 'bg-red-100 text-red-700' },
    category: { name: 'Affiliate', color: 'bg-blue-100 text-blue-700', emoji: '🎯' },
    title: 'Kết quả tháng 1/2025: 45 triệu hoa hồng từ ACFMart Affiliate! 🚀',
    content: 'Không thể tin được! Tháng đầu tiên thử affiliate nghiêm túc và kết quả vượt mong đợi. Tôi chỉ tập trung vào 3 danh mục: Mỹ phẩm, Điện tử và Thời trang. Bí quyết chính là...',
    tags: ['#kết-quả', '#affiliate', '#thu-nhập-thụ-động'],
    likes: 892,
    comments: 167,
    images: ['https://picsum.photos/seed/post4/400/250'],
    timeAgo: '2 ngày trước',
    liked: false,
    saved: false,
  },
  {
    id: 'post5',
    author: { name: 'Đức Anh Tech', avatar: 'DA', badge: 'Top Contributor', badgeColor: 'bg-amber-100 text-amber-700' },
    category: { name: 'Giải trí', color: 'bg-orange-100 text-orange-700', emoji: '😄' },
    title: '',
    content: 'Tip nhỏ cho anh em mới: Đừng spam link affiliate ở khắp nơi nhé! Hãy tạo content chất lượng, review sản phẩm thật sự bạn đã dùng. Người xem sẽ tin tưởng và click rate sẽ cao hơn nhiều lần. Quality over quantity! 💪',
    tags: ['#tip', '#newbie', '#affiliate-101'],
    likes: 345,
    comments: 56,
    images: [],
    timeAgo: '3 ngày trước',
    liked: true,
    saved: true,
  },
];

const leaderboard = [
  { rank: 1, name: 'Hoàng SEO Pro', avatar: 'HS', points: 12450, change: '+234' },
  { rank: 2, name: 'Minh Tuấn Affiliate', avatar: 'MT', points: 10820, change: '+189' },
  { rank: 3, name: 'Lan Phương Shop', avatar: 'LP', points: 9640, change: '+312' },
  { rank: 4, name: 'Đức Anh Tech', avatar: 'DA', points: 8920, change: '+97' },
  { rank: 5, name: 'Thu Hà Beauty', avatar: 'TH', points: 7340, change: '+145' },
];

const featuredGroups = [
  { name: 'Affiliate Masters VN', members: 4521, icon: '🎯', color: 'bg-blue-100' },
  { name: 'Mỹ Phẩm Chính Hãng', members: 3891, icon: '💄', color: 'bg-pink-100' },
  { name: 'Công Nghệ & Điện Tử', members: 2734, icon: '💻', color: 'bg-purple-100' },
  { name: 'Thời Trang Trend 2025', members: 2156, icon: '👗', color: 'bg-orange-100' },
];

const upcomingEvents = [
  { title: 'Webinar: Tăng doanh thu Affiliate Q2/2025', date: '25/01/2025', time: '20:00', attendees: 234 },
  { title: 'ACFMart Live Shopping Marathon', date: '28/01/2025', time: '10:00', attendees: 1892 },
];

const FEED_TABS = ['Dành cho bạn', 'Mới nhất', 'Đang theo dõi', 'Nổi bật'];

function PostCard({ post }: { post: typeof mockPosts[0] }) {
  const [liked, setLiked] = useState(post.liked);
  const [saved, setSaved] = useState(post.saved);
  const [likeCount, setLikeCount] = useState(post.likes);

  return (
    <article className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-5">
      {/* Author row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">{post.author.avatar}</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-gray-900 text-sm">{post.author.name}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${post.author.badgeColor}`}>
                {post.author.badge}
              </span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${post.category.color}`}>
                {post.category.emoji} {post.category.name}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">{post.timeAgo}</p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600 p-1">•••</button>
      </div>

      {/* Content */}
      {post.title && (
        <h3 className="font-bold text-gray-900 mb-2 leading-tight hover:text-purple-700 cursor-pointer transition-colors">
          {post.title}
        </h3>
      )}
      <p className="text-gray-700 text-sm leading-relaxed mb-3 line-clamp-3">{post.content}</p>

      {/* Images */}
      {post.images.length > 0 && (
        <div className={`grid gap-2 mb-3 rounded-xl overflow-hidden ${post.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {post.images.map((img, i) => (
            <img key={i} src={img} alt="" className="w-full h-36 object-cover rounded-xl" />
          ))}
        </div>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {post.tags.map((tag) => (
          <span key={tag} className="text-[11px] text-purple-600 hover:text-purple-800 cursor-pointer font-medium bg-purple-50 hover:bg-purple-100 px-2 py-0.5 rounded-full transition-colors">
            {tag}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1">
          <button
            onClick={() => { setLiked(!liked); setLikeCount(liked ? likeCount - 1 : likeCount + 1); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${liked ? 'bg-red-50 text-[#E31937]' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}
          >
            <Heart size={15} className={liked ? 'fill-[#E31937]' : ''} />
            <span>{likeCount}</span>
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors">
            <MessageCircle size={15} />
            <span>{post.comments}</span>
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors">
            <Share2 size={15} />
          </button>
        </div>
        <button
          onClick={() => setSaved(!saved)}
          className={`p-1.5 rounded-lg transition-colors ${saved ? 'text-purple-600 bg-purple-50' : 'text-gray-400 hover:bg-gray-100'}`}
        >
          <Bookmark size={16} className={saved ? 'fill-purple-600' : ''} />
        </button>
      </div>
    </article>
  );
}

export default function CommunityHomePage() {
  const [activeTab, setActiveTab] = useState(0);
  const [leaderPeriod, setLeaderPeriod] = useState('week');

  return (
    <div className="flex gap-6">
      {/* Main feed */}
      <div className="flex-1 min-w-0 space-y-4">
        {/* Welcome + Post composer */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-black text-xl text-gray-900 mb-1">Chào mừng đến với ACFMart Community! 👋</h2>
          <p className="text-gray-500 text-sm mb-4">Nơi chia sẻ kinh nghiệm, chiến lược affiliate và mua sắm thông minh</p>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">U</span>
            </div>
            <input
              placeholder="Chia sẻ kinh nghiệm, mẹo hay hoặc câu hỏi của bạn..."
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 bg-gray-50"
            />
          </div>
          <div className="flex gap-2 mt-3 pl-12">
            {[
              { icon: <ImageIcon size={14} />, label: 'Ảnh/Video', color: 'text-green-600 hover:bg-green-50' },
              { icon: <BarChart2 size={14} />, label: 'Poll', color: 'text-blue-600 hover:bg-blue-50' },
              { icon: <Link2 size={14} />, label: 'Link', color: 'text-purple-600 hover:bg-purple-50' },
            ].map((btn) => (
              <button key={btn.label} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${btn.color} transition-colors`}>
                {btn.icon}{btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category cards */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { name: 'Affiliate', emoji: '🎯', members: '2.3k', desc: 'Chia sẻ chiến lược kiếm hoa hồng', bg: 'from-blue-500 to-cyan-500', href: '/community/affiliate' },
            { name: 'Giải trí', emoji: '😄', members: '5.1k', desc: 'Nội dung vui vẻ và truyền cảm hứng', bg: 'from-orange-500 to-amber-500', href: '/community/entertainment' },
            { name: 'Liên kết', emoji: '🔗', members: '1.8k', desc: 'Kết nối và hợp tác kinh doanh', bg: 'from-purple-500 to-indigo-500', href: '/community/links' },
          ].map((cat) => (
            <a key={cat.name} href={cat.href} className="block">
              <div className={`bg-gradient-to-br ${cat.bg} rounded-2xl p-4 text-white hover:scale-[1.02] transition-transform`}>
                <div className="text-2xl mb-2">{cat.emoji}</div>
                <h3 className="font-black text-base">{cat.name}</h3>
                <p className="text-[11px] text-white/80 mb-2 leading-tight">{cat.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white/90 flex items-center gap-1">
                    <Users size={11} />{cat.members} thành viên
                  </span>
                  <button className="text-xs bg-white/20 hover:bg-white/30 text-white font-bold px-3 py-1 rounded-full transition-colors">
                    Tham gia
                  </button>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Feed tabs */}
        <div className="flex gap-1 bg-white rounded-xl border border-gray-100 p-1 shadow-sm">
          {FEED_TABS.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === i ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Posts */}
        <div className="space-y-4">
          {mockPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>

      {/* Right sidebar */}
      <div className="w-72 flex-shrink-0 hidden xl:block space-y-4">
        {/* Leaderboard */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
            <Trophy size={16} className="text-amber-500" />
            <h3 className="font-bold text-gray-900 text-sm">Bảng xếp hạng</h3>
          </div>
          <div className="flex gap-1 p-2">
            {['Tuần', 'Tháng', 'Năm'].map((p) => (
              <button
                key={p}
                onClick={() => setLeaderPeriod(p.toLowerCase())}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  leaderPeriod === p.toLowerCase() ? 'bg-purple-600 text-white' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <ul className="px-3 pb-3 space-y-2">
            {leaderboard.map((u) => (
              <li key={u.rank} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-black ${
                  u.rank === 1 ? 'bg-amber-400 text-white' : u.rank === 2 ? 'bg-gray-300 text-gray-700' : u.rank === 3 ? 'bg-orange-300 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  {u.rank}
                </div>
                <div className="w-7 h-7 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-[10px] font-bold">{u.avatar}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900 truncate">{u.name}</p>
                  <p className="text-[10px] text-gray-400">{u.points.toLocaleString('vi-VN')} điểm</p>
                </div>
                <span className="text-[10px] text-green-600 font-bold flex items-center gap-0.5">
                  <TrendingUp size={9} />{u.change}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Featured groups */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <Users size={15} className="text-purple-500" /> Nhóm nổi bật
            </h3>
          </div>
          <ul className="p-3 space-y-2">
            {featuredGroups.map((g) => (
              <li key={g.name} className="flex items-center gap-3">
                <div className={`w-9 h-9 ${g.color} rounded-xl flex items-center justify-center text-lg flex-shrink-0`}>
                  {g.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900 truncate">{g.name}</p>
                  <p className="text-[10px] text-gray-400">{g.members.toLocaleString('vi-VN')} thành viên</p>
                </div>
                <button className="text-[10px] bg-purple-100 text-purple-700 hover:bg-purple-200 font-bold px-2 py-1 rounded-lg transition-colors">
                  Tham gia
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Upcoming events */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <Calendar size={15} className="text-[#E31937]" /> Sự kiện sắp diễn ra
            </h3>
          </div>
          <ul className="p-3 space-y-3">
            {upcomingEvents.map((e, i) => (
              <li key={i} className="border border-gray-100 rounded-xl p-3 hover:border-purple-200 hover:bg-purple-50/50 transition-all cursor-pointer">
                <p className="text-xs font-bold text-gray-900 leading-tight mb-1.5">{e.title}</p>
                <div className="flex items-center justify-between text-[10px] text-gray-500">
                  <span>📅 {e.date} · ⏰ {e.time}</span>
                  <span className="flex items-center gap-1"><Users size={9} />{e.attendees}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

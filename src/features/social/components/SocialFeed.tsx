import { Heart, MessageCircle, Share, Users, Play, Link as LinkIcon } from "lucide-react";
import { Link } from "react-router-dom";

export default function SocialFeed() {
  // Mock data for stories
  const stories = [
    { id: 1, username: "ShopChuanGia", avatar: "https://placehold.co/600x400/ff6b6b/ffffff?text=S", isLive: true },
    { id: 2, username: "TechVN", avatar: "https://placehold.co/600x400/4ecdc4/ffffff?text=T", isLive: false },
    { id: 3, username: "MyPhamChinhHang", avatar: "https://placehold.co/600x400/45b7d1/ffffff?text=M", isLive: true },
    { id: 4, username: "FashionHub", avatar: "https://placehold.co/600x400/f7b731/ffffff?text=F", isLive: false },
    { id: 5, username: "FoodSpecial", avatar: "https://placehold.co/600x400/5f27cd/ffffff?text=F", isLive: false },
  ];

  // Mock data for posts
  const posts = [
    {
      id: 1,
      username: "ShopChuanGia",
      avatar: "https://placehold.co/600x400/ff6b6b/ffffff?text=S",
      productImage: "https://placehold.co/600x600/ff9ff3/ffffff?text=SP",
      caption: "Sản phẩm mới vừa về, chất lượng đảm bảo chính hãng!",
      likes: 124,
      comments: 23,
      shares: 5,
      timestamp: "2 giờ trước",
      productInfo: { name: "Sản phẩm chính hãng", price: "299.000₫", shop: "ShopChuanGia" }
    },
    {
      id: 2,
      username: "TechVN",
      avatar: "https://placehold.co/600x400/4ecdc4/ffffff?text=T",
      productImage: "https://placehold.co/600x600/54a0ff/ffffff?text=TV",
      caption: "Livestream bán hàng vào 8h tối nay, nhiều ưu đãi hấp dẫn!",
      likes: 342,
      comments: 45,
      shares: 12,
      timestamp: "4 giờ trước",
      isLive: true,
      productInfo: { name: "Livestream 8PM", price: "Ưu đãi lớn", shop: "TechVN" }
    },
    {
      id: 3,
      username: "MyPhamChinhHang",
      avatar: "https://placehold.co/600x400/45b7d1/ffffff?text=M",
      productImage: "https://placehold.co/600x600/5f27cd/ffffff?text=MP",
      caption: "Combo dưỡng da 5 món chỉ với 499k, đảm bảo chính hãng 100%",
      likes: 567,
      comments: 89,
      shares: 23,
      timestamp: "6 giờ trước",
      productInfo: { name: "Combo dưỡng da", price: "499.000₫", shop: "MyPhamChinhHang" }
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-900 pt-4 pb-16">
      <div className="container-acf">
        {/* Stories Section */}
        <div className="mb-6 overflow-x-auto">
          <h2 className="mb-3 text-xl font-bold text-white">Stories</h2>
          <div className="flex gap-4 pb-2">
            {stories.map((story) => (
              <div key={story.id} className="flex-shrink-0">
                <div className={`relative h-24 w-24 rounded-full border-4 ${story.isLive ? 'border-red-500' : 'border-purple-500'} p-0.5`}>
                  <img 
                    src={story.avatar} 
                    alt={story.username} 
                    className="h-full w-full rounded-full object-cover"
                  />
                  {story.isLive && (
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 rounded-md bg-red-500 px-1 py-0.5 text-[10px] font-bold text-white">
                      LIVE
                    </div>
                  )}
                </div>
                <div className="mt-1.5 w-24 truncate text-center text-xs text-neutral-400">
                  {story.username}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Section */}
        <div className="mb-6">
          <h2 className="mb-3 flex items-center gap-2 text-xl font-bold text-white">
            <Play size={20} className="text-red-500" />
            Livestream đang hot
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {posts.filter(post => post.isLive).map((post) => (
              <div key={`live-${post.id}`} className="card overflow-hidden rounded-xl bg-neutral-800">
                <div className="relative aspect-video bg-neutral-700">
                  <img 
                    src={post.productImage} 
                    alt={post.caption} 
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex items-center gap-2 rounded-full bg-red-600 px-3 py-1.5">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-white"></div>
                      <span className="text-sm font-bold">LIVE</span>
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <div className="flex items-start gap-2">
                    <img 
                      src={post.avatar} 
                      alt={post.username} 
                      className="h-8 w-8 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-white">{post.username}</div>
                      <div className="text-xs text-neutral-400">{post.caption.substring(0, 40)}...</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Post Feed */}
        <div>
          <h2 className="mb-3 text-xl font-bold text-white">Bảng tin</h2>
          
          {posts.map((post) => (
            <div key={post.id} className="card mb-4 rounded-xl bg-neutral-800">
              {/* Post Header */}
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-2">
                  <img 
                    src={post.avatar} 
                    alt={post.username} 
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-white">{post.username}</div>
                    <div className="text-xs text-neutral-400">{post.timestamp}</div>
                  </div>
                </div>
                <button className="text-neutral-400 hover:text-white">
                  <Share size={18} />
                </button>
              </div>
              
              {/* Post Content */}
              <div className="px-3 pb-2">
                <p className="text-neutral-200">{post.caption}</p>
              </div>
              
              {/* Product Image */}
              <div className="aspect-square w-full overflow-hidden bg-neutral-700">
                <img 
                  src={post.productImage} 
                  alt={post.caption} 
                  className="h-full w-full object-cover"
                />
              </div>
              
              {/* Product Info */}
              {post.productInfo && (
                <div className="border-t border-neutral-700 p-3">
                  <div className="font-semibold text-white">{post.productInfo.name}</div>
                  <div className="text-sm text-brand-gold-500">{post.productInfo.price}</div>
                  <div className="mt-1 text-xs text-neutral-400">Tại shop {post.productInfo.shop}</div>
                  <Link 
                    to={`/products/${post.id}`} 
                    className="mt-2 inline-block rounded-lg bg-brand-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-red-700"
                  >
                    Xem sản phẩm
                  </Link>
                </div>
              )}
              
              {/* Engagement Stats */}
              <div className="border-t border-neutral-700 p-3">
                <div className="text-neutral-400 text-sm">
                  {post.likes} thích • {post.comments} bình luận
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="border-t border-neutral-700">
                <div className="flex justify-around p-2">
                  <button className="flex items-center gap-2 rounded-lg px-3 py-2 text-neutral-400 hover:bg-neutral-700 hover:text-red-500">
                    <Heart size={18} />
                    <span>Thích</span>
                  </button>
                  <button className="flex items-center gap-2 rounded-lg px-3 py-2 text-neutral-400 hover:bg-neutral-700 hover:text-white">
                    <MessageCircle size={18} />
                    <span>Bình luận</span>
                  </button>
                  <button className="flex items-center gap-2 rounded-lg px-3 py-2 text-neutral-400 hover:bg-neutral-700 hover:text-white">
                    <Share size={18} />
                    <span>Chia sẻ</span>
                  </button>
                  <button className="flex items-center gap-2 rounded-lg px-3 py-2 text-neutral-400 hover:bg-neutral-700 hover:text-green-500">
                    <LinkIcon size={18} />
                    <span>Liên kết</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-neutral-800 bg-neutral-900">
        <div className="container-acf">
          <div className="grid grid-cols-5">
            <Link 
              to="/" 
              className="flex flex-col items-center justify-center gap-1 py-2 text-xs text-neutral-400 hover:text-white"
            >
              <div className="text-lg">🏠</div>
              <span>Trang chủ</span>
            </Link>
            <Link 
              to="/social" 
              className="flex flex-col items-center justify-center gap-1 py-2 text-xs text-white"
            >
              <div className="text-lg">🔍</div>
              <span>Khám phá</span>
            </Link>
            <Link 
              to="/affiliate" 
              className="flex flex-col items-center justify-center gap-1 py-2 text-xs text-neutral-400 hover:text-white"
            >
              <div className="text-lg">➕</div>
              <span>Tạo</span>
            </Link>
            <Link 
              to="/affiliate" 
              className="flex flex-col items-center justify-center gap-1 py-2 text-xs text-neutral-400 hover:text-white"
            >
              <div className="text-lg">🛍️</div>
              <span>Shop</span>
            </Link>
            <Link 
              to="/account" 
              className="flex flex-col items-center justify-center gap-1 py-2 text-xs text-neutral-400 hover:text-white"
            >
              <div className="text-lg">👤</div>
              <span>Tôi</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
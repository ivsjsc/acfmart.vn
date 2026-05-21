'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, X, Eye, EyeOff, Bold, Italic, Underline, Link as LinkIcon, Image } from 'lucide-react';
import Link from 'next/link';

const CATEGORIES = ['Mẹo mua sắm', 'Affiliate', 'Review sản phẩm', 'Giải trí', 'Hỏi đáp', 'Chia sẻ kinh nghiệm'];

export default function NewPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const addTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
      if (!tags.includes(newTag) && tags.length < 8) {
        setTags(prev => [...prev, newTag]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => setTags(prev => prev.filter(t => t !== tag));

  const insertFormat = (format: string) => {
    const formats: Record<string, string> = {
      bold: '**text**',
      italic: '_text_',
      underline: '<u>text</u>',
      link: '[text](url)',
      image: '![alt](url)',
    };
    setContent(prev => prev + ' ' + formats[format]);
  };

  const mockAddImage = () => {
    if (images.length < 4) {
      setImages(prev => [...prev, `Image${prev.length + 1}`]);
    }
  };

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const isReady = title.trim() && category && content.trim().length > 50;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/community" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Tạo bài viết mới</h1>
          <p className="text-sm text-gray-500">Chia sẻ kinh nghiệm, mẹo mua sắm với cộng đồng ACFMart</p>
        </div>
        <button onClick={() => setShowPreview(!showPreview)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
            showPreview ? 'bg-purple-100 border-purple-300 text-purple-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}>
          {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {showPreview ? 'Tắt Preview' : 'Preview'}
        </button>
      </div>

      <div className={`flex gap-6 ${showPreview ? 'grid grid-cols-2' : ''}`}>
        {/* Editor */}
        <div className={`space-y-5 ${showPreview ? '' : 'w-full'}`}>
          {/* Title */}
          <div>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Tiêu đề bài viết của bạn..."
              className="w-full text-2xl font-bold border-0 border-b-2 border-gray-200 focus:border-[#E31937] px-0 py-3 focus:outline-none placeholder-gray-300 bg-transparent transition-colors"
            />
            <p className="text-xs text-gray-400 mt-1">{title.length}/200 ký tự</p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Danh mục <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    category === cat
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Toolbar + Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nội dung <span className="text-red-500">*</span>
            </label>
            {/* Toolbar */}
            <div className="flex items-center gap-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-t-xl">
              {[
                { key: 'bold', icon: <Bold className="w-4 h-4" />, title: 'In đậm' },
                { key: 'italic', icon: <Italic className="w-4 h-4" />, title: 'In nghiêng' },
                { key: 'underline', icon: <Underline className="w-4 h-4" />, title: 'Gạch chân' },
              ].map(btn => (
                <button key={btn.key} onClick={() => insertFormat(btn.key)} title={btn.title}
                  className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded transition-colors">
                  {btn.icon}
                </button>
              ))}
              <div className="w-px h-5 bg-gray-300 mx-1" />
              {[
                { key: 'link', icon: <LinkIcon className="w-4 h-4" />, title: 'Chèn link' },
                { key: 'image', icon: <Image className="w-4 h-4" />, title: 'Chèn ảnh URL' },
              ].map(btn => (
                <button key={btn.key} onClick={() => insertFormat(btn.key)} title={btn.title}
                  className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded transition-colors">
                  {btn.icon}
                </button>
              ))}
              <span className="ml-auto text-xs text-gray-400">{wordCount} từ</span>
            </div>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={12}
              placeholder="Chia sẻ câu chuyện, kinh nghiệm, mẹo mua sắm của bạn...&#10;&#10;Hỗ trợ Markdown: **in đậm**, _in nghiêng_, [link](url)"
              className="w-full border border-t-0 border-gray-200 rounded-b-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none leading-relaxed"
            />
          </div>

          {/* Image upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hình ảnh đính kèm (tối đa 4 ảnh)
            </label>
            <div className="flex gap-3 flex-wrap">
              {images.map((img, i) => (
                <div key={i} className="relative w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center">
                  <span className="text-xs text-gray-400">{img}</span>
                  <button onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {images.length < 4 && (
                <button onClick={mockAddImage}
                  className="w-24 h-24 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-purple-400 hover:text-purple-500 transition-colors">
                  <Upload className="w-6 h-6 mb-1" />
                  <span className="text-xs">Thêm ảnh</span>
                </button>
              )}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (nhấn Enter để thêm)
            </label>
            <div className="flex flex-wrap gap-2 p-3 border border-gray-200 rounded-xl min-h-[48px]">
              {tags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full text-sm">
                  #{tag}
                  <button onClick={() => removeTag(tag)} className="hover:text-red-500 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={addTag}
                placeholder={tags.length === 0 ? 'Thêm tag... (VD: mua sắm, sony, escrow)' : ''}
                className="flex-1 min-w-[120px] text-sm focus:outline-none bg-transparent placeholder-gray-300"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Tối đa 8 tags. {8 - tags.length} tags còn lại.</p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <button className="px-6 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl text-sm font-medium transition-colors">
              Lưu nháp
            </button>
            <div className="flex gap-3">
              <button onClick={() => router.push('/community')}
                className="px-4 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl text-sm font-medium transition-colors">
                Hủy
              </button>
              <button disabled={!isReady}
                onClick={() => router.push('/community')}
                className="px-8 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white rounded-xl text-sm font-bold transition-colors">
                Đăng bài
              </button>
            </div>
          </div>

          {!isReady && (
            <p className="text-xs text-gray-400 text-center">
              {!title.trim() ? '⚠️ Chưa có tiêu đề' : !category ? '⚠️ Chưa chọn danh mục' : '⚠️ Nội dung quá ngắn (tối thiểu 50 ký tự)'}
            </p>
          )}
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div className="border-l pl-6 space-y-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase">Preview</h3>
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              {category && (
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">{category}</span>
              )}
              <h2 className="text-lg font-bold text-gray-900 mt-2 mb-3">{title || 'Tiêu đề bài viết...'}</h2>
              <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {content || <span className="text-gray-300 italic">Nội dung bài viết sẽ hiển thị ở đây...</span>}
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {tags.map(t => (
                    <span key={t} className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">#{t}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

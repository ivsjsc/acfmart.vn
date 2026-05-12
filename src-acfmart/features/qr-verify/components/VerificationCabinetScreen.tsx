import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck, AlertTriangle, CheckCircle, Clock, Search, Trash2, Copy, Calendar, Package } from 'lucide-react'
import { QRVerificationService } from '../qr-service'
import { cn } from '../../../lib/cn'
import { formatDateTime } from '../../../lib/format'

interface CabinetItem {
  isValid: boolean
  productId: string
  productName: string
  brand: string
  manufacturingDate: string
  batchNumber: string
  isCounterfeit: boolean
  authenticityScore: number
  verificationDate: string
  additionalInfo?: string
  notes?: string
  addedAt: string
}

export default function VerificationCabinetScreen() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'authentic' | 'counterfeit' | 'suspicious'>('all')
  
  const items: CabinetItem[] = QRVerificationService.getCabinetItems()
  
  const filteredItems = items.filter(item => {
    const matchesSearch = 
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.productId.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (filter === 'authentic') return item.authenticityScore >= 80 && !item.isCounterfeit
    if (filter === 'counterfeit') return item.isCounterfeit
    if (filter === 'suspicious') return item.authenticityScore < 80 && !item.isCounterfeit
    return matchesSearch
  })

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="container-acf py-4 lg:py-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-900">Tủ xác thực cá nhân</h1>
          <p className="text-sm text-neutral-600">
            Quản lý các sản phẩm đã xác thực qua mã QR
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-brand-red-600">{items.length}</div>
            <div className="text-xs text-neutral-500">Tổng sản phẩm</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-emerald-600">
              {items.filter(i => i.authenticityScore >= 80 && !i.isCounterfeit).length}
            </div>
            <div className="text-xs text-neutral-500">Chính hãng</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-amber-600">
              {items.filter(i => i.authenticityScore < 80 && !i.isCounterfeit).length}
            </div>
            <div className="text-xs text-neutral-500">Nghi vấn</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-rose-600">
              {items.filter(i => i.isCounterfeit).length}
            </div>
            <div className="text-xs text-neutral-500">Hàng giả</div>
          </div>
        </div>

        {/* Controls */}
        <div className="card mb-4 p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-red-500 focus:border-brand-red-500"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-red-500 focus:border-brand-red-500"
              >
                <option value="all">Tất cả</option>
                <option value="authentic">Chính hãng</option>
                <option value="suspicious">Nghi vấn</option>
                <option value="counterfeit">Hàng giả</option>
              </select>
              
              <Link to="/qr-verify" className="btn-primary">
                <ShieldCheck size={16} />
                Quét mới
              </Link>
            </div>
          </div>
        </div>

        {/* Items list */}
        {filteredItems.length === 0 ? (
          <div className="card flex flex-col items-center justify-center py-12 text-center">
            <Package size={48} className="text-neutral-300 mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900">Chưa có sản phẩm nào</h3>
            <p className="text-sm text-neutral-500 mt-1">
              Quét mã QR của sản phẩm để thêm vào tủ xác thực
            </p>
            <Link to="/qr-verify" className="btn-primary mt-4">
              Quét sản phẩm mới
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item, index) => (
              <div 
                key={`${item.productId}-${index}`} 
                className={cn(
                  "card overflow-hidden",
                  item.isCounterfeit 
                    ? "border-rose-200 bg-rose-50" 
                    : item.authenticityScore < 80
                      ? "border-amber-200 bg-amber-50"
                      : "border-emerald-200 bg-emerald-50"
                )}
              >
                <div className="p-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className={cn(
                      "p-3 rounded-lg flex items-center justify-center",
                      item.isCounterfeit 
                        ? "bg-rose-100 text-rose-700" 
                        : item.authenticityScore < 80
                          ? "bg-amber-100 text-amber-700"
                          : "bg-emerald-100 text-emerald-700"
                    )}>
                      {item.isCounterfeit ? (
                        <AlertTriangle size={24} />
                      ) : item.authenticityScore < 80 ? (
                        <AlertTriangle size={24} />
                      ) : (
                        <CheckCircle size={24} />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h3 className="font-bold text-neutral-900 truncate">{item.productName}</h3>
                        <span className={cn(
                          "text-xs font-bold px-2 py-0.5 rounded-full",
                          item.isCounterfeit 
                            ? "bg-rose-100 text-rose-700" 
                            : item.authenticityScore < 80
                              ? "bg-amber-100 text-amber-700"
                              : "bg-emerald-100 text-emerald-700"
                        )}>
                          {item.isCounterfeit 
                            ? "HÀNG GIẢ" 
                            : item.authenticityScore < 80
                              ? "NHIỀU VẤN ĐỀ"
                              : "CHÍNH HÃNG"}
                        </span>
                      </div>
                      
                      <div className="text-sm text-neutral-600 mt-0.5">{item.brand}</div>
                      
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                        <div>
                          <div className="text-xs text-neutral-500">Mã sản phẩm</div>
                          <div className="flex items-center gap-1">
                            <span className="truncate">{item.productId}</span>
                            <button 
                              onClick={() => copyToClipboard(item.productId)}
                              className="text-neutral-400 hover:text-brand-red-600"
                              title="Sao chép"
                            >
                              <Copy size={12} />
                            </button>
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-xs text-neutral-500">Độ chính hãng</div>
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-neutral-200 rounded-full h-2">
                              <div 
                                className={cn(
                                  "h-2 rounded-full",
                                  item.authenticityScore < 50 
                                    ? 'bg-rose-500' 
                                    : item.authenticityScore < 80 
                                      ? 'bg-amber-500' 
                                      : 'bg-emerald-500'
                                )}
                                style={{ width: `${item.authenticityScore}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-medium">{item.authenticityScore}%</span>
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-xs text-neutral-500">Xác thực lúc</div>
                          <div className="flex items-center gap-1">
                            <Clock size={12} className="text-neutral-400" />
                            <span>{formatDateTime(item.verificationDate)}</span>
                          </div>
                        </div>
                      </div>
                      
                      {item.notes && (
                        <div className="mt-3 text-sm p-2 bg-neutral-100 rounded-lg">
                          <div className="text-xs text-neutral-500">Ghi chú</div>
                          <div>{item.notes}</div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <Link 
                        to={`/products/${item.productId}`} 
                        className="btn-secondary text-xs"
                      >
                        Chi tiết
                      </Link>
                      <button 
                        className="btn-secondary text-xs flex items-center justify-center gap-1"
                        onClick={() => copyToClipboard(item.productId)}
                      >
                        <Copy size={12} />
                        Sao chép
                      </button>
                    </div>
                  </div>
                  
                  {item.additionalInfo && (
                    <div className={cn(
                      "mt-3 p-3 rounded-lg text-sm",
                      item.isCounterfeit 
                        ? 'bg-rose-100 text-rose-700' 
                        : item.authenticityScore < 80
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                    )}>
                      {item.additionalInfo}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
export function EscrowInfoBox() {
  const items = [
    'Tiền của bạn được giữ an toàn tại ACFMart — không đến tay người bán ngay lập tức',
    'Người bán giao hàng thành công → Bạn kiểm tra sản phẩm',
    'Bạn xác nhận đã nhận hàng → Người bán mới được nhận tiền',
    'Có vấn đề? Khiếu nại trong 7 ngày — hoàn tiền 100%',
  ];

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">🔒</span>
        <h3 className="font-semibold text-blue-900">Bảo vệ thanh toán ACFMart Escrow</h3>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-2 text-sm text-blue-700">
            <span className="text-green-500 mt-0.5 shrink-0">✓</span>
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

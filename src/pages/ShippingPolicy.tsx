import { Truck, Clock, MapPin, Package, CreditCard } from "lucide-react";

export default function ShippingPolicy() {
  return (
    <div className="container-acf py-8 max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 py-6 px-8 text-white">
          <h1 className="text-2xl md:text-3xl font-bold">Chính sách vận chuyển</h1>
          <p className="text-blue-100 mt-2">
            Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}
          </p>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          <div className="prose max-w-none">
            <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
              <Truck className="text-blue-600" size={24} />
              Phạm vi áp dụng
            </h2>
            <p>
              ACFMart cung cấp dịch vụ vận chuyển trên toàn quốc với hơn 63 tỉnh thành. Chúng tôi phối 
              hợp với các đơn vị vận chuyển uy tín để đảm bảo giao hàng nhanh chóng, an toàn và đúng hẹn.
            </p>
          </div>

          <div className="prose max-w-none">
            <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
              <Clock className="text-blue-600" size={24} />
              Thời gian giao hàng
            </h2>
            <p>Thời gian giao hàng dự kiến:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Khu vực nội thành:</strong> 1-2 ngày làm việc</li>
              <li><strong>Khu vực ngoại thành:</strong> 2-3 ngày làm việc</li>
              <li><strong>Khu vực tỉnh thành khác:</strong> 3-5 ngày làm việc</li>
              <li><strong>Vùng sâu vùng xa:</strong> 5-7 ngày làm việc</li>
            </ul>
            <p className="mt-2">
              Thời gian có thể kéo dài hơn trong các dịp lễ Tết, thời tiết xấu hoặc các tình huống bất khả kháng.
            </p>
          </div>

          <div className="prose max-w-none">
            <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
              <MapPin className="text-blue-600" size={24} />
              Địa điểm giao hàng
            </h2>
            <p>Chúng tôi giao hàng đến:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Nhà riêng, văn phòng, trường học hoặc bất kỳ địa điểm nào bạn yêu cầu</li>
              <li>Điểm nhận hàng tiện lợi do bạn chỉ định</li>
              <li>Các tỉnh thành trên toàn quốc (trừ một số khu vực đặc biệt theo quy định pháp luật)</li>
            </ul>
          </div>

          <div className="prose max-w-none">
            <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
              <Package className="text-blue-600" size={24} />
              Đóng gói và bảo quản
            </h2>
            <p>Chúng tôi cam kết:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Đóng gói sản phẩm cẩn thận, an toàn trong suốt quá trình vận chuyển</li>
              <li>Sử dụng vật liệu đóng gói thân thiện với môi trường</li>
              <li>Bảo quản sản phẩm theo đúng yêu cầu đặc biệt (nhiệt độ, độ ẩm, ánh sáng...)</li>
              <li>Không để sản phẩm tiếp xúc trực tiếp với môi trường không phù hợp</li>
            </ul>
          </div>

          <div className="prose max-w-none">
            <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
              <CreditCard className="text-blue-600" size={24} />
              Phí vận chuyển
            </h2>
            <p>Phí vận chuyển được tính theo:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Khối lượng và kích thước của sản phẩm</li>
              <li>Khoảng cách từ kho đến địa điểm nhận hàng</li>
              <li>Chính sách ưu đãi vận chuyển của từng sản phẩm</li>
              <li>Khuyến mãi phí vận chuyển (nếu có)</li>
            </ul>
            <p className="mt-2">
              Một số sản phẩm được miễn phí vận chuyển theo chính sách của nhà bán hoặc chương trình khuyến mãi.
            </p>
          </div>

          <div className="prose max-w-none">
            <h2 className="text-xl font-bold text-neutral-900">Hình thức vận chuyển</h2>
            <p>Chúng tôi cung cấp các hình thức vận chuyển:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Giao hàng tiêu chuẩn:</strong> 3-7 ngày làm việc, áp dụng cho hầu hết các sản phẩm</li>
              <li><strong>Giao hàng nhanh:</strong> Trong ngày hoặc ngày hôm sau, áp dụng cho khu vực nội thành</li>
              <li><strong>Giao hàng siêu tốc:</strong> Trong vòng 2-4 tiếng, áp dụng tại một số khu vực</li>
              <li><strong>Nhận tại điểm giao dịch:</strong> Tiện lợi, an toàn, giảm chi phí vận chuyển</li>
            </ul>
          </div>

          <div className="prose max-w-none">
            <h2 className="text-xl font-bold text-neutral-900">Trách nhiệm trong quá trình vận chuyển</h2>
            <p>
              <strong>ACFMart:</strong> Chịu trách nhiệm đến khi hàng hóa được giao thành công đến người nhận. 
              Trong quá trình vận chuyển, nếu xảy ra hư hỏng, mất mát sản phẩm do lỗi của đơn vị vận chuyển, 
              ACFMart sẽ phối hợp với nhà bán và đơn vị vận chuyển để đền bù thiệt hại cho khách hàng.
            </p>
            <p className="mt-2">
              <strong>Khách hàng:</strong> Có trách nhiệm kiểm tra sản phẩm ngay khi nhận hàng. Nếu phát hiện 
              sản phẩm bị hư hỏng, sai lệch, vui lòng từ chối nhận và báo cáo ngay cho ACFMart.
            </p>
          </div>

          <div className="prose max-w-none">
            <h2 className="text-xl font-bold text-neutral-900">Giao hàng đặc biệt</h2>
            <p>Đối với sản phẩm đặc biệt:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Hàng dễ vỡ:</strong> Đóng gói đặc biệt, dán nhãn cảnh báo</li>
              <li><strong>Hàng điện tử giá trị cao:</strong> Yêu cầu người nhận xuất trình CMND/CCCD khi nhận hàng</li>
              <li><strong>Hàng lạnh/hàng tươi sống:</strong> Vận chuyển trong điều kiện nhiệt độ đặc biệt</li>
              <li><strong>Hàng có hạn sử dụng ngắn:</strong> Ưu tiên giao hàng nhanh</li>
            </ul>
          </div>

          <div className="pt-4 border-t border-neutral-200">
            <h3 className="font-bold text-neutral-900">Liên hệ hỗ trợ</h3>
            <p className="mt-2">
              Mọi thắc mắc về chính sách vận chuyển, vui lòng liên hệ:
              <br />
              <strong>Hotline:</strong> 1900-xxx-xxxx (8:00 - 21:00 hàng ngày)
              <br />
              <strong>Email:</strong> shipping@acfmart.vn
              <br />
              <strong>Địa chỉ:</strong> Văn phòng ACFMart, Việt Nam
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
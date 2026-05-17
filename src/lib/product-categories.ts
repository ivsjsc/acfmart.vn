export interface ProductCategoryOption {
  label: string
  group: string
  keywords?: string[]
}

const RAW_PRODUCT_CATEGORIES: Array<[string, string, string[]?]> = [
  ["Mỹ phẩm", "Chăm sóc sắc đẹp"],
  ["Mỹ phẩm > Chăm sóc da mặt", "Chăm sóc sắc đẹp", ["skincare", "da mặt"]],
  ["Mỹ phẩm > Sữa rửa mặt", "Chăm sóc sắc đẹp", ["cleanser"]],
  ["Mỹ phẩm > Toner / Nước hoa hồng", "Chăm sóc sắc đẹp"],
  ["Mỹ phẩm > Serum / Tinh chất", "Chăm sóc sắc đẹp"],
  ["Mỹ phẩm > Kem dưỡng da", "Chăm sóc sắc đẹp"],
  ["Mỹ phẩm > Kem chống nắng", "Chăm sóc sắc đẹp", ["spf"]],
  ["Mỹ phẩm > Mặt nạ", "Chăm sóc sắc đẹp"],
  ["Mỹ phẩm > Trang điểm mặt", "Chăm sóc sắc đẹp", ["makeup"]],
  ["Mỹ phẩm > Trang điểm mắt", "Chăm sóc sắc đẹp"],
  ["Mỹ phẩm > Son môi", "Chăm sóc sắc đẹp"],
  ["Mỹ phẩm > Tẩy trang", "Chăm sóc sắc đẹp"],
  ["Mỹ phẩm > Chăm sóc tóc", "Chăm sóc sắc đẹp"],
  ["Mỹ phẩm > Nước hoa", "Chăm sóc sắc đẹp"],
  ["Mỹ phẩm > Dụng cụ làm đẹp", "Chăm sóc sắc đẹp"],
  ["Chăm sóc cá nhân", "Chăm sóc sắc đẹp"],
  ["Chăm sóc cá nhân > Sữa tắm", "Chăm sóc sắc đẹp"],
  ["Chăm sóc cá nhân > Dầu gội / Dầu xả", "Chăm sóc sắc đẹp"],
  ["Chăm sóc cá nhân > Khử mùi", "Chăm sóc sắc đẹp"],
  ["Chăm sóc cá nhân > Chăm sóc răng miệng", "Chăm sóc sắc đẹp"],
  ["Chăm sóc cá nhân > Băng vệ sinh / Chăm sóc phụ nữ", "Chăm sóc sắc đẹp"],

  ["Thời trang", "Thời trang"],
  ["Thời trang > Nữ", "Thời trang"],
  ["Thời trang > Nam", "Thời trang"],
  ["Thời trang > Trẻ em", "Thời trang"],
  ["Thời trang > Áo thun", "Thời trang"],
  ["Thời trang > Áo sơ mi", "Thời trang"],
  ["Thời trang > Áo khoác", "Thời trang"],
  ["Thời trang > Quần dài", "Thời trang"],
  ["Thời trang > Váy / Đầm", "Thời trang"],
  ["Thời trang > Đồ công sở", "Thời trang"],
  ["Thời trang > Đồ thể thao", "Thời trang"],
  ["Thời trang > Đồ lót", "Thời trang"],
  ["Giày dép", "Thời trang"],
  ["Giày dép > Giày thể thao", "Thời trang"],
  ["Giày dép > Giày da", "Thời trang"],
  ["Giày dép > Sandal / Dép", "Thời trang"],
  ["Túi ví", "Thời trang"],
  ["Túi ví > Túi xách", "Thời trang"],
  ["Túi ví > Ví", "Thời trang"],
  ["Phụ kiện thời trang", "Thời trang"],
  ["Phụ kiện thời trang > Đồng hồ", "Thời trang"],
  ["Phụ kiện thời trang > Kính mắt", "Thời trang"],
  ["Phụ kiện thời trang > Trang sức", "Thời trang"],

  ["Điện tử", "Điện tử - Công nghệ"],
  ["Điện tử > Điện thoại", "Điện tử - Công nghệ"],
  ["Điện tử > Máy tính bảng", "Điện tử - Công nghệ"],
  ["Điện tử > Laptop", "Điện tử - Công nghệ"],
  ["Điện tử > Máy tính để bàn", "Điện tử - Công nghệ"],
  ["Điện tử > Màn hình", "Điện tử - Công nghệ"],
  ["Điện tử > Linh kiện máy tính", "Điện tử - Công nghệ"],
  ["Điện tử > Thiết bị mạng", "Điện tử - Công nghệ"],
  ["Điện tử > Thiết bị lưu trữ", "Điện tử - Công nghệ"],
  ["Điện tử > Máy ảnh / Máy quay", "Điện tử - Công nghệ"],
  ["Điện tử > Camera an ninh", "Điện tử - Công nghệ"],
  ["Điện tử > Máy chơi game", "Điện tử - Công nghệ"],
  ["Phụ kiện điện tử", "Điện tử - Công nghệ"],
  ["Phụ kiện điện tử > Tai nghe", "Điện tử - Công nghệ"],
  ["Phụ kiện điện tử > Loa", "Điện tử - Công nghệ"],
  ["Phụ kiện điện tử > Sạc / Cáp", "Điện tử - Công nghệ"],
  ["Phụ kiện điện tử > Ốp lưng / Dán màn hình", "Điện tử - Công nghệ"],
  ["Phụ kiện điện tử > Bàn phím / Chuột", "Điện tử - Công nghệ"],
  ["Phụ kiện điện tử > Pin dự phòng", "Điện tử - Công nghệ"],
  ["Thiết bị thông minh", "Điện tử - Công nghệ"],
  ["Thiết bị thông minh > Smartwatch", "Điện tử - Công nghệ"],
  ["Thiết bị thông minh > Nhà thông minh", "Điện tử - Công nghệ"],

  ["Gia dụng", "Nhà cửa - Đời sống"],
  ["Gia dụng > Đồ dùng nhà bếp", "Nhà cửa - Đời sống"],
  ["Gia dụng > Nồi / Chảo", "Nhà cửa - Đời sống"],
  ["Gia dụng > Chén dĩa / Ly tách", "Nhà cửa - Đời sống"],
  ["Gia dụng > Dụng cụ vệ sinh", "Nhà cửa - Đời sống"],
  ["Gia dụng > Thiết bị điện gia dụng", "Nhà cửa - Đời sống"],
  ["Gia dụng > Máy lọc không khí", "Nhà cửa - Đời sống"],
  ["Gia dụng > Máy hút bụi", "Nhà cửa - Đời sống"],
  ["Gia dụng > Bàn ủi / Máy sấy", "Nhà cửa - Đời sống"],
  ["Nhà cửa", "Nhà cửa - Đời sống"],
  ["Nhà cửa > Nội thất", "Nhà cửa - Đời sống"],
  ["Nhà cửa > Trang trí nhà", "Nhà cửa - Đời sống"],
  ["Nhà cửa > Chăn ga gối nệm", "Nhà cửa - Đời sống"],
  ["Nhà cửa > Đèn chiếu sáng", "Nhà cửa - Đời sống"],
  ["Nhà cửa > Sửa chữa nhà cửa", "Nhà cửa - Đời sống"],
  ["Sân vườn", "Nhà cửa - Đời sống"],
  ["Sân vườn > Cây cảnh", "Nhà cửa - Đời sống"],
  ["Sân vườn > Dụng cụ làm vườn", "Nhà cửa - Đời sống"],

  ["Thực phẩm", "Thực phẩm - Đồ uống"],
  ["Thực phẩm > Đồ khô", "Thực phẩm - Đồ uống"],
  ["Thực phẩm > Gạo / Ngũ cốc", "Thực phẩm - Đồ uống"],
  ["Thực phẩm > Gia vị", "Thực phẩm - Đồ uống"],
  ["Thực phẩm > Bánh kẹo", "Thực phẩm - Đồ uống"],
  ["Thực phẩm > Đồ hộp", "Thực phẩm - Đồ uống"],
  ["Thực phẩm > Thực phẩm tươi sống", "Thực phẩm - Đồ uống"],
  ["Thực phẩm > Thực phẩm đông lạnh", "Thực phẩm - Đồ uống"],
  ["Thực phẩm > Thực phẩm hữu cơ", "Thực phẩm - Đồ uống"],
  ["Đồ uống", "Thực phẩm - Đồ uống"],
  ["Đồ uống > Cà phê", "Thực phẩm - Đồ uống"],
  ["Đồ uống > Trà", "Thực phẩm - Đồ uống"],
  ["Đồ uống > Nước giải khát", "Thực phẩm - Đồ uống"],
  ["Đồ uống > Sữa", "Thực phẩm - Đồ uống"],
  ["Đồ uống > Đồ uống có cồn", "Thực phẩm - Đồ uống", ["rượu", "bia", "alcohol"]],

  ["Sức khoẻ", "Sức khỏe"],
  ["Sức khoẻ > Thực phẩm chức năng", "Sức khỏe"],
  ["Sức khoẻ > Vitamin / Khoáng chất", "Sức khỏe"],
  ["Sức khoẻ > Thiết bị y tế gia đình", "Sức khỏe"],
  ["Sức khoẻ > Chăm sóc người lớn tuổi", "Sức khỏe"],
  ["Sức khoẻ > Dụng cụ sơ cứu", "Sức khỏe"],
  ["Sức khoẻ > Khẩu trang / Bảo hộ", "Sức khỏe"],
  ["Sức khoẻ > Sản phẩm sinh lý", "Sức khỏe"],

  ["Mẹ & Bé", "Mẹ và bé"],
  ["Mẹ & Bé > Sữa bột / Dinh dưỡng", "Mẹ và bé"],
  ["Mẹ & Bé > Bỉm / Tã", "Mẹ và bé"],
  ["Mẹ & Bé > Đồ dùng cho bé", "Mẹ và bé"],
  ["Mẹ & Bé > Thời trang bé", "Mẹ và bé"],
  ["Mẹ & Bé > Đồ chơi trẻ em", "Mẹ và bé"],
  ["Mẹ & Bé > Xe đẩy / Ghế ăn", "Mẹ và bé"],
  ["Mẹ & Bé > Chăm sóc mẹ bầu", "Mẹ và bé"],

  ["Sách", "Sách - Văn phòng phẩm"],
  ["Sách > Sách kinh tế", "Sách - Văn phòng phẩm"],
  ["Sách > Sách kỹ năng", "Sách - Văn phòng phẩm"],
  ["Sách > Sách thiếu nhi", "Sách - Văn phòng phẩm"],
  ["Sách > Giáo trình / Tham khảo", "Sách - Văn phòng phẩm"],
  ["Sách > Truyện tranh", "Sách - Văn phòng phẩm"],
  ["Văn phòng phẩm", "Sách - Văn phòng phẩm"],
  ["Văn phòng phẩm > Bút / Viết", "Sách - Văn phòng phẩm"],
  ["Văn phòng phẩm > Giấy / Sổ", "Sách - Văn phòng phẩm"],
  ["Văn phòng phẩm > Máy văn phòng", "Sách - Văn phòng phẩm"],
  ["Văn phòng phẩm > Dụng cụ học tập", "Sách - Văn phòng phẩm"],

  ["Thể thao", "Thể thao - Du lịch"],
  ["Thể thao > Dụng cụ tập luyện", "Thể thao - Du lịch"],
  ["Thể thao > Thời trang thể thao", "Thể thao - Du lịch"],
  ["Thể thao > Giày thể thao", "Thể thao - Du lịch"],
  ["Thể thao > Xe đạp", "Thể thao - Du lịch"],
  ["Thể thao > Dã ngoại", "Thể thao - Du lịch"],
  ["Du lịch", "Thể thao - Du lịch"],
  ["Du lịch > Vali / Balo", "Thể thao - Du lịch"],
  ["Du lịch > Phụ kiện du lịch", "Thể thao - Du lịch"],

  ["Ô tô - Xe máy", "Xe - Phụ kiện"],
  ["Ô tô - Xe máy > Phụ kiện ô tô", "Xe - Phụ kiện"],
  ["Ô tô - Xe máy > Phụ tùng ô tô", "Xe - Phụ kiện"],
  ["Ô tô - Xe máy > Phụ kiện xe máy", "Xe - Phụ kiện"],
  ["Ô tô - Xe máy > Phụ tùng xe máy", "Xe - Phụ kiện"],
  ["Ô tô - Xe máy > Dầu nhớt", "Xe - Phụ kiện"],
  ["Ô tô - Xe máy > Mũ bảo hiểm", "Xe - Phụ kiện"],

  ["Đồ chơi", "Giải trí - Sở thích"],
  ["Đồ chơi > Đồ chơi giáo dục", "Giải trí - Sở thích"],
  ["Đồ chơi > Mô hình", "Giải trí - Sở thích"],
  ["Đồ chơi > Boardgame", "Giải trí - Sở thích"],
  ["Thú cưng", "Giải trí - Sở thích"],
  ["Thú cưng > Thức ăn thú cưng", "Giải trí - Sở thích"],
  ["Thú cưng > Phụ kiện thú cưng", "Giải trí - Sở thích"],
  ["Nhạc cụ", "Giải trí - Sở thích"],
  ["Sưu tầm", "Giải trí - Sở thích"],

  ["Dịch vụ", "Dịch vụ"],
  ["Dịch vụ > Voucher dịch vụ", "Dịch vụ"],
  ["Dịch vụ > Khóa học", "Dịch vụ"],
  ["Dịch vụ > Tư vấn", "Dịch vụ"],
  ["Khác / Chưa phân loại", "Khác"],
]

export const PRODUCT_CATEGORIES: ProductCategoryOption[] = RAW_PRODUCT_CATEGORIES.map(
  ([label, group, keywords]) => ({ label, group, keywords })
)

export const DEFAULT_PRODUCT_CATEGORY = "Khác / Chưa phân loại"

export function normalizeCategorySearch(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s>/&-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

export function findCategoryOption(label: string) {
  const normalized = normalizeCategorySearch(label)
  return PRODUCT_CATEGORIES.find(
    (category) => normalizeCategorySearch(category.label) === normalized
  )
}

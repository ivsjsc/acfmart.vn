import { Product, Order, ShopProfile } from '../store';


export const sampleProducts: Omit<Product, 'id'>[] = [
  {
    name: 'iPhone 15 Pro Max 256GB Chính hãng VN/A',
    price: 26990000,
    shopId: 'shop1',
    status: 'approved',
    image: 'https://images.unsplash.com/photo-1702404329845-a1d4d5c3dd?q=80&w=1887&auto=format&fit=crop',
    origin: 'domestic',
    category: 'Điện thoại',
    description: 'iPhone 15 Pro Max với chip A17 Pro, camera 48MP, thiết kế titan',
    labelInfo: {
      brandName: 'Apple',
      manufacturerName: 'Apple Inc.',
      manufacturerAddress: 'Cupertino, California, USA',
      originCountry: 'Việt Nam',
      quantityMeasurement: '1 chiếc',
      batchNumber: 'BP15PM256VN',
      productionDate: new Date('2023-09-15'),
      expiryDate: null,
      barcode: '8801234567890',
      ingredientsOrComponents: 'Aluminum, Glass, Electronic Components',
      usageInstructions: 'Sử dụng pin lithium, tránh va đập mạnh',
      storageInstructions: 'Bảo quản nơi khô ráo, tránh ánh nắng trực tiếp',
      warningInformation: 'Không ngâm nước, chỉ chuyên gia mới được tháo máy'
    },
    commercialInfo: {
      basePrice: 26990000,
      promotionalPrice: 25990000,
      weight: 221, // grams
      dimensions: {
        length: 147.6,
        width: 70.6,
        height: 8.25
      },
      deliveryTimeEstimate: '1-2 ngày',
      shippingCost: 0,
      warrantyInfo: {
        duration: '1 năm',
        conditions: 'Đổi mới trong 7 ngày đầu, bảo hành chính hãng',
        servicePoints: ['Hà Nội', 'TP.HCM', 'Đà Nẵng']
      },
      exchangePolicy: {
        policy: 'Đổi trả miễn phí',
        days: 7
      }
    },
    qualityInfo: {
      standardsApplied: 'ISO 9001, RoHS',
      certificateOfQualityUrl: 'https://example.com/certificates/iphone15pro',
      testResultUrl: 'https://example.com/test-results/iphone15pro',
      conformityCertificateUrl: 'https://example.com/conformity-cert/iphone15pro'
    },
    verificationInfo: {
      verifiedByAcf: true,
      verificationDate: new Date('2023-09-25'),
      verificationDocumentUrls: ['https://example.com/verifications/iphone15pro']
    }
  },
  {
    name: 'Samsung Galaxy S24 Ultra 5G 512GB',
    price: 28990000,
    shopId: 'shop2',
    status: 'approved',
    image: 'https://images.unsplash.com/photo-1702404329845-a1d4d5c3c4dd?q=80&w=1887&auto=format&fit=crop',
    origin: 'imported',
    category: 'Điện thoại',
    description: 'Samsung Galaxy S24 Ultra với S Pen, camera 200MP',
    labelInfo: {
      brandName: 'Samsung',
      manufacturerName: 'Samsung Electronics',
      manufacturerAddress: 'Seoul, South Korea',
      originCountry: 'South Korea',
      quantityMeasurement: '1 chiếc',
      batchNumber: 'BS24U512SK',
      productionDate: new Date('2024-01-10'),
      expiryDate: null,
      barcode: '8809876543210',
      ingredientsOrComponents: 'Aluminum, Glass, Electronic Components',
      usageInstructions: 'Sử dụng pin lithium, tránh va đập mạnh',
      storageInstructions: 'Bảo quản nơi khô ráo, tránh ánh nắng trực tiếp',
      warningInformation: 'Không ngâm nước, chỉ chuyên gia mới được tháo máy'
    },
    commercialInfo: {
      basePrice: 28990000,
      promotionalPrice: 27990000,
      weight: 232, // grams
      dimensions: {
        length: 163.4,
        width: 78.1,
        height: 8.6
      },
      deliveryTimeEstimate: '1-2 ngày',
      shippingCost: 0,
      warrantyInfo: {
        duration: '1 năm',
        conditions: 'Đổi mới trong 7 ngày đầu, bảo hành chính hãng',
        servicePoints: ['Hà Nội', 'TP.HCM', 'Đà Nẵng']
      },
      exchangePolicy: {
        policy: 'Đổi trả miễn phí',
        days: 7
      }
    },
    qualityInfo: {
      standardsApplied: 'ISO 9001, CE',
      certificateOfQualityUrl: 'https://example.com/certificates/galaxys24',
      testResultUrl: 'https://example.com/test-results/galaxys24',
      conformityCertificateUrl: 'https://example.com/conformity-cert/galaxys24'
    },
    verificationInfo: {
      verifiedByAcf: true,
      verificationDate: new Date('2024-01-20'),
      verificationDocumentUrls: ['https://example.com/verifications/galaxys24']
    }
  },
  {
    name: 'Áo Polo Nam Premium Cotton',
    price: 495000,
    shopId: 'shop3',
    status: 'approved',
    image: 'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?q=80&w=1887&auto=format&fit=crop',
    origin: 'domestic',
    category: 'Thời trang',
    description: 'Áo polo nam chất liệu cotton 100%, form dáng chuẩn',
    labelInfo: {
      brandName: 'FashionStyle',
      manufacturerName: 'ABC Textile Co.',
      manufacturerAddress: 'District 10, Ho Chi Minh City',
      originCountry: 'Việt Nam',
      quantityMeasurement: '1 cái',
      batchNumber: 'APC202401',
      productionDate: new Date('2024-02-01'),
      expiryDate: null,
      barcode: '8931234567890',
      ingredientsOrComponents: '100% Cotton',
      usageInstructions: 'Giặt máy ở nhiệt độ thường, không dùng thuốc tẩy',
      storageInstructions: 'Tre treo, tránh ẩm mốc',
      warningInformation: 'Co rút nhẹ sau lần giặt đầu tiên'
    },
    commercialInfo: {
      basePrice: 495000,
      promotionalPrice: 395000,
      weight: 200, // grams
      dimensions: {
        length: 65,
        width: 45,
        height: 1
      },
      deliveryTimeEstimate: '2-3 ngày',
      shippingCost: 25000,
      warrantyInfo: {
        duration: 'Đổi trả trong 30 ngày',
        conditions: 'Không giặt ủi, còn nguyên tem mác',
        servicePoints: ['Hà Nội', 'TP.HCM']
      },
      exchangePolicy: {
        policy: 'Đổi size hoặc hoàn tiền',
        days: 30
      }
    },
    qualityInfo: {
      standardsApplied: 'OEKO-TEX Standard 100',
      certificateOfQualityUrl: 'https://example.com/certificates/polo-shirt',
      testResultUrl: 'https://example.com/test-results/polo-shirt',
      conformityCertificateUrl: 'https://example.com/conformity-cert/polo-shirt'
    },
    verificationInfo: {
      verifiedByAcf: true,
      verificationDate: new Date('2024-02-10'),
      verificationDocumentUrls: ['https://example.com/verifications/polo-shirt']
    }
  },
  {
    name: 'Váy Maxi Hoa Nhí nữ',
    price: 650000,
    shopId: 'shop4',
    status: 'approved',
    image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=2073&auto=format&fit=crop',
    origin: 'domestic',
    category: 'Thời trang',
    description: 'Váy maxi hoa nhí thiết kế thanh lịch, chất liệu thoáng mát',
    labelInfo: {
      brandName: 'FashionStyle',
      manufacturerName: 'XYZ Garment Co.',
      manufacturerAddress: 'Tan Binh District, Ho Chi Minh City',
      originCountry: 'Việt Nam',
      quantityMeasurement: '1 cái',
      batchNumber: 'VMHN202402',
      productionDate: new Date('2024-02-15'),
      expiryDate: null,
      barcode: '8930987654321',
      ingredientsOrComponents: '95% Cotton, 5% Spandex',
      usageInstructions: 'Giặt riêng lần đầu, không ngâm lâu trong nước',
      storageInstructions: 'Tre treo, tránh ánh nắng trực tiếp',
      warningInformation: 'Co rút nhẹ sau lần giặt đầu tiên'
    },
    commercialInfo: {
      basePrice: 650000,
      promotionalPrice: 520000,
      weight: 250, // grams
      dimensions: {
        length: 120,
        width: 50,
        height: 1
      },
      deliveryTimeEstimate: '2-3 ngày',
      shippingCost: 25000,
      warrantyInfo: {
        duration: 'Đổi trả trong 30 ngày',
        conditions: 'Không giặt ủi, còn nguyên tem mác',
        servicePoints: ['Hà Nội', 'TP.HCM']
      },
      exchangePolicy: {
        policy: 'Đổi size hoặc hoàn tiền',
        days: 30
      }
    },
    qualityInfo: {
      standardsApplied: 'OEKO-TEX Standard 100',
      certificateOfQualityUrl: 'https://example.com/certificates/maxi-dress',
      testResultUrl: 'https://example.com/test-results/maxi-dress',
      conformityCertificateUrl: 'https://example.com/conformity-cert/maxi-dress'
    },
    verificationInfo: {
      verifiedByAcf: true,
      verificationDate: new Date('2024-02-25'),
      verificationDocumentUrls: ['https://example.com/verifications/maxi-dress']
    }
  },
  {
    name: 'Serum Vitamin C Brightening 20ml',
    price: 450000,
    shopId: 'shop5',
    status: 'pending',
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=2070&auto=format&fit=crop',
    origin: 'imported',
    category: 'Mỹ phẩm',
    description: 'Serum Vitamin C giúp sáng da, mờ thâm nám',
    labelInfo: {
      brandName: 'GlowUp',
      manufacturerName: 'SkinCare International Ltd.',
      manufacturerAddress: 'Tokyo, Japan',
      originCountry: 'Japan',
      quantityMeasurement: '1 lọ 20ml',
      batchNumber: 'SVC2403JP',
      productionDate: new Date('2024-03-01'),
      expiryDate: new Date('2026-03-01'),
      barcode: '4901234567890',
      ingredientsOrComponents: 'Water, Vitamin C (L-Ascorbic Acid), Hyaluronic Acid',
      usageInstructions: 'Sử dụng mỗi tối, tránh ánh nắng sau khi dùng',
      storageInstructions: 'Bảo quản nơi khô ráo, tránh ánh nắng trực tiếp',
      warningInformation: 'Chỉ dùng ngoài da, tránh tiếp xúc với mắt'
    },
    commercialInfo: {
      basePrice: 450000,
      promotionalPrice: null,
      weight: 30, // grams
      dimensions: {
        length: 10,
        width: 3,
        height: 3
      },
      deliveryTimeEstimate: '2-3 ngày',
      shippingCost: 25000,
      warrantyInfo: {
        duration: 'Đổi trả trong 7 ngày nếu lỗi nhà sản xuất',
        conditions: 'Còn nguyên vẹn, chưa mở nắp',
        servicePoints: ['Hà Nội', 'TP.HCM']
      },
      exchangePolicy: {
        policy: 'Đổi trả nếu dị ứng hoặc không phù hợp',
        days: 7
      }
    },
    qualityInfo: {
      standardsApplied: 'FDA Approved, Dermatologist Tested',
      certificateOfQualityUrl: 'https://example.com/certificates/vit-c-serum',
      testResultUrl: 'https://example.com/test-results/vit-c-serum',
      conformityCertificateUrl: undefined
    },
    verificationInfo: {
      verifiedByAcf: false,
      verificationDate: undefined,
      verificationDocumentUrls: []
    }
  },
  {
    name: 'Kem Chống Nắng Anessa SPF50+ PA++++',
    price: 780000,
    shopId: 'shop6',
    status: 'approved',
    image: 'https://images.unsplash.com/photo-1596462502582-5c7f86ef5a09?q=80&w=1965&auto=format&fit=crop',
    origin: 'imported',
    category: 'Mỹ phẩm',
    description: 'Kem chống nắng cao cấp từ Nhật Bản',
    labelInfo: {
      brandName: 'Anessa',
      manufacturerName: 'Shiseido Co.',
      manufacturerAddress: 'Tokyo, Japan',
      originCountry: 'Japan',
      quantityMeasurement: '1 chai 60ml',
      batchNumber: 'ACS50PA4JPN',
      productionDate: new Date('2024-01-10'),
      expiryDate: new Date('2025-01-10'),
      barcode: '4901876543210',
      ingredientsOrComponents: 'Titanium Dioxide, Zinc Oxide, UV Filters',
      usageInstructions: 'Thoa đều lên da trước khi ra nắng 15 phút',
      storageInstructions: 'Bảo quản nơi khô ráo, tránh ánh nắng trực tiếp',
      warningInformation: 'Ngưng sử dụng nếu da bị kích ứng'
    },
    commercialInfo: {
      basePrice: 780000,
      promotionalPrice: 690000,
      weight: 80, // grams
      dimensions: {
        length: 12,
        width: 6,
        height: 6
      },
      deliveryTimeEstimate: '2-3 ngày',
      shippingCost: 25000,
      warrantyInfo: {
        duration: 'Đổi trả trong 7 ngày nếu lỗi nhà sản xuất',
        conditions: 'Còn nguyên vẹn, chưa mở nắp',
        servicePoints: ['Hà Nội', 'TP.HCM']
      },
      exchangePolicy: {
        policy: 'Đổi trả nếu dị ứng hoặc không phù hợp',
        days: 7
      }
    },
    qualityInfo: {
      standardsApplied: 'FDA Approved, Dermatologist Tested',
      certificateOfQualityUrl: 'https://example.com/certificates/anessa-spf50',
      testResultUrl: 'https://example.com/test-results/anessa-spf50',
      conformityCertificateUrl: 'https://example.com/conformity-cert/anessa-spf50'
    },
    verificationInfo: {
      verifiedByAcf: true,
      verificationDate: new Date('2024-01-20'),
      verificationDocumentUrls: ['https://example.com/verifications/anessa-spf50']
    }
  },
  {
    name: 'Bàn Ghế Văn Phòng Hiện Đại',
    price: 3200000,
    shopId: 'shop7',
    status: 'approved',
    image: 'https://images.unsplash.com/photo-1503602642458-232111445657?q=80&w=2070&auto=format&fit=crop',
    origin: 'domestic',
    category: 'Nội thất',
    description: 'Bộ bàn ghế văn phòng thiết kế hiện đại, ergonomics',
    labelInfo: {
      brandName: 'HomeOffice',
      manufacturerName: 'Furniture Manufacturing Co.',
      manufacturerAddress: 'Bien Hoa, Dong Nai',
      originCountry: 'Việt Nam',
      quantityMeasurement: '1 bộ',
      batchNumber: 'BGVP202403',
      productionDate: new Date('2024-03-10'),
      expiryDate: null,
      barcode: '8935432109876',
      ingredientsOrComponents: 'MDF Wood, Metal Frame, Leather PU',
      usageInstructions: 'Dùng trong môi trường văn phòng, không phơi ngoài trời',
      storageInstructions: 'Lắp ráp theo hướng dẫn, tránh va đập mạnh',
      warningInformation: 'Không tải trọng quá 100kg, tránh lửa'
    },
    commercialInfo: {
      basePrice: 3200000,
      promotionalPrice: 2880000,
      weight: 15000, // grams
      dimensions: {
        length: 120,
        width: 60,
        height: 75
      },
      deliveryTimeEstimate: '3-5 ngày',
      shippingCost: 150000,
      warrantyInfo: {
        duration: '2 năm',
        conditions: 'Bảo hành lỗi kỹ thuật, không bảo hành do lỗi sử dụng',
        servicePoints: ['Hà Nội', 'TP.HCM', 'Đà Nẵng']
      },
      exchangePolicy: {
        policy: 'Đổi trả trong 30 ngày nếu lỗi sản phẩm',
        days: 30
      }
    },
    qualityInfo: {
      standardsApplied: 'ISO 9001, GREENGUARD Certified',
      certificateOfQualityUrl: 'https://example.com/certificates/modern-desk-chair',
      testResultUrl: 'https://example.com/test-results/modern-desk-chair',
      conformityCertificateUrl: 'https://example.com/conformity-cert/modern-desk-chair'
    },
    verificationInfo: {
      verifiedByAcf: true,
      verificationDate: new Date('2024-03-20'),
      verificationDocumentUrls: ['https://example.com/verifications/modern-desk-chair']
    }
  },
  {
    name: 'Gia Đồ Bếp 5 Món Inox 304',
    price: 890000,
    shopId: 'shop8',
    status: 'pending',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=2070&auto=format&fit=crop',
    origin: 'domestic',
    category: 'Đồ gia dụng',
    description: 'Gia đồ bếp inox 304 cao cấp, bền đẹp',
    labelInfo: {
      brandName: 'KitchenPro',
      manufacturerName: 'Stainless Steel Co.',
      manufacturerAddress: 'Haiphong',
      originCountry: 'Việt Nam',
      quantityMeasurement: 'Bộ 5 món',
      batchNumber: 'GDB5M304HP',
      productionDate: new Date('2024-02-20'),
      expiryDate: null,
      barcode: '8939876543210',
      ingredientsOrComponents: 'Stainless Steel 304',
      usageInstructions: 'An toàn thực phẩm, dùng cho mọi loại bếp',
      storageInstructions: 'Rửa sạch sau sử dụng, để nơi khô ráo',
      warningInformation: 'Không dùng vật sắc nhọn cọ rửa'
    },
    commercialInfo: {
      basePrice: 890000,
      promotionalPrice: 712000,
      weight: 2500, // grams
      dimensions: {
        length: 40,
        width: 30,
        height: 20
      },
      deliveryTimeEstimate: '2-3 ngày',
      shippingCost: 30000,
      warrantyInfo: {
        duration: '1 năm',
        conditions: 'Bảo hành lỗi kỹ thuật, không bảo hành do lỗi sử dụng',
        servicePoints: ['Hà Nội', 'TP.HCM']
      },
      exchangePolicy: {
        policy: 'Đổi trả trong 30 ngày nếu lỗi sản phẩm',
        days: 30
      }
    },
    qualityInfo: {
      standardsApplied: 'Food Grade 304, LFGB Approved',
      certificateOfQualityUrl: 'https://example.com/certificates/stainless-set',
      testResultUrl: 'https://example.com/test-results/stainless-set',
      conformityCertificateUrl: undefined
    },
    verificationInfo: {
      verifiedByAcf: false,
      verificationDate: undefined,
      verificationDocumentUrls: []
    }
  },
  {
    name: 'Giày Chạy Bộ Nike Air Zoom Pegasus 40',
    price: 3299000,
    shopId: 'shop9',
    status: 'approved',
    image: 'https://images.unsplash.com/photo-1600220452121-4f2416e55c28?q=80&w=2034&auto=format&fit=crop',
    origin: 'imported',
    category: 'Thể thao',
    description: 'Giày chạy bộ chuyên nghiệp, đế Zoom Air',
    labelInfo: {
      brandName: 'Nike',
      manufacturerName: 'Nike Inc.',
      manufacturerAddress: 'Beaverton, Oregon, USA',
      originCountry: 'Vietnam',
      quantityMeasurement: '1 đôi',
      batchNumber: 'GNPZ40USVN',
      productionDate: new Date('2023-11-15'),
      expiryDate: null,
      barcode: '196756123456',
      ingredientsOrComponents: 'Synthetic Leather, Rubber Sole, Air Zoom Unit',
      usageInstructions: 'Sử dụng cho chạy bộ và tập luyện',
      storageInstructions: 'Giữ nơi khô ráo, tránh ánh nắng trực tiếp',
      warningInformation: 'Không sử dụng cho các môn thể thao khác'
    },
    commercialInfo: {
      basePrice: 3299000,
      promotionalPrice: 2969000,
      weight: 315, // grams per shoe
      dimensions: {
        length: 30,
        width: 12,
        height: 10
      },
      deliveryTimeEstimate: '2-3 ngày',
      shippingCost: 30000,
      warrantyInfo: {
        duration: '6 tháng',
        conditions: 'Bảo hành keo, đế, không bảo hành do lỗi sử dụng',
        servicePoints: ['Hà Nội', 'TP.HCM', 'Đà Nẵng']
      },
      exchangePolicy: {
        policy: 'Đổi size trong 7 ngày nếu còn nguyên vẹn',
        days: 7
      }
    },
    qualityInfo: {
      standardsApplied: 'Nike Quality Standards',
      certificateOfQualityUrl: 'https://example.com/certificates/nike-pegasus40',
      testResultUrl: 'https://example.com/test-results/nike-pegasus40',
      conformityCertificateUrl: 'https://example.com/conformity-cert/nike-pegasus40'
    },
    verificationInfo: {
      verifiedByAcf: true,
      verificationDate: new Date('2023-11-25'),
      verificationDocumentUrls: ['https://example.com/verifications/nike-pegasus40']
    }
  },
  {
    name: 'Vitamin C Nature Made 1000mg',
    price: 420000,
    shopId: 'shop10',
    status: 'approved',
    image: 'https://images.unsplash.com/photo-15703342791000-fba02fe67fa7?q=80&w=1931&auto=format&fit=crop',
    origin: 'imported',
    category: 'Sức khỏe',
    description: 'Vitamin C hỗ trợ tăng cường đề kháng',
    labelInfo: {
      brandName: 'Nature Made',
      manufacturerName: 'Otsuka Pharmaceutical',
      manufacturerAddress: 'Tokyo, Japan',
      originCountry: 'USA',
      quantityMeasurement: '1 lọ 100 viên',
      batchNumber: 'VCNM1000US',
      productionDate: new Date('2024-01-05'),
      expiryDate: new Date('2026-01-05'),
      barcode: '37000012345',
      ingredientsOrComponents: 'Vitamin C (Ascorbic Acid) 1000mg',
      usageInstructions: 'Uống 1 viên/ngày sau bữa ăn',
      storageInstructions: 'Bảo quản nơi khô ráo, dưới 30°C',
      warningInformation: 'Không dùng quá liều quy định, hỏi ý kiến bác sĩ khi mang thai'
    },
    commercialInfo: {
      basePrice: 420000,
      promotionalPrice: 378000,
      weight: 150, // grams
      dimensions: {
        length: 8,
        width: 5,
        height: 15
      },
      deliveryTimeEstimate: '2-3 ngày',
      shippingCost: 25000,
      warrantyInfo: {
        duration: 'Đổi trả trong 7 ngày nếu lỗi nhà sản xuất',
        conditions: 'Còn nguyên vẹn, chưa sử dụng',
        servicePoints: ['Hà Nội', 'TP.HCM']
      },
      exchangePolicy: {
        policy: 'Đổi trả nếu có phản ứng phụ bất thường',
        days: 7
      }
    },
    qualityInfo: {
      standardsApplied: 'USP Verified, FDA Approved',
      certificateOfQualityUrl: 'https://example.com/certificates/vit-c-nature-made',
      testResultUrl: 'https://example.com/test-results/vit-c-nature-made',
      conformityCertificateUrl: 'https://example.com/conformity-cert/vit-c-nature-made'
    },
    verificationInfo: {
      verifiedByAcf: true,
      verificationDate: new Date('2024-01-15'),
      verificationDocumentUrls: ['https://example.com/verifications/vit-c-nature-made']
    }
  },
  {
    name: 'Tai nghe Sony WH-1000XM5',
    price: 8490000,
    shopId: 'shop11',
    status: 'approved',
    image: 'https://images.unsplash.com/photo-1606220588911-4a4260c1fdad?q=80&w=2070&auto=format&fit=crop',
    origin: 'imported',
    category: 'Điện tử',
    description: 'Tai nghe chống ồn cao cấp Sony',
    labelInfo: {
      brandName: 'Sony',
      manufacturerName: 'Sony Corporation',
      manufacturerAddress: 'Tokyo, Japan',
      originCountry: 'Japan',
      quantityMeasurement: '1 cái',
      batchNumber: 'TSWHXM5JP',
      productionDate: new Date('2023-12-10'),
      expiryDate: null,
      barcode: '4901234567891',
      ingredientsOrComponents: 'Plastic, Metal, Electronic Components',
      usageInstructions: 'Sạc đầy trước khi sử dụng lần đầu',
      storageInstructions: 'Bảo quản nơi khô ráo, tránh va đập',
      warningInformation: 'Không sử dụng với âm lượng lớn trong thời gian dài'
    },
    commercialInfo: {
      basePrice: 8490000,
      promotionalPrice: 7641000,
      weight: 250, // grams
      dimensions: {
        length: 20,
        width: 18,
        height: 8
      },
      deliveryTimeEstimate: '2-3 ngày',
      shippingCost: 30000,
      warrantyInfo: {
        duration: '1 năm',
        conditions: 'Bảo hành điện tử, không bảo hành do lỗi sử dụng',
        servicePoints: ['Hà Nội', 'TP.HCM', 'Đà Nẵng']
      },
      exchangePolicy: {
        policy: 'Đổi trả trong 7 ngày nếu lỗi sản phẩm',
        days: 7
      }
    },
    qualityInfo: {
      standardsApplied: 'Sony Quality Standards, Hi-Res Audio',
      certificateOfQualityUrl: 'https://example.com/certificates/sony-wh1000xm5',
      testResultUrl: 'https://example.com/test-results/sony-wh1000xm5',
      conformityCertificateUrl: 'https://example.com/conformity-cert/sony-wh1000xm5'
    },
    verificationInfo: {
      verifiedByAcf: true,
      verificationDate: new Date('2023-12-20'),
      verificationDocumentUrls: ['https://example.com/verifications/sony-wh1000xm5']
    }
  },
  {
    name: 'Máy Tính Laptop Dell XPS 13',
    price: 24990000,
    shopId: 'shop12',
    status: 'pending',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=2071&auto=format&fit=crop',
    origin: 'imported',
    category: 'Laptop',
    description: 'Laptop Dell XPS 13 màn hình 4K, Intel Core i7',
    labelInfo: {
      brandName: 'Dell',
      manufacturerName: 'Dell Inc.',
      manufacturerAddress: 'Round Rock, Texas, USA',
      originCountry: 'USA',
      quantityMeasurement: '1 máy',
      batchNumber: 'MLXDPS13US',
      productionDate: new Date('2024-02-01'),
      expiryDate: null,
      barcode: '884116123456',
      ingredientsOrComponents: 'Aluminum, Carbon Fiber, Electronic Components',
      usageInstructions: 'Sạc đúng adapter đi kèm, không tự tháo máy',
      storageInstructions: 'Bảo quản nơi khô ráo, tránh ẩm ướt',
      warningInformation: 'Không sử dụng khi pin bị phồng rộp'
    },
    commercialInfo: {
      basePrice: 24990000,
      promotionalPrice: null,
      weight: 1170, // grams
      dimensions: {
        length: 295.4,
        width: 199.3,
        height: 15.27
      },
      deliveryTimeEstimate: '2-3 ngày',
      shippingCost: 0,
      warrantyInfo: {
        duration: '2 năm',
        conditions: 'Bảo hành phần cứng, không bảo hành phần mềm',
        servicePoints: ['Hà Nội', 'TP.HCM', 'Đà Nẵng', 'Cần Thơ']
      },
      exchangePolicy: {
        policy: 'Đổi trả trong 15 ngày nếu lỗi sản phẩm',
        days: 15
      }
    },
    qualityInfo: {
      standardsApplied: 'Intel Certified, Energy Star',
      certificateOfQualityUrl: 'https://example.com/certificates/dell-xps13',
      testResultUrl: 'https://example.com/test-results/dell-xps13',
      conformityCertificateUrl: undefined
    },
    verificationInfo: {
      verifiedByAcf: false,
      verificationDate: undefined,
      verificationDocumentUrls: []
    }
  }
];

export const sampleOrders: Omit<Order, 'id' | 'date'>[] = [
  {
    productId: 'product1',
    customerId: 'customer1',
    shopId: 'shop1',
    status: 'delivered',
    total: 28990000
  },
  {
    productId: 'product2',
    customerId: 'customer1',
    shopId: 'shop1',
    status: 'shipping',
    total: 32990000
  },
  {
    productId: 'product3',
    customerId: 'customer2',
    shopId: 'shop2',
    status: 'processing',
    total: 299000
  },
  {
    productId: 'product4',
    customerId: 'customer2',
    shopId: 'shop2',
    status: 'pending',
    total: 450000
  },
  {
    productId: 'product5',
    customerId: 'customer3',
    shopId: 'shop3',
    status: 'completed',
    total: 320000
  },
  {
    productId: 'product6',
    customerId: 'customer3',
    shopId: 'shop3',
    status: 'delivered',
    total: 450000
  },
  {
    productId: 'product7',
    customerId: 'customer1',
    shopId: 'shop4',
    status: 'shipping',
    total: 3500000
  },
  {
    productId: 'product8',
    customerId: 'customer2',
    shopId: 'shop4',
    status: 'pending',
    total: 890000
  },
  {
    productId: 'product9',
    customerId: 'customer3',
    shopId: 'shop5',
    status: 'completed',
    total: 3200000
  },
  {
    productId: 'product10',
    customerId: 'customer1',
    shopId: 'shop6',
    status: 'processing',
    total: 450000
  }
];

export const sampleShopProfiles: ShopProfile[] = [
  {
    shopId: 'shop1',
    address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
    warehouseAddress: '456 Lý Thường Kiệt, Quận 10, TP.HCM',
    warehouses: [
      { id: 'wh1', address: '456 Lý Thường Kiệt, Quận 10, TP.HCM', isPrimary: true },
      { id: 'wh2', address: '789 Võ Văn Tần, Quận 3, TP.HCM', isPrimary: false }
    ],
    contactPhone: '0901234567',
    legalDocuments: 'Giấy phép kinh doanh số 123456789',
    shippingProviders: [
      { id: 'sp1', name: 'Giao Hàng Nhanh', apiEndpoint: 'https://api.giaohangnhanh.vn', isActive: true },
      { id: 'sp2', name: 'Viettel Post', apiEndpoint: 'https://api.viettelpost.vn', isActive: true },
      { id: 'sp3', name: 'Giao Hàng Tiết Kiệm', apiEndpoint: 'https://api.giaohangtietkiem.vn', isActive: false }
    ],
    bankAccounts: [
      { id: 'ba1', bankName: 'Vietcombank', accountName: 'Cửa Hàng Điện Tố ABC', accountNumber: '1234567890', isDefault: true },
      { id: 'ba2', bankName: 'Techcombank', accountName: 'Cửa Hàng Điện Tố ABC', accountNumber: '9876543210', isDefault: false }
    ],
    recipientAccounts: [
      { id: 'ra1', name: 'Nguyễn Văn A', bankName: 'Vietcombank', accountNumber: '1111222233', purpose: 'Nhân viên thu ngân' },
      { id: 'ra2', name: 'Trần Thị B', bankName: 'ACB', accountNumber: '4444555566', purpose: 'Cộng tác viên' }
    ],
    bankAccountName: 'Cửa Hàng Điện Tố ABC',
    bankAccountNumber: '1234567890',
    bankName: 'Vietcombank'
  },
  {
    shopId: 'shop2',
    address: '789 Lê Lợi, Quận 5, TP.HCM',
    warehouseAddress: '321 Trần Hưng Đạo, Quận 1, TP.HCM',
    warehouses: [
      { id: 'wh3', address: '321 Trần Hưng Đạo, Quận 1, TP.HCM', isPrimary: true }
    ],
    contactPhone: '0912345678',
    legalDocuments: 'Giấy phép kinh doanh số 987654321',
    shippingProviders: [
      { id: 'sp4', name: 'Giao Hàng Nhanh', apiEndpoint: 'https://api.giaohangnhanh.vn', isActive: true },
      { id: 'sp5', name: 'J&T Express', apiEndpoint: 'https://api.jtexpress.vn', isActive: true }
    ],
    bankAccounts: [
      { id: 'ba3', bankName: 'Techcombank', accountName: 'Thời Trang Fashion', accountNumber: '0987654321', isDefault: true }
    ],
    recipientAccounts: [
      { id: 'ra3', name: 'Lê Văn C', bankName: 'Techcombank', accountNumber: '7777888899', purpose: 'Kế toán' }
    ],
    bankAccountName: 'Thời Trang Fashion',
    bankAccountNumber: '0987654321',
    bankName: 'Techcombank'
  },
  {
    shopId: 'shop3',
    address: '456 Hai Bà Trưng, Quận 3, TP.HCM',
    warehouseAddress: '789 Điện Biên Phủ, Quận 3, TP.HCM',
    warehouses: [
      { id: 'wh4', address: '789 Điện Biên Phủ, Quận 3, TP.HCM', isPrimary: true }
    ],
    contactPhone: '0923456789',
    legalDocuments: 'Giấy phép kinh doanh số 456789123',
    shippingProviders: [
      { id: 'sp6', name: 'Giao Hàng Nhanh', apiEndpoint: 'https://api.giaohangnhanh.vn', isActive: true },
      { id: 'sp7', name: 'Viettel Post', apiEndpoint: 'https://api.viettelpost.vn', isActive: true }
    ],
    bankAccounts: [
      { id: 'ba4', bankName: 'ACB', accountName: 'Mỹ Phẩm Beauty', accountNumber: '4567891230', isDefault: true }
    ],
    recipientAccounts: [
      { id: 'ra4', name: 'Phạm Thị D', bankName: 'ACB', accountNumber: '5555666677', purpose: 'Giao nhận' }
    ],
    bankAccountName: 'Mỹ Phẩm Beauty',
    bankAccountNumber: '4567891230',
    bankName: 'ACB'
  }
];

export const generateSampleData = async (
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>,
  addOrder: (order: Omit<Order, 'id' | 'date'>) => Promise<string | undefined>,
  updateShopProfile: (profile: Partial<ShopProfile>) => Promise<void>
) => {
  try {
    // Add sample products
    for (const product of sampleProducts) {
      await addProduct(product);
    }
    
    // Add sample orders
    for (const order of sampleOrders) {
      await addOrder(order);
    }
    
    // Add sample shop profiles
    for (const profile of sampleShopProfiles) {
      await updateShopProfile(profile);
    }
    
    return true;
  } catch (error) {
    console.error('Error generating sample data:', error);
    return false;
  }
};

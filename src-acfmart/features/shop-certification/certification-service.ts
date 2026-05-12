/**
 * Service for handling shop certification processes
 */

export interface ShopCertificationRequest {
  id: string
  shopId: string
  shopName: string
  ownerName: string
  businessLicense: string
  businessType: string
  contactEmail: string
  contactPhone: string
  address: string
  documents: CertificationDocument[]
  status: 'pending' | 'approved' | 'rejected' | 'under_review'
  requestedAt: string
  reviewedAt?: string
  notes?: string
}

export interface CertificationDocument {
  id: string
  type: 'business_license' | 'tax_certificate' | 'brand_authorization' | 'product_certification' | 'other'
  fileName: string
  filePath: string
  uploadedAt: string
  verified: boolean
}

export interface CertificationRequirements {
  requiredDocuments: Array<{
    type: string
    name: string
    description: string
    required: boolean
  }>
  businessTypes: Array<{
    id: string
    name: string
    description: string
  }>
  certificationLevels: Array<{
    id: string
    name: string
    benefits: string[]
    requirements: string[]
  }>
}

export class ShopCertificationService {
  /**
   * Get certification requirements for different business types
   */
  static getRequirements(): CertificationRequirements {
    return {
      requiredDocuments: [
        {
          type: 'business_license',
          name: 'Giấy phép kinh doanh',
          description: 'Bản sao có công chứng giấy phép kinh doanh',
          required: true
        },
        {
          type: 'tax_certificate',
          name: 'Giấy chứng nhận thuế',
          description: 'Mã số thuế doanh nghiệp',
          required: true
        },
        {
          type: 'brand_authorization',
          name: 'Ủy quyền thương hiệu',
          description: 'Giấy ủy quyền phân phối từ thương hiệu (nếu có)',
          required: false
        },
        {
          type: 'product_certification',
          name: 'Chứng nhận sản phẩm',
          description: 'Chứng nhận chất lượng sản phẩm (nếu có)',
          required: false
        },
        {
          type: 'other',
          name: 'Tài liệu khác',
          description: 'Tài liệu bổ sung khác',
          required: false
        }
      ],
      businessTypes: [
        {
          id: 'individual',
          name: 'Cá nhân/Tiệm tạp hóa',
          description: 'Cá nhân kinh doanh nhỏ lẻ'
        },
        {
          id: 'retailer',
          name: 'Cửa hàng bán lẻ',
          description: 'Cửa hàng truyền thống có giấy phép'
        },
        {
          id: 'brand_official',
          name: 'Thương hiệu chính hãng',
          description: 'Thương hiệu hoặc đại lý chính hãng'
        },
        {
          id: 'manufacturer',
          name: 'Nhà sản xuất',
          description: 'Công ty sản xuất sản phẩm'
        }
      ],
      certificationLevels: [
        {
          id: 'basic',
          name: 'Cơ bản',
          benefits: [
            'Hiển thị huy hiệu xác thực',
            'Truy cập kho hàng cơ bản',
            'Hỗ trợ CSKH tiêu chuẩn'
          ],
          requirements: [
            'Cung cấp giấy phép kinh doanh',
            'Xác minh thông tin liên hệ'
          ]
        },
        {
          id: 'silver',
          name: 'Bạc',
          benefits: [
            'Tất cả quyền cơ bản',
            'Ưu đãi phí gian hàng',
            'Khả năng hiển thị cao hơn',
            'Truy cập báo cáo nâng cao'
          ],
          requirements: [
            'Đã bán trên nền tảng 3 tháng',
            'Tỷ lệ hoàn thành đơn hàng > 95%',
            'Đánh giá trung bình > 4.5 sao'
          ]
        },
        {
          id: 'gold',
          name: 'Vàng',
          benefits: [
            'Tất cả quyền bạc',
            'Gian hàng nổi bật',
            'Hỗ trợ chuyên gia',
            'Tham gia chương trình khuyến mãi đặc biệt'
          ],
          requirements: [
            'Được cấp chứng nhận thương hiệu chính hãng',
            'Doanh thu đạt mức quy định',
            'Không vi phạm chính sách'
          ]
        }
      ]
    }
  }

  /**
   * Submit a certification request
   */
  static async submitCertificationRequest(
    shopId: string,
    data: Omit<ShopCertificationRequest, 'id' | 'status' | 'requestedAt'>
  ): Promise<{ success: boolean; requestId?: string; error?: string }> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Validate required fields
    if (!shopId || !data.businessLicense || !data.ownerName) {
      return {
        success: false,
        error: 'Vui lòng cung cấp đầy đủ thông tin bắt buộc'
      }
    }

    // In a real implementation, this would send the request to the backend
    const requestId = `cert_${Date.now()}`

    // Store in localStorage as a mock
    const requests = JSON.parse(localStorage.getItem('certificationRequests') || '[]')
    requests.push({
      ...data,
      id: requestId,
      status: 'pending',
      requestedAt: new Date().toISOString()
    })
    localStorage.setItem('certificationRequests', JSON.stringify(requests))

    return {
      success: true,
      requestId
    }
  }

  /**
   * Get a certification request by ID
   */
  static getCertificationRequest(requestId: string): ShopCertificationRequest | null {
    try {
      const requests = JSON.parse(localStorage.getItem('certificationRequests') || '[]')
      return requests.find((req: ShopCertificationRequest) => req.id === requestId) || null
    } catch (e) {
      console.error('Error retrieving certification request:', e)
      return null
    }
  }

  /**
   * Get certification requests for a shop
   */
  static getCertificationRequestsForShop(shopId: string): ShopCertificationRequest[] {
    try {
      const requests = JSON.parse(localStorage.getItem('certificationRequests') || '[]')
      return requests.filter((req: ShopCertificationRequest) => req.shopId === shopId)
    } catch (e) {
      console.error('Error retrieving certification requests:', e)
      return []
    }
  }

  /**
   * Upload a certification document
   */
  static async uploadDocument(
    requestId: string,
    docType: CertificationDocument['type'],
    file: File
  ): Promise<{ success: boolean; documentId?: string; error?: string }> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800))

    // In a real implementation, this would upload the file to a storage service
    // and save the reference to the document

    const documentId = `doc_${Date.now()}`
    const document: CertificationDocument = {
      id: documentId,
      type: docType,
      fileName: file.name,
      filePath: `/uploads/${documentId}/${file.name}`,
      uploadedAt: new Date().toISOString(),
      verified: false
    }

    // Store in localStorage as a mock
    const storedDocs = JSON.parse(localStorage.getItem('certificationDocuments') || '{}')
    if (!storedDocs[requestId]) {
      storedDocs[requestId] = []
    }
    storedDocs[requestId].push(document)
    localStorage.setItem('certificationDocuments', JSON.stringify(storedDocs))

    return {
      success: true,
      documentId
    }
  }

  /**
   * Get documents for a certification request
   */
  static getDocumentsForRequest(requestId: string): CertificationDocument[] {
    try {
      const storedDocs = JSON.parse(localStorage.getItem('certificationDocuments') || '{}')
      return storedDocs[requestId] || []
    } catch (e) {
      console.error('Error retrieving documents:', e)
      return []
    }
  }
}
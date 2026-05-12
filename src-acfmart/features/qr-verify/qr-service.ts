/**
 * Service for handling QR code verification and counterfeit detection
 */

interface ProductVerificationResult {
  isValid: boolean
  productId: string
  productName: string
  brand: string
  manufacturingDate: string
  batchNumber: string
  isCounterfeit: boolean
  authenticityScore: number // 0-100 percentage
  verificationDate: string
  additionalInfo?: string
  notes?: string
  addedAt: string
}

export class QRVerificationService {
  /**
   * Verifies a product using its QR code
   * @param qrCode The QR code data to verify
   * @returns Verification result with authenticity information
   */
  static async verifyProduct(qrCode: string): Promise<ProductVerificationResult> {
    // In a real implementation, this would call the backend API to verify the QR code
    // For now, we'll simulate the verification
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Validate QR code format (in a real app, this would be more complex)
    if (!qrCode || qrCode.length < 10) {
      throw new Error('Invalid QR code format')
    }
    
    // Mock verification logic
    const isCounterfeit = Math.random() > 0.9 // 10% chance of counterfeit
    const authenticityScore = isCounterfeit ? Math.floor(Math.random() * 30) : Math.floor(70 + Math.random() * 30)
    
    // Generate mock data based on the QR code
    const productId = `prod_${qrCode.substring(0, 8)}`
    const productName = `Sản phẩm mẫu ${qrCode.substring(0, 4)}`
    const brand = `Thương hiệu ${qrCode.substring(4, 8)}`
    
    return {
      isValid: true,
      productId,
      productName,
      brand,
      manufacturingDate: new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)).toISOString(),
      batchNumber: `BATCH-${qrCode.substring(0, 6).toUpperCase()}`,
      isCounterfeit,
      authenticityScore,
      verificationDate: new Date().toISOString(),
      additionalInfo: isCounterfeit 
        ? 'Sản phẩm này có thể là hàng giả. Vui lòng kiểm tra kỹ trước khi sử dụng.' 
        : 'Sản phẩm chính hãng được xác thực bởi Quỹ Chống Hàng Giả Việt Nam.',
      addedAt: new Date().toISOString()
    }
  }

  /**
   * Adds a product to the personal verification cabinet
   * @param qrCode The QR code of the product to add
   * @param notes Optional notes about the product
   */
  static async addToCabinet(qrCode: string, notes?: string): Promise<void> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // In a real implementation, this would store the verification result in the user's cabinet
    const verificationResult = await this.verifyProduct(qrCode)
    
    // Save to localStorage as a mock implementation
    const cabinet = JSON.parse(localStorage.getItem('verificationCabinet') || '[]')
    cabinet.push({
      ...verificationResult,
      notes,
      addedAt: new Date().toISOString()
    })
    
    localStorage.setItem('verificationCabinet', JSON.stringify(cabinet))
  }

  /**
   * Gets all products in the user's verification cabinet
   */
  static getCabinetItems(): ProductVerificationResult[] {
    try {
      const cabinet = JSON.parse(localStorage.getItem('verificationCabinet') || '[]')
      return cabinet
    } catch (e) {
      console.error('Error retrieving verification cabinet:', e)
      return []
    }
  }

  /**
   * Reports a counterfeit product
   * @param qrCode The QR code of the suspected counterfeit product
   * @param reportDetails Details about the counterfeit report
   */
  static async reportCounterfeit(qrCode: string, reportDetails: string): Promise<boolean> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // In a real implementation, this would send the report to the backend
    console.log(`Counterfeit report submitted for QR code: ${qrCode}`, reportDetails)
    
    // Return success
    return true
  }
}
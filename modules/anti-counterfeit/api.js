const { MedusaContainer } = require("@medusajs/utils")
const { Router } = require("express")

module.exports = (container, config) => {
  const app = Router()
  
  // Verify product authenticity via QR code
  app.post("/verify", async (req, res) => {
    try {
      const { qrCode } = req.body
      
      if (!qrCode) {
        return res.status(400).json({
          error: "QR code is required"
        })
      }
      
      const antiCounterfeitService = container.resolve("antiCounterfeitService")
      const result = await antiCounterfeitService.verifyProduct(qrCode)
      
      res.status(200).json(result)
    } catch (error) {
      res.status(500).json({
        error: error.message
      })
    }
  })
  
  // Generate QR code for a product
  app.post("/generate-qr", async (req, res) => {
    try {
      const { productId, batchNumber, serialNumber } = req.body
      
      if (!productId) {
        return res.status(400).json({
          error: "Product ID is required"
        })
      }
      
      const antiCounterfeitService = container.resolve("antiCounterfeitService")
      const qrCode = await antiCounterfeitService.createQrCode(productId, batchNumber, serialNumber)
      
      res.status(200).json({
        qrCode
      })
    } catch (error) {
      res.status(500).json({
        error: error.message
      })
    }
  })
  
  // Report counterfeit product
  app.post("/report", async (req, res) => {
    try {
      const reportData = req.body
      
      const antiCounterfeitService = container.resolve("antiCounterfeitService")
      const result = await antiCounterfeitService.reportCounterfeit(reportData)
      
      res.status(200).json(result)
    } catch (error) {
      res.status(500).json({
        error: error.message
      })
    }
  })
  
  // Generate product certificate
  app.post("/certificate", async (req, res) => {
    try {
      const { productId } = req.body
      
      if (!productId) {
        return res.status(400).json({
          error: "Product ID is required"
        })
      }
      
      const antiCounterfeitService = container.resolve("antiCounterfeitService")
      const certificate = await antiCounterfeitService.generateProductCertificate(productId)
      
      res.status(200).json(certificate)
    } catch (error) {
      res.status(500).json({
        error: error.message
      })
    }
  })
  
  return app
}
const { MedusaContainer } = require("@medusajs/utils")
const { Router } = require("express")

module.exports = (container, config) => {
  const app = Router()
  
  // Create an escrow for an order
  app.post("/create", async (req, res) => {
    try {
      const { orderId, amount, currency, buyerId, sellerId, paymentMethod } = req.body
      
      if (!orderId || !amount || !currency || !buyerId || !sellerId) {
        return res.status(400).json({
          error: "Missing required fields: orderId, amount, currency, buyerId, sellerId"
        })
      }
      
      const escrowService = container.resolve("escrowService")
      const escrow = await escrowService.createEscrow(orderId, amount, currency, buyerId, sellerId, paymentMethod)
      
      res.status(200).json(escrow)
    } catch (error) {
      res.status(500).json({
        error: error.message
      })
    }
  })
  
  // Release payment from escrow
  app.post("/release/:id", async (req, res) => {
    try {
      const { id } = req.params
      const { releaseAmount, releasedById } = req.body
      
      if (!releaseAmount || !releasedById) {
        return res.status(400).json({
          error: "Missing required fields: releaseAmount, releasedById"
        })
      }
      
      const escrowService = container.resolve("escrowService")
      const result = await escrowService.releasePayment(id, releaseAmount, releasedById)
      
      res.status(200).json(result)
    } catch (error) {
      res.status(500).json({
        error: error.message
      })
    }
  })
  
  // Refund payment from escrow
  app.post("/refund/:id", async (req, res) => {
    try {
      const { id } = req.params
      const { refundAmount, refundedById, reason } = req.body
      
      if (!refundAmount || !refundedById || !reason) {
        return res.status(400).json({
          error: "Missing required fields: refundAmount, refundedById, reason"
        })
      }
      
      const escrowService = container.resolve("escrowService")
      const result = await escrowService.refundPayment(id, refundAmount, refundedById, reason)
      
      res.status(200).json(result)
    } catch (error) {
      res.status(500).json({
        error: error.message
      })
    }
  })
  
  // Get escrow status
  app.get("/:id", async (req, res) => {
    try {
      const { id } = req.params
      
      const escrowService = container.resolve("escrowService")
      const status = await escrowService.getEscrowStatus(id)
      
      res.status(200).json(status)
    } catch (error) {
      res.status(500).json({
        error: error.message
      })
    }
  })
  
  return app
}
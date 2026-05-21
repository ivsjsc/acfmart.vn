import { Router } from 'express'
import { shippingController } from './shipping.controller'

const router = Router()

router.get('/providers', shippingController.providers)
router.get('/ghtk/authenticated', shippingController.testGhtk)
router.post('/ghtk/fee', shippingController.ghtkFee)
router.post('/rates', shippingController.calculateRates)
router.post('/orders', shippingController.createOrder)
router.post('/orders/cancel', shippingController.cancelOrder)
router.get('/track/:trackingNumber', shippingController.track)

export default router

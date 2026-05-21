import { Request, Response } from 'express'
import { shippingService } from './shipping.service'

function getMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback
}

function isUpstreamError(message: string): boolean {
  return /GHTK|OpenAPI|API lỗi|không được cấu hình/i.test(message)
}

export const shippingController = {
  async providers(_req: Request, res: Response): Promise<void> {
    res.json({ success: true, providers: shippingService.getProviders() })
  },

  async testGhtk(req: Request, res: Response): Promise<void> {
    try {
      const result = await shippingService.testGhtkConnection()
      res.json({ success: true, ...result })
    } catch (error) {
      const message = getMessage(error, 'Không thể kiểm tra kết nối GHTK')
      res.status(isUpstreamError(message) ? 502 : 400).json({ success: false, message })
    }
  },

  async ghtkFee(req: Request, res: Response): Promise<void> {
    try {
      const result = await shippingService.getGhtkFeePayload(req.body)
      res.json(result)
    } catch (error) {
      const message = getMessage(error, 'Không thể tính phí GHTK')
      res.status(isUpstreamError(message) ? 502 : 400).json({ success: false, message })
    }
  },

  async calculateRates(req: Request, res: Response): Promise<void> {
    try {
      const rates = await shippingService.calculateRates(req.body)
      res.json({ success: true, rates })
    } catch (error) {
      const message = getMessage(error, 'Không thể tính phí vận chuyển')
      res.status(isUpstreamError(message) ? 502 : 400).json({ success: false, message })
    }
  },

  async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const result = await shippingService.createShippingOrder(req.body)
      res.status(201).json({ success: true, ...result })
    } catch (error) {
      const message = getMessage(error, 'Không thể tạo đơn vận chuyển')
      res.status(isUpstreamError(message) ? 502 : 400).json({ success: false, message })
    }
  },

  async cancelOrder(req: Request, res: Response): Promise<void> {
    try {
      const trackingNumber = String(req.body?.trackingNumber ?? '').trim()
      if (!trackingNumber) {
        res.status(400).json({ success: false, message: 'Thiếu mã vận đơn' })
        return
      }

      await shippingService.cancelShippingOrder(trackingNumber)
      res.json({ success: true, message: 'Đã gửi yêu cầu hủy đơn vận chuyển' })
    } catch (error) {
      const message = getMessage(error, 'Không thể hủy đơn vận chuyển')
      res.status(isUpstreamError(message) ? 502 : 400).json({ success: false, message })
    }
  },

  async track(req: Request, res: Response): Promise<void> {
    try {
      const trackingNumber = String(req.params.trackingNumber ?? '').trim()
      if (!trackingNumber) {
        res.status(400).json({ success: false, message: 'Thiếu mã vận đơn' })
        return
      }

      const result = await shippingService.trackShippingOrder(trackingNumber)
      res.json({ success: true, ...result })
    } catch (error) {
      const message = getMessage(error, 'Không thể tra cứu vận đơn')
      res.status(isUpstreamError(message) ? 502 : 400).json({ success: false, message })
    }
  },
}

import { MedusaService } from "@medusajs/framework/utils"
import { randomBytes } from "node:crypto"
import { LiveStream, StreamFeaturedProduct } from "./models"

class LiveStreamModuleService extends MedusaService({
  LiveStream,
  StreamFeaturedProduct,
}) {
  /**
   * Schedule new stream. Streaming provider (Mux/Antmedia) sẽ được gọi từ
   * subscriber sau khi stream record được tạo, lấy RTMP credentials + lưu lại.
   */
  async scheduleStream(input: {
    vendor_id: string
    host_name: string
    host_avatar?: string
    title: string
    description?: string
    thumbnail_url?: string
    category?: string
    scheduled_start_at: Date
  }) {
    return this.createLiveStreams({
      ...input,
      status: "scheduled",
      stream_key: this.generateStreamKey(),
    })
  }

  async goLive(streamId: string) {
    const stream = await this.retrieveLiveStream(streamId)
    if (stream.status !== "scheduled") return stream

    return this.updateLiveStreams({
      id: stream.id,
      status: "live",
      actual_start_at: new Date(),
    })
  }

  async endStream(streamId: string, stats?: {
    peak_viewers?: number
    total_views?: number
    total_orders?: number
    total_revenue?: number
  }) {
    const stream = await this.retrieveLiveStream(streamId)
    const endedAt = new Date()
    const duration = stream.actual_start_at
      ? Math.floor((endedAt.getTime() - new Date(stream.actual_start_at).getTime()) / 1000)
      : 0

    return this.updateLiveStreams({
      id: stream.id,
      status: "ended",
      ended_at: endedAt,
      duration_seconds: duration,
      ...stats,
    })
  }

  async pinProduct(input: {
    stream_id: string
    product_id: string
    variant_id?: string
    flash_price?: number
    flash_stock?: number
  }) {
    return this.createStreamFeaturedProducts({
      stream_id: input.stream_id,
      product_id: input.product_id,
      variant_id: input.variant_id,
      flash_price: input.flash_price,
      flash_stock: input.flash_stock,
      pinned_at: new Date(),
    })
  }

  private generateStreamKey(): string {
    return `live_${randomBytes(24).toString("base64url")}`
  }
}

export default LiveStreamModuleService

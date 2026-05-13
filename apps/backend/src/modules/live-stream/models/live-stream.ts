import { model } from "@medusajs/framework/utils"

/**
 * Live commerce stream — metadata trên Medusa, realtime state (viewer count,
 * chat) đẩy qua Firestore. Khi go-live cần tích hợp:
 * - Mux / AntMedia / Ali Cloud Live cho RTMP ingest + HLS playback
 * - Facebook Live SDK (nếu seller stream qua Facebook)
 */
export const LiveStream = model
  .define("live_stream", {
    id: model.id({ prefix: "lstr" }).primaryKey(),

    vendor_id: model.text().searchable(),
    host_name: model.text(),
    host_avatar: model.text().nullable(),

    title: model.text().searchable(),
    description: model.text().nullable(),
    thumbnail_url: model.text().nullable(),
    category: model.text().nullable(),

    /** Scheduled vs Live vs Ended */
    status: model
      .enum(["scheduled", "live", "ended", "cancelled"])
      .default("scheduled"),
    scheduled_start_at: model.dateTime(),
    actual_start_at: model.dateTime().nullable(),
    ended_at: model.dateTime().nullable(),

    /** RTMP / HLS endpoints (set bởi streaming provider) */
    rtmp_url: model.text().nullable(),
    stream_key: model.text().nullable(),
    hls_url: model.text().nullable(),
    playback_id: model.text().nullable(),

    /** Realtime mirror IDs trên Firestore */
    firestore_room_id: model.text().nullable(),

    /** Stats — sync cuối stream */
    peak_viewers: model.number().default(0),
    total_views: model.number().default(0),
    total_orders: model.number().default(0),
    total_revenue: model.bigNumber().default(0),
    duration_seconds: model.number().default(0),

    metadata: model.json().nullable(),
  })
  .indexes([
    { on: ["status"] },
    { on: ["vendor_id"] },
    { on: ["scheduled_start_at"] },
  ])

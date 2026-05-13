import { Module } from "@medusajs/framework/utils"
import LiveStreamModuleService from "./service"

export const LIVE_STREAM_MODULE = "live_stream"

export default Module(LIVE_STREAM_MODULE, {
  service: LiveStreamModuleService,
})

export * from "./models"
export { default as LiveStreamModuleService } from "./service"

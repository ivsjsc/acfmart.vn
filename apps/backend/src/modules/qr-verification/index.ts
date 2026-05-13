import { Module } from "@medusajs/framework/utils"
import QrVerificationModuleService from "./service"

export const QR_VERIFICATION_MODULE = "qr_verification"

export default Module(QR_VERIFICATION_MODULE, {
  service: QrVerificationModuleService,
})

export * from "./models"
export { default as QrVerificationModuleService } from "./service"

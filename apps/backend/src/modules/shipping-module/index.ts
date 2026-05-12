import { Module } from "@medusajs/framework/utils"
import ShippingModuleService from "./services/shipping-module"

export const SHIPPING_MODULE = "shippingModule"

export default Module(SHIPPING_MODULE, {
  service: ShippingModuleService,
})

export * from "./types"
export * from "./interfaces"

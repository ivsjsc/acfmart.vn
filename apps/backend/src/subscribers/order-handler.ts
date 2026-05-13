import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { OrderWorkflowEvents } from "@medusajs/framework/utils"
import {
  orderProcessingWorkflow,
  type OrderProcessingWorkflowInput,
} from "../workflows/order-processing"

type OrderPlacedEvent = {
  id: string
  total?: number
  email?: string
  payments?: Array<{ provider_id?: string; data?: Record<string, unknown> }>
  shipping_methods?: Array<{ name?: string }>
  shipping_address?: {
    first_name?: string
    last_name?: string
    phone?: string
    address_1?: string
    city?: string
    province?: string
    country_code?: string
  }
  items?: Array<{
    title?: string
    quantity?: number
    unit_price?: number
    variant?: { product?: { title?: string } }
  }>
}

// Event handler for order completion
export default async function orderHandlerSubscriber({
  container,
  event,
}: SubscriberArgs<OrderPlacedEvent>) {
  const logger = container.resolve("logger");
  const data = event.data
  
  if (event.name === OrderWorkflowEvents.PLACED) {
    logger.info(`Processing new order: ${data.id}`);
    
    try {
      // Execute the order processing workflow
      const workflow = orderProcessingWorkflow(container);
      
      // Prepare input for the workflow
      const workflowInput: OrderProcessingWorkflowInput = {
        orderId: data.id,
        amount: data.total || 0,
        paymentMethod: data.payments?.[0]?.provider_id || "unknown",
        paymentDetails: data.payments?.[0]?.data || {},
        shippingMethod: data.shipping_methods?.[0]?.name || "standard",
        shippingDetails: {
          from: {
            name: "Kho xác thực",
            phone: "19001234",
            fullAddress: "Kho xác thực",
            wardName: "Phuong 1",
            districtName: "Tan Binh",
            provinceName: "Ho Chi Minh City"
          },
          to: {
            name: data.shipping_address?.first_name + " " + data.shipping_address?.last_name,
            phone: data.shipping_address?.phone || "",
            fullAddress: data.shipping_address?.address_1 || "",
            wardName: data.shipping_address?.city || "",
            districtName: data.shipping_address?.province || "",
            provinceName: data.shipping_address?.country_code?.toUpperCase() || ""
          },
          parcel: {
            weight: 500, // Default weight in grams
            declaredValue: data.total || 0,
            items: data.items?.map((item) => ({
              name: item.title || item.variant?.product?.title || "Unknown item",
              quantity: item.quantity || 0,
              weight: 200, // Default weight per item
              value: item.unit_price || 0
            })) || []
          }
        },
        customerEmail: data.email || "",
      };
      
      // Execute the workflow
      await workflow.run({
        input: workflowInput,
        container,
      });
      
      logger.info(`Successfully processed order workflow for: ${data.id}`);
    } catch (error) {
      logger.error(
        `Error processing order workflow for ${data.id}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}

// Register the event handler
export const config: SubscriberConfig = {
  event: [
    OrderWorkflowEvents.PLACED,
    "order.captured",
    "order.shipment_created"
  ],
};

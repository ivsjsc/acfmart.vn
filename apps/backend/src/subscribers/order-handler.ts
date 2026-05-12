import { 
  SubscriberArgs, 
  SubscriberExecutionContext,
  MedusaContainer
} from "@medusajs/medusa";
import { 
  OrderService,
  OrderWorkflowEvents,
  OrderTypes
} from "@medusajs/medusa";
import { orderProcessingWorkflow } from "../workflows/order-processing";

// Event handler for order completion
export default async function orderHandlerSubscriber({
  container,
  eventName,
  data,
  metadata,
}: SubscriberArgs<Record<string, unknown>>) {
  const logger = container.resolve("logger");
  
  if (eventName === OrderWorkflowEvents.PLACED) {
    logger.info(`Processing new order: ${data.id}`);
    
    try {
      // Execute the order processing workflow
      const workflow = orderProcessingWorkflow(container);
      
      // Prepare input for the workflow
      const workflowInput: OrderTypes.OrderWorkflowInputDTO = {
        orderId: data.id,
        amount: data.total || 0,
        paymentMethod: data.payments?.[0]?.provider_id || "unknown",
        paymentDetails: data.payments?.[0]?.data || {},
        shippingMethod: data.shipping_methods?.[0]?.name || "standard",
        shippingDetails: {
          from: {
            name: "ACFMart Warehouse",
            phone: "19001234",
            fullAddress: "Kho ACFMart",
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
            items: data.items?.map(item => ({
              name: item.title || item.variant?.product?.title || "Unknown item",
              quantity: item.quantity || 0,
              weight: 200, // Default weight per item
              value: item.unit_price || 0
            })) || []
          }
        },
        customerEmail: data.email,
      };
      
      // Execute the workflow
      await workflow.run({
        input: workflowInput,
        container,
      });
      
      logger.info(`Successfully processed order workflow for: ${data.id}`);
    } catch (error) {
      logger.error(`Error processing order workflow for ${data.id}:`, error);
    }
  }
}

// Register the event handler
export const config = {
  event: [
    OrderWorkflowEvents.PLACED,
    "order.captured",
    "order.shipment_created"
  ],
};
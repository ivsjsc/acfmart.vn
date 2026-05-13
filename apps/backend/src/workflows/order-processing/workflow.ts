import {
  createWorkflow,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { 
  processPaymentStep, 
  arrangeShippingStep, 
  notifyCustomerStep 
} from "./steps";

export type OrderProcessingWorkflowInput = {
  orderId: string
  amount: number
  paymentMethod: string
  paymentDetails: Record<string, unknown>
  shippingMethod: string
  shippingDetails: Record<string, unknown>
  customerEmail: string
}

// Define the order processing workflow
export const orderProcessingWorkflow = createWorkflow(
  "order-processing-workflow",
  (input: WorkflowData<OrderProcessingWorkflowInput>) => {
    // Process payment first
    const paymentResult = processPaymentStep({
      orderId: input.orderId,
      amount: input.amount,
      paymentMethod: input.paymentMethod,
      paymentDetails: input.paymentDetails,
    });
    
    // Then arrange shipping
    const shippingResult = arrangeShippingStep({
      orderId: input.orderId,
      shippingMethod: input.shippingMethod,
      shippingDetails: input.shippingDetails,
    });
    
    // Finally notify the customer
    const notificationResult = notifyCustomerStep({
      orderId: input.orderId,
      customerEmail: input.customerEmail,
      shippingInfo: shippingResult,
      paymentInfo: paymentResult,
    });
    
    // Return the workflow result
    return new WorkflowResponse({
      orderId: input.orderId,
      payment: paymentResult,
      shipping: shippingResult,
      notification: notificationResult,
      status: "completed",
    });
  }
);

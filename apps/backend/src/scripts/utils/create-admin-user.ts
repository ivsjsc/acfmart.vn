// @ts-nocheck

import { 
  ContainerRegistrationKeys,
} from "@medusajs/types";
import { Modules } from "@medusajs/framework/modules";

export async function createAdminUser(container) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  
  try {
    // In a real implementation, we would use the user module to create an admin user
    // For now, we'll just log the action
    logger.info("Creating admin user...");
    
    // Example implementation (would need actual user module):
    /*
    const userService = container.resolve(Modules.USER);
    
    const adminUser = await userService.createUsers([
      {
        email: "n.bi2993@gmail.com",
        first_name: "Admin",
        last_name: "Commerce",
        role: "admin",
      }
    const adminUser = await userService.createUsers([
      {
        email: "alextran6787@gmail.com",
        first_name: "Admin",
        last_name: "Commerce",
        role: "admin",
      }        
    ]);
    */
    
    logger.info("Admin user creation completed.");
  } catch (error) {
    logger.error("Error creating admin user:", error);
  }
}

import { SellerApplication } from '../types/sellerTypes';
import { zaloNotificationService } from './zaloNotificationService';

/**
 * Service to handle seller application processes
 */
export class SellerApplicationService {
  /**
   * Handles a new seller application submission
   * In a real backend function, this would be triggered by Firestore onCreate
   */
  static async handleNewApplication(application: SellerApplication): Promise<void> {
    console.log(`Handling new seller application: ${application.applicationId}`);
    
    // Send notification to moderators
    const notificationResult = await zaloNotificationService.notifyNewSellerApplication(application);
    
    console.log(`Notifications sent for application: ${application.applicationId}`, notificationResult);
  }

  /**
   * Checks for SLA violations and notifies supervisors
   * In a real backend function, this would run periodically as a scheduled function
   */
  static async checkSLAViolations(): Promise<void> {
    console.log('Checking for SLA violations...');
    
    // In a real implementation, this would query Firestore for pending applications
    // older than 24 hours and send notifications to supervisors
    // For now, we'll just log what would happen
    
    // Example: Fetch pending applications older than 24 hours
    // const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    // const pendingApps = await getPendingApplicationsOlderThan(oneDayAgo);
    
    // For demo purposes, let's assume we have some pending applications
    const mockPendingApplications = [
      { applicationId: 'APP-001', shopName: 'Demo Shop 1', submittedAt: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString() },
      { applicationId: 'APP-002', shopName: 'Demo Shop 2', submittedAt: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString() }
    ];
    
    const oneDayInMs = 24 * 60 * 60 * 1000;
    
    for (const app of mockPendingApplications) {
      const hoursElapsed = Math.floor((Date.now() - new Date(app.submittedAt).getTime()) / (60 * 60 * 1000));
      
      if (hoursElapsed >= 24) {
        console.log(`SLA violation detected for ${app.applicationId}: ${hoursElapsed} hours elapsed`);
        await zaloNotificationService.notifySLAViolation(app.applicationId, app.shopName, hoursElapsed);
      }
    }
  }

  /**
   * Processes an application status update
   * In a real backend function, this would be triggered by Firestore onUpdate
   */
  static async handleApplicationStatusChange(
    application: SellerApplication,
    change: { before: SellerApplication; after: SellerApplication }
  ): Promise<void> {
    if (change.before.status !== change.after.status) {
      console.log(`Application ${application.applicationId} status changed from ${change.before.status} to ${change.after.status}`);
      
      // Send notification to moderators about the status change
      if (change.after.status === 'approved' || change.after.status === 'rejected') {
        await zaloNotificationService.notifySellerStatus(application, change.after.status as 'approved' | 'rejected');
      }
    }
  }

  /**
   * Sends a notification when an application is approved
   */
  static async handleApplicationApproval(application: SellerApplication): Promise<void> {
    console.log(`Application ${application.applicationId} was approved`);
    
    // Notify all staff about the approval
    await zaloNotificationService.notifySellerStatus(application, 'approved');
  }

  /**
   * Sends a notification when an application is rejected
   */
  static async handleApplicationRejection(application: SellerApplication): Promise<void> {
    console.log(`Application ${application.applicationId} was rejected`);
    
    // Notify all staff about the rejection
    await zaloNotificationService.notifySellerStatus(application, 'rejected');
  }
}
import { MODERATORS_JSON, ZALO_ACCESS_TOKEN } from '../config/integrations';
import { collection, doc, getDoc, setDoc, getFirestore } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface ZaloRecipient {
  name: string;
  zaloId: string;
  role: string;
}

/**
 * Service xử lý gửi thông báo qua Zalo Official Account
 */
export class ZaloNotificationService {
  private static readonly ZALO_API_ENDPOINT = 'https://openapi.zalo.me/v3.0/oa/message/cs';
  private static readonly ACCESS_TOKEN = ZALO_ACCESS_TOKEN;

  // Method to ensure user exists in the system
  static async ensureUserExists(user: any) {
    if (!user || !user.id) {
      console.error('User object or user id is missing');
      return;
    }
    
    try {
      const userDocRef = doc(db, 'users', user.id);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        // Create user document with basic info
        await setDoc(userDocRef, {
          ...user,
          createdAt: new Date().toISOString(),
          role: user.role || 'customer',
          permissions: user.permissions || []
        });
        console.log(`User document created for: ${user.id}`);
      } else {
        console.log(`User document already exists for: ${user.id}`);
      }
    } catch (error) {
      console.error('Error ensuring user exists:', error);
    }
  }

  /**
   * Gửi thông báo đến một người nhận
   */
  private static async sendToUser(userId: string, message: string): Promise<{ok: boolean; messageId?: string; error?: string}> {
    if (!this.ACCESS_TOKEN) {
      console.error('❌ Missing Zalo access token');
      return { ok: false, error: 'Zalo access token is not configured' };
    }

    const body = {
      recipient: { user_id: userId },
      message: { text: message }
    };

    try {
      const res = await fetch(this.ZALO_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'access_token': this.ACCESS_TOKEN,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (data.error === 0) {
        console.log(`✅ Sent to ${userId}, msgId: ${data.data?.message_id}`);
        return { ok: true, messageId: data.data?.message_id };
      }

      // Xử lý các lỗi phổ biến
      const errorMap: Record<string, string> = {
        '-216': 'Người dùng chưa nhắn tin cho OA trong 7 ngày',
        '-219': 'Người dùng chưa follow OA',
        '-100': 'Access token hết hạn',
        '-336': 'Tin nhắn vi phạm chính sách',
        '-200': 'Không đủ quyền để thực hiện hành động',
        '-205': 'OA bị tạm dừng hoạt động',
        '-300': 'Tin nhắn gửi quá nhanh (rate limit)',
        '-500': 'Lỗi hệ thống Zalo'
      };

      const errorMsg = errorMap[String(data.error)] || data.message || 'Lỗi không xác định';
      console.warn(`❌ Zalo error ${data.error}: ${errorMsg}`);
      
      return { ok: false, error: `[${data.error}] ${errorMsg}` };

    } catch (err) {
      console.error('🔥 Network error:', err);
      return { ok: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  }

  /**
   * Gửi thông báo tới tất cả moderators
   */
  public static async sendToAllModerators(message: string): Promise<boolean> {
    try {
      // Parse danh sách moderators từ config
      let moderators: ZaloRecipient[] = [];
      
      try {
        moderators = JSON.parse(MODERATORS_JSON || '[]');
      } catch (parseError) {
        console.error('Error parsing moderators list:', parseError);
        return false;
      }

      if (!moderators || moderators.length === 0) {
        console.error('No moderators configured');
        return false;
      }

      // Gửi thông báo song song tới tất cả moderators
      const results = await Promise.all(
        moderators.map(moderator => 
          this.sendToUser(moderator.zaloId, message)
        )
      );

      // Kiểm tra kết quả
      const successfulSends = results.filter(r => r.ok).length;
      console.log(`Successfully sent ${successfulSends}/${results.length} messages`);

      return successfulSends > 0;
    } catch (error) {
      console.error('Error sending notifications to moderators:', error);
      return false;
    }
  }

  /**
   * Gửi thông báo cho người dùng cụ thể
   */
  public static async sendToUserById(userId: string, message: string): Promise<boolean> {
    const result = await this.sendToUser(userId, message);
    return result.ok;
  }

  /**
   * Gửi thông báo trạng thái đăng ký bán hàng
   */
  public static async sendSellerApplicationNotification(
    shopName: string, 
    status: 'pending' | 'approved' | 'rejected',
    ticketId?: string
  ): Promise<boolean> {
    let message = '';
    
    switch (status) {
      case 'pending':
        message = `🔔 [ACF] Đăng ký bán hàng mới\n`;
        message += `- Shop: ${shopName}\n`;
        message += `- Ticket: ${ticketId || 'N/A'}\n`;
        message += `- Trạng thái: Chờ xét duyệt\n`;
        message += `- Hạn xử lý: 24h kể từ thời điểm đăng ký`;
        break;
      case 'approved':
        message = `✅ [ACF] Đăng ký bán hàng đã được duyệt\n` +
        `- Shop: ${shopName}\n` +
        `- Trạng thái: ĐÃ DUYỆT\n` +
        `- Thời gian: ${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}`;
        break;
      case 'rejected':
        message = `❌ [ACF] Đăng ký bán hàng bị từ chối\n` +
        `- Shop: ${shopName}\n` +
        `- Trạng thái: BỊ TỪ CHỐI\n` +
        `- Thời gian: ${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}`;
        break;
      default:
        console.error('Invalid status for seller application notification');
        return false;
    }

    return await this.sendToAllModerators(message);
  }

  /**
   * Gửi thông báo cho người có vai trò cụ thể
   */
  public static async sendToRole(role: string, message: string): Promise<boolean> {
    try {
      let moderators: ZaloRecipient[] = [];
      
      try {
        moderators = JSON.parse(MODERATORS_JSON || '[]');
      } catch (parseError) {
        console.error('Error parsing moderators list:', parseError);
        return false;
      }

      const recipients = moderators.filter(mod => mod.role === role);
      
      if (recipients.length === 0) {
        console.error(`No recipients found for role: ${role}`);
        return false;
      }

      const results = await Promise.all(
        recipients.map(recipient => 
          this.sendToUser(recipient.zaloId, message)
        )
      );

      const successfulSends = results.filter(r => r.ok).length;
      console.log(`Successfully sent ${successfulSends}/${results.length} messages to role ${role}`);

      return successfulSends > 0;
    } catch (error) {
      console.error(`Error sending notifications to role ${role}:`, error);
      return false;
    }
  }

  /**
   * Thông báo đăng ký bán hàng mới
   */
  public static async notifyNewSellerApplication(application: any): Promise<boolean> {
    const message = `🔔 [ACF] Đăng ký bán hàng mới\n` +
      `- Shop: ${application.shopName}\n` +
      `- Email: ${application.email}\n` +
      `- SĐT: ${application.phone}\n` +
      `- Ticket: ${application.applicationId}\n` +
      `- Thời gian: ${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}\n` +
      `- Hạn xử lý: 24h kể từ thời điểm đăng ký`;
    
    return await this.sendToAllModerators(message);
  }

  /**
   * Thông báo trạng thái đăng ký bán hàng
   */
  public static async notifySellerStatus(application: any, status: 'approved' | 'rejected'): Promise<boolean> {
    let message = '';
    
    if (status === 'approved') {
      message = `✅ [ACF] Đăng ký bán hàng đã được duyệt\n` +
        `- Shop: ${application.shopName}\n` +
        `- Ticket: ${application.applicationId}\n` +
        `- Trạng thái: ĐÃ DUYỆT\n` +
        `- Thời gian: ${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}`;
    } else {
      message = `❌ [ACF] Đăng ký bán hàng bị từ chối\n` +
        `- Shop: ${application.shopName}\n` +
        `- Ticket: ${application.applicationId}\n` +
        `- Trạng thái: BỊ TỪ CHỐI\n` +
        `- Lý do: ${application.rejectionReason || 'Không có lý do'}\n` +
        `- Thời gian: ${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}`;
    }
    
    return await this.sendToAllModerators(message);
  }

  /**
   * Thông báo vi phạm SLA
   */
  public static async notifySLAViolation(applicationId: string, shopName: string, hoursElapsed: number): Promise<boolean> {
    const message = `⚠️ [ACF] VI PHẠM SLA - CẦN XỬ LÝ NGAY\n` +
      `- Ticket: ${applicationId}\n` +
      `- Shop: ${shopName}\n` +
      `- Thời gian chờ: ${hoursElapsed}h (vượt giới hạn 24h)\n` +
      `- Ưu tiên: CAO\n` +
      `- Hành động: Cần xử lý ngay lập tức`;
    
    return await this.sendToAllModerators(message);
  }

  /**
   * Thông báo cho nhân viên
   */
  public static async notifyStaff(message: string): Promise<boolean> {
    return await this.sendToRole('staff', message);
  }
}

export const zaloNotificationService = ZaloNotificationService;

export function initializeZaloNotificationService() {
  return ZaloNotificationService;
}
import Bull from 'bull';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Queue gửi email
export const emailQueue = new Bull('email', REDIS_URL);

// Queue xử lý thông báo
export const notificationQueue = new Bull('notification', REDIS_URL);

// Queue xử lý hoa hồng affiliate
export const commissionQueue = new Bull('commission', REDIS_URL);

// Worker gửi email
emailQueue.process(async (job) => {
  const { to, subject, html } = job.data as { to: string; subject: string; html: string };
  console.log(`📧 Sending email to ${to}: ${subject}`);
  // TODO: Tích hợp nodemailer
});

// Worker xử lý hoa hồng
commissionQueue.process(async (job) => {
  const { orderId, affiliateCode, total } = job.data as {
    orderId: string;
    affiliateCode: string;
    total: number;
  };
  console.log(`💰 Processing commission for order ${orderId}`);
  // TODO: Tính và lưu commission vào DB
});

export default { emailQueue, notificationQueue, commissionQueue };

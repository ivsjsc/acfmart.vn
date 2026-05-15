import { ReconciliationService } from '../services/ReconciliationService';

async function runReconciliationJob() {
  console.log('Starting VNPay reconciliation job...');
  
  const reconciliationService = new ReconciliationService();
  
  try {
    // Thực hiện đối soát
    await reconciliationService.runScheduledReconciliation();
    
    console.log('VNPay reconciliation job completed successfully');
  } catch (error) {
    console.error('VNPay reconciliation job failed:', error);
    
    // Thoát với mã lỗi để hệ thống tác vụ có thể nhận biết
    process.exit(1);
  }
}

// Nếu script được chạy trực tiếp
if (require.main === module) {
  runReconciliationJob();
}

export { runReconciliationJob };
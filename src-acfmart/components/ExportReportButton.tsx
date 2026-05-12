import { Button } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';

/**
 * Nút xuất báo cáo - chỉ sử dụng ở trang cá nhân người dùng và trang quản lý bán hàng
 * Theo quy tắc: báo cáo/导出类功能仅限个人账户设置页和卖家账户设置页
 */
const ExportReportButton = () => {
  return (
    <Button
      type="primary"
      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
      icon={<DownloadOutlined />}
      aria-label="Xuất báo cáo"
    >
      Xuất báo cáo
    </Button>
  );
};

export default ExportReportButton;
import { Modal, notification } from 'antd';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

export function showNotification(
  type: NotificationType,
  message: string,
  description?: string
) {
  notification[type]({
    message,
    description,
    placement: 'topRight',
    duration: 4,
  });
}

export function showConfirm(
  title: string,
  content: string,
  onOk: () => void | Promise<void>,
  onCancel?: () => void
) {
  Modal.confirm({
    title,
    content,
    okText: 'Xác nhận',
    cancelText: 'Hủy',
    okButtonProps: {
      className: 'bg-brand-red hover:bg-brand-red-700',
      style: { backgroundColor: '#dc2626' },
    },
    onOk,
    onCancel,
  });
}

export function showSuccess(message: string, description?: string) {
  showNotification('success', message, description);
}

export function showError(message: string, description?: string) {
  showNotification('error', message, description);
}

export function showWarning(message: string, description?: string) {
  showNotification('warning', message, description);
}

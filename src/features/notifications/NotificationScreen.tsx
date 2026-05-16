import { useState, useEffect } from 'react';
import { Bell, Mail, Package, Tag, Star, X } from 'lucide-react';
import { Button } from '@repo/ui/components/button';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  icon?: JSX.Element;
}

export default function NotificationScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'success',
      title: 'Đơn hàng đã được xác nhận',
      message: 'Đơn hàng #ORD-2023-001 của bạn đã được xác nhận và đang được xử lý.',
      timestamp: new Date(Date.now() - 3600000),
      read: false,
    },
    {
      id: '2',
      type: 'info',
      title: 'Ưu đãi đặc biệt',
      message: 'Chúng tôi có ưu đãi đặc biệt dành riêng cho bạn trong tuần này.',
      timestamp: new Date(Date.now() - 86400000),
      read: false,
    },
    {
      id: '3',
      type: 'warning',
      title: 'Cập nhật chính sách',
      message: 'Chính sách vận chuyển mới sẽ được áp dụng từ ngày mai.',
      timestamp: new Date(Date.now() - 172800000),
      read: true,
    },
    {
      id: '4',
      type: 'info',
      title: 'Sự kiện sắp diễn ra',
      message: 'Livestream khuyến mãi lớn sẽ bắt đầu vào 20:00 hôm nay.',
      timestamp: new Date(Date.now() - 259200000),
      read: true,
    },
  ]);

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => !n.read);

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? {...n, read: true} : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({...n, read: true})));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'info': return <Mail className="h-5 w-5 text-blue-500" />;
      case 'warning': return <Bell className="h-5 w-5 text-yellow-500" />;
      case 'success': return <Package className="h-5 w-5 text-green-500" />;
      case 'error': return <Tag className="h-5 w-5 text-red-500" />;
      default: return <Star className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="container-acf py-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Thông báo</h1>
          <p className="text-sm text-neutral-600">
            Các cập nhật và khuyến mãi từ ACFMart
          </p>
        </div>
        <div className="mt-4 flex items-center gap-3 sm:mt-0">
          <div className="flex rounded-lg border border-neutral-200 bg-white p-1">
            <button
              onClick={() => setFilter('all')}
              className={`rounded-md px-3 py-1.5 text-sm ${
                filter === 'all'
                  ? 'bg-brand-red-600 text-white'
                  : 'text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`rounded-md px-3 py-1.5 text-sm ${
                filter === 'unread'
                  ? 'bg-brand-red-600 text-white'
                  : 'text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              Chưa đọc
            </button>
          </div>
          <Button
            variant="transparent"
            size="small"
            onClick={markAllAsRead}
            disabled={!notifications.some(n => !n.read)}
          >
            Đánh dấu đã đọc tất cả
          </Button>
        </div>
      </div>

      {filteredNotifications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-200 bg-white p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
            <Bell className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-medium text-neutral-900">Không có thông báo</h3>
          <p className="mt-1 text-sm text-neutral-600">
            Bạn đã đọc tất cả các thông báo gần đây.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`rounded-xl border p-4 ${
                notification.read
                  ? 'border-neutral-200 bg-white'
                  : 'border-brand-red-200 bg-brand-red-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-neutral-900">
                        {notification.title}
                      </h3>
                      <p className="mt-1 text-sm text-neutral-600">
                        {notification.message}
                      </p>
                      <p className="mt-2 text-xs text-neutral-500">
                        {notification.timestamp.toLocaleString('vi-VN')}
                      </p>
                    </div>
                    {!notification.read && (
                      <Button
                        variant="transparent"
                        size="small"
                        className="h-7 w-7 p-0"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => deleteNotification(notification.id)}
                  className="text-neutral-400 hover:text-neutral-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
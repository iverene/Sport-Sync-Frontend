import React, { useState } from 'react';
import { Bell, Trash2, X, AlertTriangle, Info, CheckCircle } from 'lucide-react';

export default function NotificationPanel() {
  const [isOpen, setIsOpen] = useState(true);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'warning',
      title: 'Low Stock Alert',
      message: 'Coca Cola has only 5 units remaining',
      time: 'Just now',
      read: false
    },
    {
      id: 2,
      type: 'info',
      title: 'System Update',
      message: 'System maintenance scheduled for tonight',
      time: '1h ago',
      read: false
    },
    {
      id: 3,
      type: 'success',
      title: 'Order Completed',
      message: 'Order #12345 has been successfully processed',
      time: '2h ago',
      read: true
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getIcon = (type) => {
    switch(type) {
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      default:
        return <Bell className="w-5 h-5 text-slate-500" />;
    }
  };

  const getBorderColor = (type) => {
    switch(type) {
      case 'warning':
        return 'border-l-amber-500';
      case 'info':
        return 'border-l-blue-500';
      case 'success':
        return 'border-l-emerald-500';
      default:
        return 'border-l-slate-500';
    }
  };

  return (
    <div className="min-h-screen p-8 flex justify-center items-start">
      <div className="relative">
        {/* Notification Panel */}
        <div className="w-96 bg-white rounded-xl shadow-2xl border border-blue-200 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-blue-100 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-white" />
                <h3 className="font-semibold text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="bg-blue-400 text-white text-xs font-bold rounded-full px-2 py-0.5 shadow-lg">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={clearAll}
                  className="p-1.5 hover:bg-blue-700 rounded transition-all duration-200"
                  title="Clear all"
                >
                  <Trash2 className="w-4 h-4 text-white" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-blue-700 rounded transition-all duration-200"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <Bell className="w-12 h-12 mx-auto mb-3 text-blue-200" />
                  <p className="text-slate-600">No notifications</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-l-4 ${getBorderColor(notification.type)} ${
                      notification.read ? 'bg-white' : 'bg-blue-50'
                    } hover:bg-slate-50 transition-all duration-200 cursor-pointer border-b border-blue-50`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-slate-800 text-sm">
                            {notification.title}
                          </h4>
                          <span className="text-xs text-slate-500 whitespace-nowrap">
                            {notification.time}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          {!notification.read && (
                            <span className="flex items-center gap-1 text-xs text-blue-700 font-medium">
                              <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                              Unread
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        className="flex-shrink-0 p-1 hover:bg-slate-200 rounded transition-all duration-200"
                      >
                        <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-blue-100 bg-gradient-to-r from-blue-50 via-white to-blue-50">
                <button className="w-full text-sm text-blue-700 hover:text-blue-900 font-semibold transition-colors duration-200">
                  View all notifications
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
  );
}
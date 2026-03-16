// Notification Center - Bell icon with dropdown showing notifications
import React, { useState, useEffect, useRef } from 'react';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  dismissNotification,
  clearAllNotifications,
  type Notification,
} from '../../services/notificationService';

export const NotificationCenter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load notifications
  const loadNotifications = () => {
    setNotifications(getNotifications().filter(n => !n.dismissed));
    setUnreadCount(getUnreadCount());
  };

  useEffect(() => {
    loadNotifications();
    // Refresh every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
    loadNotifications();
  };

  const handleDismiss = (id: string) => {
    dismissNotification(id);
    loadNotifications();
  };

  const handleMarkAllRead = () => {
    markAllAsRead();
    loadNotifications();
  };

  const handleClearAll = () => {
    clearAllNotifications();
    loadNotifications();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                <span className="text-3xl">🔔</span>
                <p className="mt-2">No notifications yet</p>
              </div>
            ) : (
              notifications.map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onRead={() => handleMarkAsRead(notification.id)}
                  onDismiss={() => handleDismiss(notification.id)}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};


// Individual Notification Item
interface NotificationItemProps {
  notification: Notification;
  onRead: () => void;
  onDismiss: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onRead, onDismiss }) => {
  const timeAgo = formatTimeAgo(new Date(notification.timestamp));

  return (
    <div
      className={`px-4 py-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
        !notification.read ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''
      }`}
    >
      <div className="flex gap-3">
        <span className="text-xl flex-shrink-0">{notification.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={`text-sm ${!notification.read ? 'font-semibold' : ''} text-gray-900 dark:text-white`}>
              {notification.title}
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDismiss();
              }}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0"
              aria-label="Dismiss"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">
            {notification.message}
          </p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-400">{timeAgo}</span>
            {!notification.read && (
              <button
                onClick={onRead}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Mark as read
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
}

export default NotificationCenter;

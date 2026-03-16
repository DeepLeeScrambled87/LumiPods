// Notification Service - Reminders for VR sessions, French practice, activities
import { storage } from '../lib/storage';

export type NotificationType = 'vr-session' | 'french-practice' | 'activity' | 'streak' | 'achievement' | 'reminder';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  icon: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  learnerId?: string;
  scheduledFor?: string;
  dismissed?: boolean;
}

const NOTIFICATIONS_KEY = 'notifications';
const NOTIFICATION_SETTINGS_KEY = 'notification-settings';

export interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  vrReminders: boolean;
  frenchReminders: boolean;
  streakReminders: boolean;
  dailyDigest: boolean;
  reminderMinutesBefore: number;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  sound: true,
  vrReminders: true,
  frenchReminders: true,
  streakReminders: true,
  dailyDigest: true,
  reminderMinutesBefore: 15,
};

// Get all notifications
export const getNotifications = (): Notification[] => {
  return storage.get<Notification[]>(NOTIFICATIONS_KEY, []);
};

// Get unread count
export const getUnreadCount = (): number => {
  return getNotifications().filter(n => !n.read && !n.dismissed).length;
};

// Add a notification
export const addNotification = (
  type: NotificationType,
  title: string,
  message: string,
  options?: Partial<Notification>
): Notification => {
  const notification: Notification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    type,
    title,
    message,
    icon: getIconForType(type),
    timestamp: new Date().toISOString(),
    read: false,
    ...options,
  };

  const notifications = getNotifications();
  notifications.unshift(notification);
  
  // Keep only last 50 notifications
  storage.set(NOTIFICATIONS_KEY, notifications.slice(0, 50));

  // Show browser notification if enabled
  showBrowserNotification(notification);

  return notification;
};

// Mark as read
export const markAsRead = (notificationId: string): void => {
  const notifications = getNotifications();
  const index = notifications.findIndex(n => n.id === notificationId);
  if (index >= 0) {
    notifications[index].read = true;
    storage.set(NOTIFICATIONS_KEY, notifications);
  }
};

// Mark all as read
export const markAllAsRead = (): void => {
  const notifications = getNotifications().map(n => ({ ...n, read: true }));
  storage.set(NOTIFICATIONS_KEY, notifications);
};

// Dismiss notification
export const dismissNotification = (notificationId: string): void => {
  const notifications = getNotifications();
  const index = notifications.findIndex(n => n.id === notificationId);
  if (index >= 0) {
    notifications[index].dismissed = true;
    storage.set(NOTIFICATIONS_KEY, notifications);
  }
};

// Clear all notifications
export const clearAllNotifications = (): void => {
  storage.set(NOTIFICATIONS_KEY, []);
};

// Get notification settings
export const getNotificationSettings = (): NotificationSettings => {
  return storage.get<NotificationSettings>(NOTIFICATION_SETTINGS_KEY, DEFAULT_SETTINGS);
};

// Update notification settings
export const updateNotificationSettings = (settings: Partial<NotificationSettings>): void => {
  const current = getNotificationSettings();
  storage.set(NOTIFICATION_SETTINGS_KEY, { ...current, ...settings });
};

// Request browser notification permission
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) return false;
  
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  
  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

// Show browser notification
const showBrowserNotification = async (notification: Notification): Promise<void> => {
  const settings = getNotificationSettings();
  if (!settings.enabled) return;
  
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  try {
    new Notification(notification.title, {
      body: notification.message,
      icon: '/vite.svg',
      tag: notification.id,
      silent: !settings.sound,
    });
  } catch (error) {
    console.error('Failed to show notification:', error);
  }
};

// Get icon for notification type
function getIconForType(type: NotificationType): string {
  const icons: Record<NotificationType, string> = {
    'vr-session': '🥽',
    'french-practice': '🇫🇷',
    'activity': '📚',
    'streak': '🔥',
    'achievement': '🏆',
    'reminder': '⏰',
  };
  return icons[type];
}


// ============ Scheduled Notifications ============

interface ScheduledReminder {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  scheduledFor: string;
  learnerId?: string;
  recurring?: 'daily' | 'weekly';
}

const SCHEDULED_KEY = 'scheduled-reminders';

// Schedule a reminder
export const scheduleReminder = (
  type: NotificationType,
  title: string,
  message: string,
  scheduledFor: Date,
  options?: { learnerId?: string; recurring?: 'daily' | 'weekly' }
): ScheduledReminder => {
  const reminder: ScheduledReminder = {
    id: `reminder-${Date.now()}`,
    type,
    title,
    message,
    scheduledFor: scheduledFor.toISOString(),
    ...options,
  };

  const reminders = storage.get<ScheduledReminder[]>(SCHEDULED_KEY, []);
  reminders.push(reminder);
  storage.set(SCHEDULED_KEY, reminders);

  return reminder;
};

// Cancel a scheduled reminder
export const cancelReminder = (reminderId: string): void => {
  const reminders = storage.get<ScheduledReminder[]>(SCHEDULED_KEY, []);
  storage.set(SCHEDULED_KEY, reminders.filter(r => r.id !== reminderId));
};

// Check and trigger due reminders (call this periodically)
export const checkScheduledReminders = (): void => {
  const settings = getNotificationSettings();
  if (!settings.enabled) return;

  const now = new Date();
  const reminders = storage.get<ScheduledReminder[]>(SCHEDULED_KEY, []);
  const remaining: ScheduledReminder[] = [];

  for (const reminder of reminders) {
    const scheduledTime = new Date(reminder.scheduledFor);
    
    if (scheduledTime <= now) {
      // Trigger the notification
      addNotification(reminder.type, reminder.title, reminder.message, {
        learnerId: reminder.learnerId,
      });

      // Handle recurring reminders
      if (reminder.recurring) {
        const nextTime = new Date(scheduledTime);
        if (reminder.recurring === 'daily') {
          nextTime.setDate(nextTime.getDate() + 1);
        } else {
          nextTime.setDate(nextTime.getDate() + 7);
        }
        remaining.push({ ...reminder, scheduledFor: nextTime.toISOString() });
      }
    } else {
      remaining.push(reminder);
    }
  }

  storage.set(SCHEDULED_KEY, remaining);
};

// ============ Pre-built Notification Helpers ============

export const notifyVRSessionSoon = (appName: string, minutesUntil: number, learnerId?: string): void => {
  addNotification(
    'vr-session',
    'VR Session Starting Soon',
    `${appName} session starts in ${minutesUntil} minutes. Get your headset ready!`,
    { learnerId, actionUrl: '/calendar' }
  );
};

export const notifyFrenchPractice = (learnerId?: string): void => {
  addNotification(
    'french-practice',
    'Time for French Practice!',
    'Bonjour! Ready for your daily French conversation with Lumi?',
    { learnerId, actionUrl: '/tutor' }
  );
};

export const notifyStreakAtRisk = (currentStreak: number, learnerId?: string): void => {
  addNotification(
    'streak',
    'Streak at Risk! 🔥',
    `Your ${currentStreak}-day streak will end if you don't complete an activity today!`,
    { learnerId, actionUrl: '/dashboard' }
  );
};

export const notifyAchievement = (title: string, points: number, learnerId?: string): void => {
  addNotification(
    'achievement',
    'Achievement Unlocked! 🏆',
    `${title} - You earned ${points} points!`,
    { learnerId, actionUrl: '/rewards' }
  );
};

export const notifyDailyDigest = (blocksCompleted: number, pointsEarned: number): void => {
  addNotification(
    'reminder',
    'Daily Learning Summary',
    `Great job today! You completed ${blocksCompleted} blocks and earned ${pointsEarned} points.`,
    { actionUrl: '/progress' }
  );
};

// Start the reminder checker (call on app init)
let reminderInterval: ReturnType<typeof setInterval> | null = null;

export const startReminderChecker = (): void => {
  if (reminderInterval) return;
  
  // Check every minute
  reminderInterval = setInterval(checkScheduledReminders, 60000);
  
  // Also check immediately
  checkScheduledReminders();
};

export const stopReminderChecker = (): void => {
  if (reminderInterval) {
    clearInterval(reminderInterval);
    reminderInterval = null;
  }
};

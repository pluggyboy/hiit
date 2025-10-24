// Notification utilities for PWA

// Daily reminder times (24-hour format)
export const REMINDER_TIMES = [
  { hour: 9, minute: 0 },   // 9:00 AM
  { hour: 12, minute: 0 },  // 12:00 PM
  { hour: 15, minute: 0 },  // 3:00 PM
  { hour: 18, minute: 0 },  // 6:00 PM
  { hour: 21, minute: 0 },  // 9:00 PM
];

// Local storage keys
const REMINDERS_ENABLED_KEY = 'workoutRemindersEnabled';
const LAST_WORKOUT_DATE_KEY = 'lastWorkoutDate';
const LAST_REMINDER_SHOWN_KEY = 'lastReminderShown';

// Check if notifications are supported
export const isNotificationSupported = (): boolean => {
  return typeof window !== 'undefined' && 'Notification' in window;
};

// Request notification permission
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!isNotificationSupported()) {
    return false;
  }

  // Check if we already have permission
  if (Notification.permission === 'granted') {
    return true;
  }

  // Request permission from the user
  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

// Send a notification via service worker (works better on Android)
export const sendNotification = async (title: string, options?: NotificationOptions): Promise<boolean> => {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  try {
    // Try to use service worker if available (better for PWA)
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, {
        icon: '/icon-192.svg',
        badge: '/favicon.ico',
        tag: 'workout-reminder',
        renotify: true,
        requireInteraction: true,
        ...options
      } as NotificationOptions);
      return true;
    } else {
      // Fallback to regular notification
      new Notification(title, options);
      return true;
    }
  } catch (error) {
    console.error('Error sending notification:', error);
    return false;
  }
};

// Get the next scheduled reminder time
const getNextReminderTime = (): { hour: number; minute: number } | null => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // Find the next reminder time today
  for (const time of REMINDER_TIMES) {
    if (time.hour > currentHour || (time.hour === currentHour && time.minute > currentMinute)) {
      return time;
    }
  }

  // If no more reminders today, return the first one for tomorrow
  return REMINDER_TIMES[0];
};

// Check if we should show a reminder now
const shouldShowReminderNow = (): boolean => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // Check if current time matches any reminder time (within 5 minutes)
  for (const time of REMINDER_TIMES) {
    const timeDiff = Math.abs((currentHour * 60 + currentMinute) - (time.hour * 60 + time.minute));
    if (timeDiff <= 5) {
      // Check if we already showed a reminder in the last hour
      const lastShown = localStorage.getItem(LAST_REMINDER_SHOWN_KEY);
      if (lastShown) {
        const hoursSinceLastReminder = (Date.now() - parseInt(lastShown)) / (1000 * 60 * 60);
        if (hoursSinceLastReminder < 1) {
          return false; // Don't spam notifications
        }
      }
      return true;
    }
  }

  return false;
};

// Check if a workout was completed today
const workoutCompletedToday = (): boolean => {
  const lastWorkoutDate = localStorage.getItem(LAST_WORKOUT_DATE_KEY);
  if (!lastWorkoutDate) return false;
  
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const lastWorkoutDay = new Date(lastWorkoutDate).toISOString().split('T')[0];
  
  return today === lastWorkoutDay;
};

// Check and show reminder if needed (call this when app opens or comes to foreground)
export const checkAndShowReminder = async (): Promise<void> => {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return;
  }

  if (!areRemindersEnabled()) {
    return;
  }

  // If workout already completed today, don't show reminders
  if (workoutCompletedToday()) {
    return;
  }

  // Check if we should show a reminder now
  if (shouldShowReminderNow()) {
    const nextTime = getNextReminderTime();
    if (nextTime) {
      const formattedTime = `${nextTime.hour % 12 || 12}:${nextTime.minute.toString().padStart(2, '0')} ${nextTime.hour < 12 ? 'AM' : 'PM'}`;

      await sendNotification('Time for your HIIT Workout!', {
        body: `It's around ${formattedTime} - a perfect time to maintain your workout streak!`,
        icon: '/icon-192.svg',
        badge: '/favicon.ico',
        requireInteraction: true
      });

      // Mark that we showed a reminder
      localStorage.setItem(LAST_REMINDER_SHOWN_KEY, Date.now().toString());
    }
  }
};

// Setup periodic checks for reminders (called when app is active)
export const setupReminderChecks = (): (() => void) => {
  // Check immediately
  checkAndShowReminder();

  // Check every 5 minutes while app is active
  const intervalId = setInterval(() => {
    checkAndShowReminder();
  }, 5 * 60 * 1000); // 5 minutes

  // Also check when page becomes visible
  const handleVisibilityChange = () => {
    if (!document.hidden) {
      checkAndShowReminder();
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Return cleanup function
  return () => {
    clearInterval(intervalId);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
};

// Record workout completion
export const recordWorkoutCompletion = (): void => {
  const today = new Date().toISOString();
  localStorage.setItem(LAST_WORKOUT_DATE_KEY, today);

  // No need to clear timers with new system - it checks workout completion automatically
};

// Check if reminders are enabled
export const areRemindersEnabled = (): boolean => {
  return typeof window !== 'undefined' && 
         localStorage.getItem(REMINDERS_ENABLED_KEY) === 'true';
};

// Enable workout reminders
export const enableReminders = async (): Promise<boolean> => {
  const hasPermission = await requestNotificationPermission();
  if (hasPermission) {
    localStorage.setItem(REMINDERS_ENABLED_KEY, 'true');
    // Check immediately if we should show a reminder
    checkAndShowReminder();
    return true;
  }
  return false;
};

// Disable workout reminders
export const disableReminders = (): void => {
  localStorage.setItem(REMINDERS_ENABLED_KEY, 'false');
};

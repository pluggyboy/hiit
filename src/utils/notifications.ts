// Notification utilities

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
const REMINDER_TIMERS_KEY = 'reminderTimers';

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

// Send a notification
export const sendNotification = (title: string, options?: NotificationOptions): boolean => {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  try {
    new Notification(title, options);
    return true;
  } catch (error) {
    console.error('Error sending notification:', error);
    return false;
  }
};

// Get time until a specific hour and minute today (or tomorrow if already passed)
const getTimeUntil = (hour: number, minute: number): number => {
  const now = new Date();
  const target = new Date(now);
  
  target.setHours(hour, minute, 0, 0);
  
  // If the target time has already passed today, set it for tomorrow
  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1);
  }
  
  return target.getTime() - now.getTime();
};

// Clear all existing reminder timers
const clearReminderTimers = (): void => {
  const timerIds = JSON.parse(localStorage.getItem(REMINDER_TIMERS_KEY) || '[]');
  timerIds.forEach((id: number) => window.clearTimeout(id));
  localStorage.setItem(REMINDER_TIMERS_KEY, '[]');
};

// Check if a workout was completed today
const workoutCompletedToday = (): boolean => {
  const lastWorkoutDate = localStorage.getItem(LAST_WORKOUT_DATE_KEY);
  if (!lastWorkoutDate) return false;
  
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const lastWorkoutDay = new Date(lastWorkoutDate).toISOString().split('T')[0];
  
  return today === lastWorkoutDay;
};

// Schedule all notification reminders for the day
export const scheduleAllReminders = (): number[] => {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return [];
  }
  
  // Clear any existing timers
  clearReminderTimers();
  
  // If workout already completed today, don't schedule reminders
  if (workoutCompletedToday()) {
    return [];
  }
  
  const timerIds: number[] = [];
  
  // Schedule a reminder for each time
  REMINDER_TIMES.forEach(({ hour, minute }) => {
    const timeUntil = getTimeUntil(hour, minute);
    
    // Only schedule reminders for future times
    if (timeUntil > 0) {
      const formattedTime = `${hour % 12 || 12}:${minute.toString().padStart(2, '0')} ${hour < 12 ? 'AM' : 'PM'}`;
      
      const timerId = window.setTimeout(() => {
        // Check again if workout was completed before sending notification
        if (!workoutCompletedToday()) {
          sendNotification('Time for your HIIT Workout!', {
            body: `It's ${formattedTime} - a perfect time to maintain your workout streak!`,
            icon: '/favicon.ico',
            requireInteraction: true
          });
        }
        
        // After sending, schedule the same reminder for tomorrow
        scheduleAllReminders();
      }, timeUntil);
      
      timerIds.push(timerId);
    }
  });
  
  // Store timer IDs in local storage
  localStorage.setItem(REMINDER_TIMERS_KEY, JSON.stringify(timerIds));
  
  return timerIds;
};

// Record workout completion
export const recordWorkoutCompletion = (): void => {
  const today = new Date().toISOString();
  localStorage.setItem(LAST_WORKOUT_DATE_KEY, today);
  
  // Clear reminders for today since workout is completed
  clearReminderTimers();
  
  // Schedule reminders for tomorrow
  if (areRemindersEnabled()) {
    scheduleAllReminders();
  }
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
    scheduleAllReminders();
    return true;
  }
  return false;
};

// Disable workout reminders
export const disableReminders = (): void => {
  localStorage.setItem(REMINDERS_ENABLED_KEY, 'false');
  clearReminderTimers();
};

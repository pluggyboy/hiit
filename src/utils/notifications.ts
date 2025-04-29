// Notification utilities

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

// Schedule a notification reminder for workout
export const scheduleWorkoutReminder = () => {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  // Store the scheduled time in local storage
  const reminderTime = new Date();
  reminderTime.setHours(reminderTime.getHours() + 24); // 24 hours from now
  localStorage.setItem('nextWorkoutReminder', reminderTime.toString());

  // In a real app, we would use a service worker with Push API or a backend service
  // For this demo, we'll use setTimeout, which only works while the browser tab is open
  setTimeout(() => {
    sendNotification('Keep Your Streak Going!', {
      body: 'It\'s time for your daily workout. Don\'t break your streak!',
      icon: '/favicon.ico',
      requireInteraction: true
    });
  }, 24 * 60 * 60 * 1000); // 24 hours in milliseconds

  return true;
};

// Check if reminders are enabled
export const areRemindersEnabled = (): boolean => {
  return typeof window !== 'undefined' && 
         localStorage.getItem('workoutRemindersEnabled') === 'true';
};

// Enable workout reminders
export const enableReminders = async (): Promise<boolean> => {
  const hasPermission = await requestNotificationPermission();
  if (hasPermission) {
    localStorage.setItem('workoutRemindersEnabled', 'true');
    scheduleWorkoutReminder();
    return true;
  }
  return false;
};

// Disable workout reminders
export const disableReminders = (): void => {
  localStorage.setItem('workoutRemindersEnabled', 'false');
};

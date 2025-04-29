"use client";

import React, { useState, useEffect } from 'react';
import { getStreakData } from '@/utils/streak';
import { 
  isNotificationSupported, 
  areRemindersEnabled, 
  enableReminders, 
  disableReminders 
} from '@/utils/notifications';

interface StreakData {
  currentStreak: number;
  lastWorkoutDate: string | null;
  bestStreak: number;
  totalWorkouts: number;
}

const StreakDisplay: React.FC = () => {
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    lastWorkoutDate: null,
    bestStreak: 0,
    totalWorkouts: 0
  });
  const [notificationsSupported, setNotificationsSupported] = useState(false);
  const [remindersEnabled, setRemindersEnabled] = useState(false);

  // Load streak data and notification settings
  useEffect(() => {
    // Only run in the browser
    if (typeof window !== 'undefined') {
      setStreakData(getStreakData());
      setNotificationsSupported(isNotificationSupported());
      setRemindersEnabled(areRemindersEnabled());
    }
  }, []);

  // Handle toggle of reminder settings
  const handleReminderToggle = async () => {
    if (remindersEnabled) {
      disableReminders();
      setRemindersEnabled(false);
    } else {
      const enabled = await enableReminders();
      setRemindersEnabled(enabled);
    }
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
      <h2 className="text-xl font-bold text-center mb-4">Your Workout Streak</h2>
      
      <div className="flex justify-between items-center mb-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-green-500">{streakData.currentStreak}</div>
          <div className="text-sm text-gray-500">Current Streak</div>
        </div>
        
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-500">{streakData.bestStreak}</div>
          <div className="text-sm text-gray-500">Best Streak</div>
        </div>
        
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-500">{streakData.totalWorkouts}</div>
          <div className="text-sm text-gray-500">Total Workouts</div>
        </div>
      </div>
      
      <div className="text-sm text-gray-600 mb-4">
        Last workout: {formatDate(streakData.lastWorkoutDate)}
      </div>
      
      {notificationsSupported && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm">Daily workout reminders</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={remindersEnabled}
              onChange={handleReminderToggle}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      )}
      
      {streakData.currentStreak > 0 && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-700">
          <p className="font-semibold">🔥 Keep it up!</p>
          <p>You're on a {streakData.currentStreak} day streak. Don't break the chain!</p>
        </div>
      )}
      
      {streakData.currentStreak === 0 && streakData.totalWorkouts > 0 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-700">
          <p className="font-semibold">💪 Start a new streak!</p>
          <p>Complete a workout today to begin a new streak.</p>
        </div>
      )}
      
      {streakData.totalWorkouts === 0 && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-700">
          <p className="font-semibold">🌟 Welcome!</p>
          <p>Complete your first workout to start your streak.</p>
        </div>
      )}
    </div>
  );
};

export default StreakDisplay;

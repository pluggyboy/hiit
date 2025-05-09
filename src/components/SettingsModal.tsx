"use client";

import React, { useState, useEffect } from 'react';
import { areRemindersEnabled, enableReminders, disableReminders } from '@/utils/notifications';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  prepareTime: number;
  exerciseTime: number;
  restTime: number;
  roundRestTime: number;
  onPrepareTimeChange: (value: number) => void;
  onExerciseTimeChange: (value: number) => void;
  onRestTimeChange: (value: number) => void;
  onRoundRestTimeChange: (value: number) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  prepareTime,
  exerciseTime,
  restTime,
  roundRestTime,
  onPrepareTimeChange,
  onExerciseTimeChange,
  onRestTimeChange,
  onRoundRestTimeChange
}) => {
  const [notificationsSupported, setNotificationsSupported] = useState(false);
  const [remindersEnabled, setRemindersEnabled] = useState(false);

  // Load notification settings
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setNotificationsSupported('Notification' in window);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Preparation Time Slider */}
          <div>
            <label className="flex justify-between mb-2">
              <span>Preparation Time</span>
              <span className="text-blue-500">{prepareTime} seconds</span>
            </label>
            <input
              type="range"
              min="3"
              max="15"
              step="1"
              value={prepareTime}
              onChange={(e) => onPrepareTimeChange(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Exercise Time Slider */}
          <div>
            <label className="flex justify-between mb-2">
              <span>Exercise Time</span>
              <span className="text-green-500">{exerciseTime} seconds</span>
            </label>
            <input
              type="range"
              min="10"
              max="60"
              step="5"
              value={exerciseTime}
              onChange={(e) => onExerciseTimeChange(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Rest Time Between Exercises Slider */}
          <div>
            <label className="flex justify-between mb-2">
              <span>Rest Between Exercises</span>
              <span className="text-blue-500">{restTime} seconds</span>
            </label>
            <input
              type="range"
              min="0"
              max="30"
              step="5"
              value={restTime}
              onChange={(e) => onRestTimeChange(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Round Rest Time Slider */}
          <div>
            <label className="flex justify-between mb-2">
              <span>Rest Between Rounds</span>
              <span className="text-purple-500">{roundRestTime} seconds</span>
            </label>
            <input
              type="range"
              min="30"
              max="180"
              step="15"
              value={roundRestTime}
              onChange={(e) => onRoundRestTimeChange(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Notification Settings */}
          {notificationsSupported && (
            <div className="pt-4 border-t border-gray-200 space-y-3">
              <div className="flex items-center justify-between">
                <span>Daily workout reminders</span>
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
              <p className="text-xs text-gray-500">
                When enabled, you'll receive workout reminders at 9am, 12pm, 3pm, 6pm, and 9pm until you complete your daily workout. Reminders stop for the day once you complete a workout.
              </p>
            </div>
          )}
        </div>

        <div className="mt-6">
          <button
            onClick={onClose}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded w-full"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;

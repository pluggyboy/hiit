"use client";

import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { getStreakData } from '@/utils/streak';

interface StreakData {
  currentStreak: number;
  lastWorkoutDate: string | null;
  bestStreak: number;
  totalWorkouts: number;
}

export interface StreakDisplayRef {
  refreshStreakData: () => void;
}

const StreakDisplay = forwardRef<StreakDisplayRef, {}>((props, ref) => {
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    lastWorkoutDate: null,
    bestStreak: 0,
    totalWorkouts: 0
  });
  
  // Load streak data
  useEffect(() => {
    // Only run in the browser
    if (typeof window !== 'undefined') {
      setStreakData(getStreakData());
    }
  }, []);
  
  // Refresh streak data manually
  const refreshStreakData = () => {
    if (typeof window !== 'undefined') {
      setStreakData(getStreakData());
    }
  };
  
  // Expose the refresh method to parent components
  useImperativeHandle(ref, () => ({
    refreshStreakData
  }));

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
    <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
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
});

export default StreakDisplay;

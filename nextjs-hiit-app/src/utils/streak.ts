// Streak management utilities
type StreakData = {
  currentStreak: number;
  lastWorkoutDate: string | null;
  bestStreak: number;
  totalWorkouts: number;
};

const STREAK_STORAGE_KEY = 'hiit-workout-streak';

// Initialize streak data
export const initializeStreakData = (): StreakData => {
  if (typeof window === 'undefined') {
    return {
      currentStreak: 0,
      lastWorkoutDate: null,
      bestStreak: 0,
      totalWorkouts: 0
    };
  }

  const storedData = localStorage.getItem(STREAK_STORAGE_KEY);
  if (!storedData) {
    const initialData: StreakData = {
      currentStreak: 0,
      lastWorkoutDate: null,
      bestStreak: 0,
      totalWorkouts: 0
    };
    localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(initialData));
    return initialData;
  }

  return JSON.parse(storedData);
};

// Record a completed workout
export const recordWorkout = (): StreakData => {
  if (typeof window === 'undefined') {
    return {
      currentStreak: 0,
      lastWorkoutDate: null,
      bestStreak: 0,
      totalWorkouts: 0
    };
  }

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const storedData = localStorage.getItem(STREAK_STORAGE_KEY);
  const data: StreakData = storedData ? JSON.parse(storedData) : {
    currentStreak: 0,
    lastWorkoutDate: null,
    bestStreak: 0,
    totalWorkouts: 0
  };

  // Calculate if streak should increase
  let newStreak = data.currentStreak;
  if (data.lastWorkoutDate) {
    const lastDate = new Date(data.lastWorkoutDate);
    const currentDate = new Date(today);
    
    // Check if this is a new day (not the same day as last workout)
    if (today !== data.lastWorkoutDate) {
      // Check if it's the next day or if we've missed days
      const timeDiff = currentDate.getTime() - lastDate.getTime();
      const dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
      
      if (dayDiff === 1) {
        // It's the next day, increase streak
        newStreak++;
      } else if (dayDiff > 1) {
        // Missed days, reset streak
        newStreak = 1;
      }
    }
  } else {
    // First workout
    newStreak = 1;
  }

  const updatedData: StreakData = {
    currentStreak: newStreak,
    lastWorkoutDate: today,
    bestStreak: Math.max(newStreak, data.bestStreak),
    totalWorkouts: data.totalWorkouts + 1
  };

  localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(updatedData));
  return updatedData;
};

// Check if the streak is at risk (no workout in the last day)
export const checkStreakRisk = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  const storedData = localStorage.getItem(STREAK_STORAGE_KEY);
  if (!storedData) return false;

  const data: StreakData = JSON.parse(storedData);
  if (!data.lastWorkoutDate) return false;

  const lastDate = new Date(data.lastWorkoutDate);
  const today = new Date();
  const timeDiff = today.getTime() - lastDate.getTime();
  const dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24));

  // Streak is at risk if the last workout was yesterday (and none today)
  return dayDiff === 1;
};

// Get streak data
export const getStreakData = (): StreakData => {
  if (typeof window === 'undefined') {
    return {
      currentStreak: 0,
      lastWorkoutDate: null,
      bestStreak: 0,
      totalWorkouts: 0
    };
  }

  const storedData = localStorage.getItem(STREAK_STORAGE_KEY);
  return storedData ? JSON.parse(storedData) : {
    currentStreak: 0,
    lastWorkoutDate: null,
    bestStreak: 0,
    totalWorkouts: 0
  };
};

// Exercise management utilities

const EXERCISES_STORAGE_KEY = 'hiit-exercises-order';

// Default exercise list
export const DEFAULT_EXERCISES = [
  "Goblet Squats",
  "Push-ups/Chest Press",
  "Romanian Deadlifts",
  "Dumbbell Rows",
  "Lunges",
  "Shoulder Press"
];

// Map exercise names to their image paths
export const EXERCISE_IMAGES: Record<string, string> = {
  "Goblet Squats": "/goblet squat.png",
  "Push-ups/Chest Press": "/push ups.png",
  "Romanian Deadlifts": "/romanian_deadlift.png",
  "Dumbbell Rows": "/dumbell row.png",
  "Lunges": "/lunges.png",
  "Shoulder Press": "/shoulder press.png"
};

// Load exercises from localStorage or return defaults
export const loadExercises = (): string[] => {
  if (typeof window === 'undefined') {
    return DEFAULT_EXERCISES;
  }

  const savedExercises = localStorage.getItem(EXERCISES_STORAGE_KEY);
  if (savedExercises) {
    try {
      const parsed = JSON.parse(savedExercises);
      // Validate that it's an array and has items
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {
      console.error('Error parsing saved exercises:', e);
    }
  }

  return DEFAULT_EXERCISES;
};

// Save exercises to localStorage
export const saveExercises = (exercises: string[]): void => {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(EXERCISES_STORAGE_KEY, JSON.stringify(exercises));
};

// Reset exercises to default order
export const resetExercises = (): string[] => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(EXERCISES_STORAGE_KEY);
  }
  return DEFAULT_EXERCISES;
};

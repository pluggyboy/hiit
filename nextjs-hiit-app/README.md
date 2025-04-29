# HIIT Workout Timer

A High-Intensity Interval Training (HIIT) timer app built with Next.js and TypeScript. Perfect for guiding you through your workout sessions with timed intervals.

## Features

- Customizable number of rounds
- Visual and audio cues for transitions
- Progress tracking
- Responsive design for mobile and desktop
- Exercise list with current and upcoming exercises
- Visual flashing and audio beep for the last 5 seconds of exercise
- Exercise images for better form guidance
- Workout streak tracking for motivation
- Browser notifications to remind you of daily workouts
- Service worker for offline support

## Exercises

The app includes a built-in workout routine with the following exercises:
1. Goblet Squats
2. Push-ups/Chest Press
3. Romanian Deadlifts
4. Dumbbell Rows
5. Lunges
6. Shoulder Press

## Workout Structure

- 5-second preparation phase before each exercise
- 20-second high-intensity exercise phase
- 75-second rest between rounds
- Customizable number of rounds (default: 3)

## Getting Started

### Development

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Building for Production

```bash
# Build the app
npm run build
```

### Deployment

This app is configured for easy deployment to Vercel. Simply connect your repository to Vercel, and it will automatically build and deploy your app.

## Technologies Used

- Next.js
- TypeScript
- Tailwind CSS
- React Hooks
- LocalStorage for streak tracking
- Web Notifications API
- Service Workers for offline functionality

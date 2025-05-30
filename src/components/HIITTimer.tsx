"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { recordWorkout, getStreakData } from '@/utils/streak';
import { recordWorkoutCompletion, areRemindersEnabled } from '@/utils/notifications';

// Timer settings storage keys and defaults
const TIMER_SETTINGS_KEY = 'hiit-timer-settings';
const DEFAULT_PREPARE_TIME = 5;
const DEFAULT_EXERCISE_TIME = 20;
const DEFAULT_REST_TIME = 0;
const DEFAULT_ROUND_REST_TIME = 75;

// Functions to save and load timer settings
const saveTimerSettings = (settings: {
  prepareTime: number;
  exerciseTime: number;
  restTime: number;
  roundRestTime: number;
}) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TIMER_SETTINGS_KEY, JSON.stringify(settings));
  }
};

const loadTimerSettings = () => {
  if (typeof window !== 'undefined') {
    const savedSettings = localStorage.getItem(TIMER_SETTINGS_KEY);
    if (savedSettings) {
      try {
        return JSON.parse(savedSettings);
      } catch (e) {
        console.error('Error parsing saved timer settings:', e);
      }
    }
  }
  return {
    prepareTime: DEFAULT_PREPARE_TIME,
    exerciseTime: DEFAULT_EXERCISE_TIME,
    restTime: DEFAULT_REST_TIME,
    roundRestTime: DEFAULT_ROUND_REST_TIME
  };
};
import StreakDisplay, { StreakDisplayRef } from './StreakDisplay';
import SettingsModal from './SettingsModal';
import ReactConfetti from 'react-confetti';

const HIITTimer = () => {
  // Map exercise names to their image paths
  const exerciseImages: Record<string, string> = {
    "Goblet Squats": "/goblet squat.png",
    "Push-ups/Chest Press": "/push ups.png",
    "Romanian Deadlifts": "/romanian_deadlift.png",
    "Dumbbell Rows": "/dumbell row.png",
    "Lunges": "/lunges.png",
    "Shoulder Press": "/shoulder press.png"
  };
  const [started, setStarted] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [phase, setPhase] = useState('idle'); // idle, prepare, exercise, rest
  const [timeLeft, setTimeLeft] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [rounds, setRounds] = useState(3);
  const [currentRound, setCurrentRound] = useState(1);
  const [isFlashing, setIsFlashing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Configurable time settings with localStorage persistence
  const [prepareTime, setPrepareTime] = useState(DEFAULT_PREPARE_TIME);
  const [exerciseTime, setExerciseTime] = useState(DEFAULT_EXERCISE_TIME);
  const [restTime, setRestTime] = useState(DEFAULT_REST_TIME);
  const [roundRestTime, setRoundRestTime] = useState(DEFAULT_ROUND_REST_TIME);
  
  // Settings modal state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Load saved settings on component mount
  useEffect(() => {
    const savedSettings = loadTimerSettings();
    setPrepareTime(savedSettings.prepareTime);
    setExerciseTime(savedSettings.exerciseTime);
    setRestTime(savedSettings.restTime);
    setRoundRestTime(savedSettings.roundRestTime);
  }, []);
  
  // Save settings whenever they change
  useEffect(() => {
    saveTimerSettings({
      prepareTime,
      exerciseTime,
      restTime,
      roundRestTime
    });
  }, [prepareTime, exerciseTime, restTime, roundRestTime]);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const finalBeepRef = useRef<HTMLAudioElement>(null);
  const finishedAudioRef = useRef<HTMLAudioElement>(null);
  const streakDisplayRef = useRef<StreakDisplayRef>(null);
  
  const exercises = [
    "Goblet Squats",
    "Push-ups/Chest Press",
    "Romanian Deadlifts",
    "Dumbbell Rows",
    "Lunges",
    "Shoulder Press"
  ];
  
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (started && !completed) {
      if (timeLeft > 0) {
        timer = setTimeout(() => {
          setTimeLeft(timeLeft - 1);
          
          // Visual flash AND audio beep for seconds 5-2 of exercise
          // We stop at 2 to avoid playing both the countdown beep and final beep too close together
          if (phase === 'exercise' && timeLeft <= 5 && timeLeft >= 2) {
            setIsFlashing(true);
            setTimeout(() => setIsFlashing(false), 500);
            playBeep();
          }
        }, 1000);
      } else {
        // Time's up - move to next phase
        if (phase === 'prepare') {
          setPhase('exercise');
          setTimeLeft(exerciseTime);
          playBeep();
        } 
        else if (phase === 'exercise') {
          // Play only the final beep sound at the end of an exercise
          playBeep(true);
          
          // Check if this was the last exercise of the round
          if (currentExercise === exercises.length - 1) {
            // End of round
            if (currentRound < rounds) {
              // More rounds to go
              setPhase('roundRest');
              setTimeLeft(roundRestTime);
              setCurrentRound(currentRound + 1);
              setCurrentExercise(0);
            } else {
              // Workout complete
              setCompleted(true);
              setPhase('idle');
            }
          } else {
            // More exercises in this round - check if rest is enabled
            if (restTime > 0) {
              setPhase('rest');
              setTimeLeft(restTime);
              setCurrentExercise(currentExercise + 1);
            } else {
              // Skip rest phase
              setCurrentExercise(currentExercise + 1);
              setPhase('prepare');
              setTimeLeft(prepareTime);
            }
          }
        }
        else if (phase === 'rest') {
          // Move from rest to prepare phase for next exercise
          setPhase('prepare');
          setTimeLeft(prepareTime);
        }
        else if (phase === 'roundRest') {
          // Start first exercise of next round
          setPhase('prepare');
          setTimeLeft(prepareTime);
        }
      }
    }
    
    return () => clearTimeout(timer);
  }, [started, timeLeft, phase, currentExercise, exercises.length, completed, currentRound, rounds, prepareTime, exerciseTime, restTime, roundRestTime]);
  
  const startWorkout = () => {
    setStarted(true);
    setCompleted(false);
    setCurrentExercise(0);
    setCurrentRound(1);
    setPhase('prepare');
    setTimeLeft(prepareTime);
  };
  
  const resetWorkout = () => {
    setStarted(false);
    setCompleted(false);
    setCurrentExercise(0);
    setCurrentRound(1);
    setPhase('idle');
  };

  // Play completion sound
  const playFinishedSound = () => {
    if (finishedAudioRef.current) {
      finishedAudioRef.current.currentTime = 0;
      finishedAudioRef.current.play().catch(e => {
        console.log("Finished audio play failed:", e);
        // Fallback to creating a new Audio instance
        const finishedSound = new Audio("/finished.mp3");
        finishedSound.play().catch(err => console.log("Fallback finished audio failed:", err));
      });
    }
  };

  // Record workout completion and update streak
  const handleWorkoutComplete = () => {
    // Update streak data
    const updatedStreakData = recordWorkout();
    
    // Record workout completion for reminder system
    recordWorkoutCompletion();

    // Play celebration effects
    setShowConfetti(true);
    playFinishedSound();
    
    // Update streak display
    if (streakDisplayRef.current) {
      streakDisplayRef.current.refreshStreakData();
    }

    return updatedStreakData;
  };

  // Effect to handle workout completion
  useEffect(() => {
    if (completed) {
      handleWorkoutComplete();
    }
  }, [completed]);
  
  // Clear confetti after 5 seconds
  useEffect(() => {
    let confettiTimer: NodeJS.Timeout;
    
    if (showConfetti) {
      confettiTimer = setTimeout(() => {
        setShowConfetti(false);
      }, 5000);
    }
    
    return () => clearTimeout(confettiTimer);
  }, [showConfetti]);
  
  const playBeep = (isFinal: boolean = false) => {
    const audioElement = isFinal ? finalBeepRef.current : audioRef.current;
    
    if (audioElement) {
      audioElement.currentTime = 0;
      audioElement.play().catch(e => {
        console.log("Audio play failed:", e);
        // Fallback to creating a new Audio instance
        const beepFile = isFinal ? "/final beep.mp3" : "/beep.mp3";
        const beep = new Audio(beepFile);
        beep.play().catch(err => console.log("Fallback audio failed:", err));
      });
    }
  };
  
  const formatTime = (seconds: number) => {
    return seconds < 10 ? `0${seconds}` : seconds;
  };
  
  // Background color based on phase
  const getBgColor = () => {
    switch (phase) {
      case 'prepare': return 'bg-yellow-100';
      case 'exercise': return 'bg-green-100';
      case 'rest': return 'bg-blue-100';
      case 'roundRest': return 'bg-purple-100';
      default: return 'bg-gray-100';
    }
  };
  
  // Open and close settings modal
  const openSettings = () => setIsSettingsOpen(true);
  const closeSettings = () => setIsSettingsOpen(false);
  
  return (
    <div className={`min-h-screen flex flex-col items-center p-4 pt-2 ${getBgColor()}`}>
      <audio ref={audioRef} preload="auto" src="/beep.mp3" />
      <audio ref={finalBeepRef} preload="auto" src="/final beep.mp3" />
      <audio ref={finishedAudioRef} preload="auto" src="/finished.mp3" />
      
      {showConfetti && (
        <ReactConfetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={500}
          gravity={0.1}
        />
      )}
      
      {/* App title and settings button - only show when not in workout */}
      {!started && (
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-4 mb-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">HIIT Workout Timer</h1>
            <button 
              onClick={openSettings}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Settings"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </button>
          </div>
        </div>
      )}
      
      {/* Progress indicators - only shown during workout */}
      {started && !completed && (
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 sm:justify-between">
            {/* Round progress - full width on mobile, half width on desktop */}
            <div className="flex items-center w-full sm:w-auto">
              <span className="font-bold text-base mr-2">Round:</span>
              <div className="flex items-center flex-grow">
                <span className="text-xl font-semibold mr-2">{currentRound}/{rounds}</span>
                <div className="w-full sm:w-24 h-3 bg-gray-200 rounded-full">
                  <div 
                    className="h-3 bg-blue-500 rounded-full" 
                    style={{ width: `${(currentRound / rounds) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            {/* Exercise progress - full width on mobile, half width on desktop */}
            <div className="flex items-center w-full sm:w-auto">
              <span className="font-bold text-base mr-2">Exercise:</span>
              <div className="flex items-center flex-grow">
                <span className="text-xl font-semibold mr-2">{currentExercise + 1}/{exercises.length}</span>
                <div className="w-full sm:w-24 h-3 bg-gray-200 rounded-full">
                  <div 
                    className="h-3 bg-green-500 rounded-full" 
                    style={{ width: `${((currentExercise + 1) / exercises.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        
        {!started && !completed && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-row items-center justify-between">
              <label className="text-lg">Rounds:</label>
              <div className="flex items-center">
                <button 
                  className="bg-gray-200 px-3 py-1 rounded-l" 
                  onClick={() => setRounds(Math.max(1, rounds - 1))}
                >
                  -
                </button>
                <span className="px-4 py-1 bg-gray-100">{rounds}</span>
                <button 
                  className="bg-gray-200 px-3 py-1 rounded-r" 
                  onClick={() => setRounds(rounds + 1)}
                >
                  +
                </button>
              </div>
            </div>
            
            <button 
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg text-lg mt-4"
              onClick={startWorkout}
            >
              Start Workout
            </button>
          </div>
        )}
        
        {started && !completed && (
          <div className="text-center">
            <div className="mb-4">
              {phase === 'roundRest' ? (
                <h2 className="text-xl font-bold mb-2">Rest Between Rounds</h2>
              ) : (
                <>
                  <h2 className="text-3xl font-bold mb-3">
                    {exercises[currentExercise]}
                  </h2>
                  <div className="relative w-full h-48 mb-4">
                    <Image 
                      src={exerciseImages[exercises[currentExercise]]}
                      alt={exercises[currentExercise]}
                      fill
                      style={{ objectFit: 'contain' }}
                      priority
                    />
                  </div>
                </>
              )}
              
              <div className="text-sm text-gray-500">
                {phase === 'prepare' && 'Get Ready!'}
                {phase === 'exercise' && 'Work!'}
                {phase === 'roundRest' && 'Round Rest'}
              </div>
            </div>
            
            <div className="flex justify-center mb-4">
              <div className={`text-6xl font-bold ${isFlashing && phase === 'exercise' ? 'bg-red-500 text-white px-4 rounded-lg' : ''}`}>
                {formatTime(timeLeft)}
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
              <div 
                className={`h-2.5 rounded-full ${
                  phase === 'prepare' ? 'bg-yellow-500' : 
                  phase === 'exercise' ? 'bg-green-500' : 
                  phase === 'rest' ? 'bg-blue-500' : 'bg-purple-500'
                }`}
                style={{ 
                  width: `${(timeLeft / (
                    phase === 'prepare' ? prepareTime : 
                    phase === 'exercise' ? exerciseTime : 
                    phase === 'rest' ? restTime : roundRestTime
                  )) * 100}%` 
                }}
              ></div>
            </div>
            
            <div className="flex justify-between text-sm text-gray-500 mb-6">
              <div>Exercise {currentExercise + 1} of {exercises.length}</div>
              <div>
                {phase === 'exercise' && `${timeLeft}s remaining`}
                {phase === 'prepare' && `Starting in ${timeLeft}s`}
                {phase === 'rest' && `Next in ${timeLeft}s`}
                {phase === 'roundRest' && `Next round in ${timeLeft}s`}
              </div>
            </div>
            
            <button 
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
              onClick={resetWorkout}
            >
              End Workout
            </button>
          </div>
        )}
        
        {completed && (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Workout Complete!</h2>
            <p className="mb-6">Great job! You've completed all {rounds} rounds.</p>
            <div className="flex justify-center gap-2 mb-6">
              <button 
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                onClick={startWorkout}
              >
                Restart
              </button>
              <button 
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
                onClick={resetWorkout}
              >
                Reset
              </button>
            </div>
            
            {/* Show streak information */}
            <StreakDisplay ref={streakDisplayRef} />
          </div>
        )}
      </div>
      
      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={closeSettings}
        prepareTime={prepareTime}
        exerciseTime={exerciseTime}
        restTime={restTime}
        roundRestTime={roundRestTime}
        onPrepareTimeChange={setPrepareTime}
        onExerciseTimeChange={setExerciseTime}
        onRestTimeChange={setRestTime}
        onRoundRestTimeChange={setRoundRestTime}
      />
      
      {!started && !completed && (
        <div className="mt-6">
          <StreakDisplay ref={streakDisplayRef} />
        </div>
      )}
      
      {started && !completed && (
        <div className="mt-6 bg-white rounded-lg shadow-lg p-4 w-full max-w-md">
          <h3 className="font-bold mb-2">Coming Up Next:</h3>
          <ul className="space-y-2">
            {exercises.map((ex, index) => {
              // Only show future exercises, not the current one
              if (index <= currentExercise) return null;
              // Limit to the next 3 exercises
              if (index > currentExercise + 3) return null;
              
              return (
                <li 
                  key={index} 
                  className="p-2 rounded flex items-center gap-2 text-gray-500"
                >
                  <div className="relative w-10 h-10 flex-shrink-0">
                    <Image 
                      src={exerciseImages[ex]}
                      alt={ex}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <span>{index + 1}. {ex}</span>
                </li>
              );
            })}
            {currentExercise >= exercises.length - 1 && (
              <li className="p-2 text-gray-500 italic text-center">
                Last exercise in this round
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default HIITTimer;

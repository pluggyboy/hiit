import React, { useState, useEffect, useRef } from 'react';

const HIITTimer = () => {
  const [started, setStarted] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [phase, setPhase] = useState('idle'); // idle, prepare, exercise, rest
  const [timeLeft, setTimeLeft] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [rounds, setRounds] = useState(3);
  const [currentRound, setCurrentRound] = useState(1);
  const [isFlashing, setIsFlashing] = useState(false);
  
  const audioRef = useRef(null);
  
  const exercises = [
    "Goblet Squats",
    "Push-ups/Chest Press",
    "Romanian Deadlifts",
    "Dumbbell Rows",
    "Lunges",
    "Shoulder Press"
  ];
  
  const PREPARE_TIME = 5; // seconds
  const EXERCISE_TIME = 20; // seconds
  const REST_TIME = 0; // seconds between exercises (removed the quick break)
  const ROUND_REST_TIME = 75; // seconds between rounds
  
  useEffect(() => {
    let timer;
    
    if (started && !completed) {
      if (timeLeft > 0) {
        timer = setTimeout(() => {
          setTimeLeft(timeLeft - 1);
          
          // Visual flash AND audio beep for last 5 seconds of exercise
          if (phase === 'exercise' && timeLeft <= 5 && timeLeft > 0) {
            setIsFlashing(true);
            setTimeout(() => setIsFlashing(false), 500);
            playBeep();
          }
        }, 1000);
      } else {
        // Time's up - move to next phase
        if (phase === 'prepare') {
          setPhase('exercise');
          setTimeLeft(EXERCISE_TIME);
          playBeep();
        } 
        else if (phase === 'exercise') {
          // Check if this was the last exercise of the round
          if (currentExercise === exercises.length - 1) {
            // End of round
            if (currentRound < rounds) {
              // More rounds to go
              setPhase('roundRest');
              setTimeLeft(ROUND_REST_TIME);
              setCurrentRound(currentRound + 1);
              setCurrentExercise(0);
            } else {
              // Workout complete
              setCompleted(true);
              setPhase('idle');
            }
          } else {
            // More exercises in this round - skip rest phase and go straight to prepare
            setCurrentExercise(currentExercise + 1);
            setPhase('prepare');
            setTimeLeft(PREPARE_TIME);
          }
        }
        else if (phase === 'roundRest') {
          // Start first exercise of next round
          setPhase('prepare');
          setTimeLeft(PREPARE_TIME);
        }
      }
    }
    
    return () => clearTimeout(timer);
  }, [started, timeLeft, phase, currentExercise, exercises.length, completed, currentRound, rounds]);
  
  const startWorkout = () => {
    setStarted(true);
    setCompleted(false);
    setCurrentExercise(0);
    setCurrentRound(1);
    setPhase('prepare');
    setTimeLeft(PREPARE_TIME);
  };
  
  const resetWorkout = () => {
    setStarted(false);
    setCompleted(false);
    setCurrentExercise(0);
    setCurrentRound(1);
    setPhase('idle');
  };
  
  const playBeep = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.log("Audio play failed:", e));
    }
  };
  
  const formatTime = (seconds) => {
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
  
  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${getBgColor()}`}>
      <audio ref={audioRef} preload="auto">
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PVqzn77BdGAg+l9vztWsgBTSK0/PQfzAHIG/B7+KYRw0PVqzn77BdGAg+l9vztWsgBTSK0/PQfzAHIG/B7+KYRw0PVqzn77BdGAg+l9vztWsgBTSK0/PQfzAHIG/B7+KYRw0PVqzn77BdGAg+l9vztWsgBTSK0/PQfzAHIG/B7+KYRw0PVqzn77BdGAg+l9vztWsgBTSK0/PQfzAHIG/B7+KYRw0PVqzn77BdGAg+l9vztWsgBTSK0/PQfzAHIG/B7+KYRw0PVqzn77BdGAg+l9vztWsgBTOK0/PQfzAHIG/B7+KYRw0PVqzn77BdGAg+l9vztWsgBTSK0/PQfzAHIG/B7+KYRw0PVqzn77BdGAg+l9vztWsgBTSK0/PQfzAHIG/B7+KYRw0PVqzn77BdGAg+l9vztWsgBTSK0/PQfzAHIG/B7+KYRw0PVqzn77BdGAg+l9vztWsgBTSK0/PQfzAHIG/B7+KYRw0PVqzn77BdGAg+l9vznGcaBjeM1PPRdiwJKHnI8dp3LwwiacXw4IgzDiBkwO7mnEEHF2S87OuYQQgaYLnu66NPCxNlve3qnUoNFWW77OmfTAwTZLvu651KDRVlu+zpoE0ME2O67eqfTA0UZLvt6aBNDBNju+3qn0wNFGS77eqgTQwTY7vt6p9MDRRku+3qoE0ME2O77eqfTA0UZLvt6qBNDBNju+3qn0wNFGS77eqgTQwTY7vt6p9MDRRku+3qoE0ME2O77eqfTA0UZLvt6qBNDBNiu+3qn0wNFGS77eqgTQwTY7vt6p9MDRRku+3qoE0ME2O77eqfTA0UZLvt6qBNDBNju+3qn0wNE2S77eqgTQwTY7vt6p9MDRRku+3qoE0ME2O77eqfTA0UZLvt6qBNDBNju+3qn0wNFGS77emfSwwVZLvt6aBMDBRluu3poEwMFGW67emgTAwUZbrt6aBMDBRluu3poEwMFGW67emgTAwUZbrt6aBMDBRluu3poEwMFGW67emgTAwUZbrt6aBMDBRluu3poEwMFGW67emgTAwUZbrt6aBMDBRluu3poEwMFGW67emgTAwUZbrt6aBMDBRluu3poEwMFGW67emgTAwUZbrt6aBMDBRluu3poEwMFGW67emgTAwUZbrt6aBMDBRluu3poEwMFGW67emgTAwUZbrt6aBMDBRluu3poEwMFGW67emgTAwUZbrtp9JCxNpvOzpoEwMFGW67emgTAwUZbrt6aBMDBRluu3poEwME2W67emgTAwUZbrt6aBMDBRluu3poEwMFGW67emgTAwUZbrt6aBMDBRluu3poEwMFGW67emgTAwUZbrt6aBMDBRluu3poEwMFGW67emgTAwUZbrtqFLChFovOzpoEwMFGW67emgTAwUZbrt6aBMDBRluu3poEwMFGW67emgTAwUZbrt6aBMDBRluu3poEwMFGW67emgTAwUZbrt6aBMDBRluu3poEwMFGW67emgTAwUZbrt6aBMDBRluu3poEwMFGW67emgTAwUZbrt6aBMDBRluu3poEwMFGW67emgTAwUZbrt6aBMDBRluu3poEwMFGW67emgTAwUZbrt6Z9LDBRluu3poEwME2W67emgTAwUZbrt6aBMDBNlu+3poEwMFGW67emgTAwTZbvt6aBMDBRluu3poEwME2W77emgTAwUZbrt6aBMDBNlu+3poEwMFGW67emgTAwTZbvt6aBMDBRluu3pnksLVKY8L6iUQwUZbrt6aBMDBRluu3pnksLVKY8L6iUQwUZbrt6aBMDBQAA" type="audio/wav" />
      </audio>

      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-6">HIIT Workout Timer</h1>
        
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
              <div className="text-sm font-semibold text-gray-500">
                Round {currentRound} of {rounds}
              </div>
              
              {phase === 'roundRest' ? (
                <h2 className="text-xl font-bold mb-2">Rest Between Rounds</h2>
              ) : (
                <h2 className="text-xl font-bold mb-2">
                  {exercises[currentExercise]}
                </h2>
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
                    phase === 'prepare' ? PREPARE_TIME : 
                    phase === 'exercise' ? EXERCISE_TIME : 
                    phase === 'rest' ? REST_TIME : ROUND_REST_TIME
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
            <button 
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mr-2"
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
        )}
      </div>
      
      {started && !completed && (
        <div className="mt-6 bg-white rounded-lg shadow-lg p-4 w-full max-w-md">
          <h3 className="font-bold mb-2">Coming Up:</h3>
          <ul className="space-y-2">
            {exercises.map((ex, index) => {
              if (index < currentExercise) return null;
              if (index > currentExercise + 2) return null;
              
              return (
                <li 
                  key={index} 
                  className={`p-2 rounded ${
                    index === currentExercise ? 'bg-green-100 font-bold' : 'text-gray-500'
                  }`}
                >
                  {index + 1}. {ex}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default HIITTimer;
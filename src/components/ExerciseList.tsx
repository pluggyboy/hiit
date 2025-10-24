"use client";

import React, { useState } from 'react';
import Image from 'next/image';

interface ExerciseListProps {
  exercises: string[];
  exerciseImages: Record<string, string>;
  onReorder: (newOrder: string[]) => void;
}

const ExerciseList: React.FC<ExerciseListProps> = ({ exercises, exerciseImages, onReorder }) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newExercises = [...exercises];
    const [draggedItem] = newExercises.splice(draggedIndex, 1);
    newExercises.splice(dropIndex, 0, draggedItem);

    onReorder(newExercises);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newExercises = [...exercises];
    [newExercises[index - 1], newExercises[index]] = [newExercises[index], newExercises[index - 1]];
    onReorder(newExercises);
  };

  const moveDown = (index: number) => {
    if (index === exercises.length - 1) return;
    const newExercises = [...exercises];
    [newExercises[index], newExercises[index + 1]] = [newExercises[index + 1], newExercises[index]];
    onReorder(newExercises);
  };

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-600 mb-3">
        Drag exercises to reorder, or use arrow buttons
      </p>
      {exercises.map((exercise, index) => (
        <div
          key={exercise}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, index)}
          onDragEnd={handleDragEnd}
          className={`
            flex items-center gap-3 p-3 rounded-lg border-2 transition-all cursor-move
            ${draggedIndex === index ? 'opacity-50 border-blue-400 bg-blue-50' : 'border-gray-200 bg-white'}
            ${dragOverIndex === index && draggedIndex !== index ? 'border-green-400 bg-green-50' : ''}
            hover:border-gray-300 hover:shadow-md
          `}
        >
          {/* Drag Handle */}
          <div className="text-gray-400 cursor-grab active:cursor-grabbing">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <circle cx="7" cy="5" r="1.5"/>
              <circle cx="13" cy="5" r="1.5"/>
              <circle cx="7" cy="10" r="1.5"/>
              <circle cx="13" cy="10" r="1.5"/>
              <circle cx="7" cy="15" r="1.5"/>
              <circle cx="13" cy="15" r="1.5"/>
            </svg>
          </div>

          {/* Exercise Image */}
          <div className="relative w-12 h-12 flex-shrink-0">
            <Image
              src={exerciseImages[exercise]}
              alt={exercise}
              fill
              style={{ objectFit: 'cover' }}
              className="rounded"
            />
          </div>

          {/* Exercise Name */}
          <div className="flex-grow">
            <span className="font-medium text-gray-800">{index + 1}. {exercise}</span>
          </div>

          {/* Arrow Buttons */}
          <div className="flex flex-col gap-1">
            <button
              onClick={() => moveUp(index)}
              disabled={index === 0}
              className={`p-1 rounded ${
                index === 0
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-100 active:bg-gray-200'
              }`}
              aria-label="Move up"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 3l-5 5h3v5h4V8h3l-5-5z"/>
              </svg>
            </button>
            <button
              onClick={() => moveDown(index)}
              disabled={index === exercises.length - 1}
              className={`p-1 rounded ${
                index === exercises.length - 1
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-100 active:bg-gray-200'
              }`}
              aria-label="Move down"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 13l5-5h-3V3H6v5H3l5 5z"/>
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExerciseList;

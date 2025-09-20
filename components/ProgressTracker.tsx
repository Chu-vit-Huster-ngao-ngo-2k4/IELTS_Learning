'use client';

import { Lesson } from '@/lib/types';

interface ProgressTrackerProps {
  lesson: Lesson;
  videoCompleted: boolean;
  exerciseCompleted: boolean;
}

export default function ProgressTracker({ 
  lesson, 
  videoCompleted, 
  exerciseCompleted 
}: ProgressTrackerProps) {
  const getProgressPercentage = () => {
    let completed = 0;
    let total = 2; // video + exercise
    
    if (videoCompleted) completed++;
    if (exerciseCompleted) completed++;
    
    return Math.round((completed / total) * 100);
  };

  const getStatusColor = (isCompleted: boolean) => {
    return isCompleted ? 'text-green-600' : 'text-gray-400';
  };

  const getStatusIcon = (isCompleted: boolean) => {
    return isCompleted ? (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
      </svg>
    ) : (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
      </svg>
    );
  };

  const progress = getProgressPercentage();

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Tiến độ bài học
      </h3>
      
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Hoàn thành
          </span>
          <span className="text-sm font-medium text-gray-700">
            {progress}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Progress Items */}
      <div className="space-y-4">
        {/* Video Progress */}
        <div className="flex items-center space-x-3">
          <div className={`${getStatusColor(videoCompleted)}`}>
            {getStatusIcon(videoCompleted)}
          </div>
          <div className="flex-1">
            <p className={`text-sm font-medium ${videoCompleted ? 'text-green-900' : 'text-gray-900'}`}>
              Xem video
            </p>
            <p className="text-xs text-gray-500">
              {videoCompleted ? 'Đã hoàn thành' : 'Chưa hoàn thành'}
            </p>
          </div>
        </div>

        {/* Exercise Progress */}
        <div className="flex items-center space-x-3">
          <div className={`${getStatusColor(exerciseCompleted)}`}>
            {getStatusIcon(exerciseCompleted)}
          </div>
          <div className="flex-1">
            <p className={`text-sm font-medium ${exerciseCompleted ? 'text-green-900' : 'text-gray-900'}`}>
              Làm bài tập
            </p>
            <p className="text-xs text-gray-500">
              {exerciseCompleted ? 'Đã hoàn thành' : 'Chưa hoàn thành'}
            </p>
          </div>
        </div>
      </div>

      {/* Lesson Info */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          <p className="mb-1">
            <span className="font-medium">Bài học:</span> {lesson.title}
          </p>
          <p className="mb-1">
            <span className="font-medium">Thứ tự:</span> {lesson.orderindex}
          </p>
          <p>
            <span className="font-medium">Độ khó:</span> 
            <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
              lesson.difficulty === 'beginner' 
                ? 'bg-green-100 text-green-800' 
                : lesson.difficulty === 'intermediate'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {lesson.difficulty === 'beginner' ? 'Cơ bản' : 
               lesson.difficulty === 'intermediate' ? 'Trung cấp' : 'Nâng cao'}
            </span>
          </p>
        </div>
      </div>

      {/* Completion Message */}
      {progress === 100 && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
            <p className="text-sm font-medium text-green-800">
              Chúc mừng! Bạn đã hoàn thành bài học này.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Asset } from '@/lib/types';

interface ExerciseSectionProps {
  exercises: Asset[];
  images: Asset[];
  onComplete: () => void;
  isCompleted: boolean;
}

export default function ExerciseSection({ 
  exercises, 
  images, 
  onComplete, 
  isCompleted 
}: ExerciseSectionProps) {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [signedUrls, setSignedUrls] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSignedUrls();
  }, [exercises, images]);

  const getSignedUrls = async () => {
    try {
      setLoading(true);
      const allAssets = [...exercises, ...images];
      const urlPromises = allAssets.map(async (asset) => {
        const response = await fetch('/api/r2-sign', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            key: asset.providerkey,
            filename: asset.title
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to get signed URL for ${asset.title}`);
        }

        const data = await response.json();
        return { id: asset.id, url: data.signedUrl };
      });

      const results = await Promise.all(urlPromises);
      const urlMap = results.reduce((acc, { id, url }) => {
        acc[id] = url;
        return acc;
      }, {} as { [key: string]: string });

      setSignedUrls(urlMap);
    } catch (err) {
      console.error('Error getting signed URLs:', err);
      setError('Không thể tải bài tập');
    } finally {
      setLoading(false);
    }
  };

  const nextExercise = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    }
  };

  const prevExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1);
    }
  };

  const handleExerciseComplete = () => {
    onComplete();
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) {
      return (
        <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
        </svg>
      );
    } else if (mimeType.includes('word') || mimeType.includes('document')) {
      return (
        <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
        </svg>
      );
    }
    return (
      <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
      </svg>
    );
  };

  const getFileTypeName = (mimeType: string) => {
    if (mimeType.includes('pdf')) return 'PDF';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'Word Document';
    return 'Document';
  };

  if (loading) {
    return (
      <div className="bg-gray-100 rounded-lg p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Đang tải bài tập...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={getSignedUrls}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (exercises.length === 0) {
    return (
      <div className="bg-gray-100 rounded-lg p-8 text-center">
        <p className="text-gray-500">Không có bài tập cho bài học này</p>
      </div>
    );
  }

  const currentExercise = exercises[currentExerciseIndex];
  const exerciseUrl = signedUrls[currentExercise.id];

  // Group exercises by part for Listening lessons
  const groupedExercises = exercises.reduce((acc, exercise) => {
    const partMatch = exercise.title.match(/part(\d+)/);
    const partNum = partMatch ? partMatch[1] : '1';
    
    if (!acc[partNum]) {
      acc[partNum] = [];
    }
    acc[partNum].push(exercise);
    return acc;
  }, {} as { [key: string]: Asset[] });

  const isListeningLesson = Object.keys(groupedExercises).length > 1;

  return (
    <div className="space-y-6">
      {isListeningLesson ? (
        // Listening Lesson Layout - Show all parts
        <div className="space-y-6">
          {Object.keys(groupedExercises).sort((a, b) => parseInt(a) - parseInt(b)).map((partNum) => (
            <div key={partNum} className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                📄 Part {partNum} - Bài Tập
              </h3>
              
              <div className="space-y-4">
                {groupedExercises[partNum].map((exercise) => {
                  const exerciseUrl = signedUrls[exercise.id];
                  const isHandout = exercise.title.includes('handout');
                  const isAnswer = exercise.title.includes('answer');
                  
                  return (
                    <div key={exercise.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start space-x-4 mb-4">
                        {getFileIcon(exercise.mimetype)}
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {isHandout ? '📝 Bài tập' : isAnswer ? '✅ Đáp án' : exercise.title}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {getFileTypeName(exercise.mimetype)} • {exercise.sizebytes ? Math.round(exercise.sizebytes / 1024) : 0} KB
                          </p>
                        </div>
                      </div>

                      {/* PDF Viewer */}
                      {exerciseUrl && exercise.mimetype.includes('pdf') && (
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <iframe
                            src={exerciseUrl}
                            className="w-full h-96"
                            title={exercise.title}
                          />
                        </div>
                      )}

                      {/* Document Download Link */}
                      {exerciseUrl && !exercise.mimetype.includes('pdf') && (
                        <div className="text-center py-4">
                          <a
                            href={exerciseUrl}
                            download={exercise.title}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Tải xuống
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Regular Lesson Layout - Single exercise navigation
        <>
          {/* Exercise Navigation */}
          {exercises.length > 1 && (
            <div className="flex items-center justify-between">
              <button
                onClick={prevExercise}
                disabled={currentExerciseIndex === 0}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Trước
              </button>
              
              <span className="text-sm text-gray-600">
                Bài tập {currentExerciseIndex + 1} / {exercises.length}
              </span>
              
              <button
                onClick={nextExercise}
                disabled={currentExerciseIndex === exercises.length - 1}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}

          {/* Current Exercise */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-start space-x-4 mb-4">
              {getFileIcon(currentExercise.mimetype)}
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">
                  {currentExercise.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {getFileTypeName(currentExercise.mimetype)} • {currentExercise.sizebytes ? Math.round(currentExercise.sizebytes / 1024) : 0} KB
                </p>
              </div>
            </div>

            {/* PDF Viewer */}
            {exerciseUrl && currentExercise.mimetype.includes('pdf') && (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <iframe
                  src={exerciseUrl}
                  className="w-full h-96"
                  title={currentExercise.title}
                />
              </div>
            )}

            {/* Document Download Link */}
            {exerciseUrl && !currentExercise.mimetype.includes('pdf') && (
              <div className="text-center py-8">
                <div className="mb-4">
                  {getFileIcon(currentExercise.mimetype)}
                </div>
                <p className="text-gray-600 mb-4">
                  Tải xuống để xem và làm bài tập
                </p>
                <a
                  href={exerciseUrl}
                  download={currentExercise.title}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Tải xuống
                </a>
              </div>
            )}

            {/* Complete Button */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={handleExerciseComplete}
                disabled={isCompleted}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  isCompleted
                    ? 'bg-green-100 text-green-800 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isCompleted ? (
                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                    Đã hoàn thành
                  </div>
                ) : (
                  'Đánh dấu hoàn thành'
                )}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Related Images */}
      {images.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">
            Hình ảnh liên quan
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((image) => {
              const imageUrl = signedUrls[image.id];
              return (
                <div key={image.id} className="relative group">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={image.title}
                      className="w-full h-24 object-cover rounded-lg border border-gray-200"
                    />
                  ) : (
                    <div className="w-full h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

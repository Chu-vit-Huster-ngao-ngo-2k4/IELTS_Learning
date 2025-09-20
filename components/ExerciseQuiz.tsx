'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Eye, EyeOff, Download, FileText, Volume2 } from 'lucide-react';
import AudioPlayerWrapper from './AudioPlayerWrapper';

interface Exercise {
  id: string;
  title: string;
  providerkey: string;
  mimetype: string;
  assettype: string;
  sizebytes: number;
}

interface ExerciseQuizProps {
  exercises: Exercise[];
  answers: Exercise[];
  audios?: Exercise[];
  onComplete?: () => void;
}

export default function ExerciseQuiz({ exercises, answers, audios = [], onComplete }: ExerciseQuizProps) {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [showAnswers, setShowAnswers] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [completedAudios, setCompletedAudios] = useState<Set<string>>(new Set());
  const [signedUrls, setSignedUrls] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentExercise = exercises[currentExerciseIndex];
  // Find answer by lesson number and exercise type
  const currentAnswer = answers.find(answer => {
    const exerciseTitle = exercises[currentExerciseIndex]?.title || '';
    const answerTitle = answer.title || '';
    
    // Extract lesson number from both titles
    const exerciseLessonMatch = exerciseTitle.match(/lesson-(\d+)/);
    const answerLessonMatch = answerTitle.match(/lesson-(\d+)/);
    
    if (!exerciseLessonMatch || !answerLessonMatch) return false;
    
    const exerciseLessonNum = exerciseLessonMatch[1];
    const answerLessonNum = answerLessonMatch[1];
    
    // Match by lesson number
    return exerciseLessonNum === answerLessonNum;
  });
  
  // Get audios for current exercise (filter by lesson number)
  const currentLessonNumber = currentExercise?.title.split('-')[1] || '';
  const currentAudios = audios.filter(audio => 
    audio.title.includes(`lesson-${currentLessonNumber}-audio`)
  );

  useEffect(() => {
    getSignedUrls();
  }, [exercises, answers, audios]);

  const getSignedUrls = async () => {
    try {
      setLoading(true);
      const allAssets = [...exercises, ...answers, ...audios];
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

  const markAsCompleted = () => {
    const newCompleted = new Set(completedExercises);
    newCompleted.add(currentExerciseIndex.toString());
    setCompletedExercises(newCompleted);
    
    // If all exercises completed, call onComplete
    if (newCompleted.size === exercises.length && onComplete) {
      onComplete();
    }
  };

  const toggleAnswers = () => {
    setShowAnswers(!showAnswers);
  };

  const handleAudioCompleted = (audioId: string) => {
    setCompletedAudios(prev => new Set(Array.from(prev).concat(audioId)));
  };

  const handleToggleAudioCompleted = (audioId: string) => {
    setCompletedAudios(prev => {
      const newSet = new Set(prev);
      if (newSet.has(audioId)) {
        newSet.delete(audioId);
      } else {
        newSet.add(audioId);
      }
      return newSet;
    });
  };

  const downloadFile = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              📝 Bài Tập - {currentExercise?.title || 'Loading...'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Bạn có thể làm bài tập ngay mà không cần xem hết video
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleAnswers}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                showAnswers
                  ? 'bg-green-100 text-green-800 border border-green-300'
                  : 'bg-gray-100 text-gray-700 border border-gray-300'
              }`}
            >
              {showAnswers ? (
                <>
                  <EyeOff className="w-4 h-4 mr-2" />
                  Ẩn đáp án
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Hiện đáp án
                </>
              )}
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Tiến độ bài tập</span>
            <span>{completedExercises.size} / {exercises.length} hoàn thành</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(completedExercises.size / exercises.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={prevExercise}
            disabled={currentExerciseIndex === 0}
            className="px-4 py-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Bài trước
          </button>
          
          <span className="text-sm text-gray-600">
            {currentExerciseIndex + 1} / {exercises.length}
          </span>
          
          <button
            onClick={nextExercise}
            disabled={currentExerciseIndex === exercises.length - 1}
            className="px-4 py-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Bài tiếp →
          </button>
        </div>
      </div>

      {/* Exercise Content */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Exercise PDF */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Bài tập
            </h3>
            {currentExercise && signedUrls[currentExercise.id] ? (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <iframe
                  src={signedUrls[currentExercise.id]}
                  className="w-full h-[500px]"
                  title={currentExercise.title}
                />
                <div className="p-3 bg-gray-50 border-t border-gray-200">
                  <button
                    onClick={() => downloadFile(signedUrls[currentExercise.id], currentExercise.title)}
                    className="flex items-center text-blue-600 hover:text-blue-800"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Tải xuống
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-[500px] flex items-center justify-center bg-gray-50 rounded-lg">
                <p className="text-gray-500">Đang tải bài tập...</p>
              </div>
            )}
          </div>

          {/* Audio Player - Sidebar */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Volume2 className="w-5 h-5 mr-2" />
              Audio Bài Tập
            </h3>
            {currentAudios.length > 0 ? (
              <div className="space-y-3">
                {currentAudios.map((audio, index) => (
                  <div key={audio.id} className="bg-gray-50 rounded-lg p-3">
                    <h4 className="font-medium text-gray-900 mb-2 text-sm">
                      Audio {index + 1}
                    </h4>
                    {audio ? (
                      <AudioPlayerWrapper 
                        audio={audio} 
                        onCompleted={() => handleAudioCompleted(audio.id)}
                        onToggleCompleted={() => handleToggleAudioCompleted(audio.id)}
                        isCompleted={completedAudios.has(audio.id)}
                      />
                    ) : (
                      <div className="text-gray-500 text-sm">Audio không khả dụng</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-sm">Không có audio cho bài này</div>
            )}
          </div>

          {/* Answer PDF */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              Đáp án
            </h3>
            {showAnswers ? (
              answers.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">📋 Đáp án ({answers.length} file):</p>
                  
                  {/* Compact answer list */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {answers.map((answer, index) => (
                      <div key={answer.id} className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-green-900 text-sm">
                            Đáp án {index + 1}
                          </h4>
                          <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                            DOCX
                          </span>
                        </div>
                        <p className="text-xs text-green-700 mb-3 truncate" title={answer.title}>
                          {answer.title}
                        </p>
                        {signedUrls[answer.id] ? (
                          <button
                            onClick={() => downloadFile(signedUrls[answer.id], answer.title)}
                            className="w-full flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Tải về
                          </button>
                        ) : (
                          <div className="w-full flex items-center justify-center px-3 py-2 bg-gray-200 text-gray-500 rounded-lg text-sm">
                            <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin mr-1"></div>
                            Đang tải...
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-[200px] flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <EyeOff className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">Không có đáp án cho bài này</p>
                  </div>
                </div>
              )
            ) : (
              <div className="h-[500px] flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <EyeOff className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Nhấn "Hiện đáp án" để xem kết quả</p>
                  <button
                    onClick={toggleAnswers}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Hiện đáp án
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Complete Button */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {completedExercises.has(currentExerciseIndex.toString()) ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <XCircle className="w-5 h-5 text-gray-400" />
            )}
            <span className="text-sm text-gray-600">
              {completedExercises.has(currentExerciseIndex.toString()) ? 'Đã hoàn thành' : 'Chưa hoàn thành'}
            </span>
          </div>
          
          <button
            onClick={markAsCompleted}
            disabled={completedExercises.has(currentExerciseIndex.toString())}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              completedExercises.has(currentExerciseIndex.toString())
                ? 'bg-green-100 text-green-800 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {completedExercises.has(currentExerciseIndex.toString()) ? 'Đã hoàn thành' : 'Đánh dấu hoàn thành'}
          </button>
        </div>
      </div>

      {/* All Exercises Completed */}
      {completedExercises.size === exercises.length && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-green-800 mb-2">
            🎉 Chúc mừng!
          </h3>
          <p className="text-green-700 mb-4">
            Bạn đã hoàn thành tất cả bài tập trong lesson này!
          </p>
          {onComplete && (
            <button
              onClick={onComplete}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium"
            >
              Tiếp tục bài học tiếp theo
            </button>
          )}
        </div>
      )}
    </div>
  );
}

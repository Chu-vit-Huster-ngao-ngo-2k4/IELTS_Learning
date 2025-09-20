'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, Eye, EyeOff } from 'lucide-react';
import AudioPlayerWrapper from './AudioPlayerWrapper';
import { Asset } from '@/lib/types';

interface ListeningLessonViewerProps {
  audios: Asset[];
  exercises: Asset[];
  onComplete?: () => void;
}

export default function ListeningLessonViewer({ 
  audios, 
  exercises, 
  onComplete 
}: ListeningLessonViewerProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [showAnswers, setShowAnswers] = useState(false);
  const [signedUrls, setSignedUrls] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Separate handouts and answers
  const handouts = exercises.filter(ex => ex.title.includes('handout'));
  const answers = exercises.filter(ex => ex.title.includes('answer'));

  useEffect(() => {
    getSignedUrls();
  }, [exercises]);

  const getSignedUrls = async () => {
    try {
      setLoading(true);
      const allAssets = [...handouts, ...answers];
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

  const nextPage = () => {
    if (currentPage < handouts.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const toggleAnswers = () => {
    setShowAnswers(!showAnswers);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Đang tải bài học...</p>
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

  const currentHandout = handouts[currentPage];
  const currentAnswer = answers[currentPage];
  const handoutUrl = currentHandout ? signedUrls[currentHandout.id] : null;
  const answerUrl = currentAnswer ? signedUrls[currentAnswer.id] : null;

  return (
    <div className="space-y-6">
      {/* Audio Section - Only show current page audio */}
      {audios.length > 0 && currentPage < handouts.length && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            🎧 Audio Listening - Part {currentPage + 1}
          </h2>
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-900">
                {audios[currentPage]?.title || `Part ${currentPage + 1}`}
              </h3>
              <span className="text-sm text-gray-500">
                {audios[currentPage] ? Math.round(audios[currentPage].sizebytes / 1024 / 1024 * 100) / 100 : 0} MB
              </span>
            </div>
            <AudioPlayerWrapper
              audio={audios[currentPage]}
              onProgress={(progress) => {
                console.log(`Audio Part ${currentPage + 1} progress: ${progress}%`);
              }}
            />
          </div>
        </div>
      )}

      {/* PDF Viewer Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            📄 Bài Tập - Trang {currentPage + 1} / {handouts.length + 1}
          </h2>
          
          <div className="flex items-center space-x-4">
            {/* Show/Hide Answers Button */}
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

            {/* Navigation */}
            <div className="flex items-center space-x-2">
              <button
                onClick={prevPage}
                disabled={currentPage === 0}
                className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <span className="text-sm text-gray-600 min-w-[100px] text-center">
                {currentPage + 1} / {handouts.length + 1}
              </span>
              
              <button
                onClick={nextPage}
                disabled={currentPage >= handouts.length}
                className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* PDF Content */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {currentPage < handouts.length ? (
            // Show handout page
            <div>
              <div className="bg-blue-50 px-4 py-2 border-b border-gray-200">
                <h3 className="font-medium text-blue-900">
                  📝 Bài tập - Part {currentPage + 1}
                </h3>
              </div>
              {handoutUrl ? (
                <iframe
                  src={handoutUrl}
                  className="w-full h-[600px]"
                  title={`Bài tập Part ${currentPage + 1}`}
                />
              ) : (
                <div className="h-[600px] flex items-center justify-center bg-gray-50">
                  <p className="text-gray-500">Đang tải bài tập...</p>
                </div>
              )}
            </div>
          ) : (
            // Show answers page (no audio on this page)
            <div>
              <div className="bg-green-50 px-4 py-2 border-b border-gray-200">
                <h3 className="font-medium text-green-900">
                  ✅ Đáp án - Tất cả các phần
                </h3>
              </div>
              {showAnswers ? (
                <div className="space-y-4 p-4">
                  {answers.map((answer, index) => {
                    const answerUrl = signedUrls[answer.id];
                    return (
                      <div key={answer.id} className="border border-gray-200 rounded-lg">
                        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                          <h4 className="font-medium text-gray-900">
                            Đáp án Part {index + 1}
                          </h4>
                        </div>
                        {answerUrl ? (
                          <iframe
                            src={answerUrl}
                            className="w-full h-[400px]"
                            title={`Đáp án Part ${index + 1}`}
                          />
                        ) : (
                          <div className="h-[400px] flex items-center justify-center bg-gray-50">
                            <p className="text-gray-500">Đang tải đáp án...</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-[600px] flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">Nhấn "Hiện đáp án" để xem kết quả</p>
                    <button
                      onClick={toggleAnswers}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                    >
                      Hiện đáp án
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Progress Indicator */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Tiến độ</span>
            <span>{Math.round(((currentPage + 1) / (handouts.length + 1)) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentPage + 1) / (handouts.length + 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* Complete Button */}
        {currentPage >= handouts.length && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={onComplete}
              className="w-full py-3 px-4 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              <div className="flex items-center justify-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Hoàn thành bài học
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

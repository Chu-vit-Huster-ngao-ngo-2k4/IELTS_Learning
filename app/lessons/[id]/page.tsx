'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import VideoPlayer from '@/components/VideoPlayer';
import AudioPlayerWrapper from '@/components/AudioPlayerWrapper';
import ListeningLessonViewer from '@/components/ListeningLessonViewer';
import ExerciseSection from '@/components/ExerciseSection';
import ExerciseQuiz from '@/components/ExerciseQuiz';
import ProgressTracker from '@/components/ProgressTracker';
import LessonNavigation from '@/components/LessonNavigation';
import { Lesson, Asset, Course } from '@/lib/types';

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClientComponentClient();
  
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [videos, setVideos] = useState<Asset[]>([]);
  const [audios, setAudios] = useState<Asset[]>([]);
  const [exercises, setExercises] = useState<Asset[]>([]);
  const [answers, setAnswers] = useState<Asset[]>([]);
  const [images, setImages] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [showExercises, setShowExercises] = useState(false);
  const [exerciseCompleted, setExerciseCompleted] = useState(false);

  const lessonId = params.id as string;

  useEffect(() => {
    fetchLessonData();
  }, [lessonId]);

  const fetchLessonData = async () => {
    try {
      setLoading(true);
      
      // Fetch lesson data
      const { data: lessonData, error: lessonError } = await supabase
        .from('lessons')
        .select(`
          *,
          courses:courseid (
            id,
            title,
            description
          )
        `)
        .eq('id', lessonId)
        .single();

      if (lessonError) throw lessonError;

      setLesson(lessonData);
      setCourse(lessonData.courses);

      // Fetch assets for this lesson
      const { data: assetsData, error: assetsError } = await supabase
        .from('assets')
        .select('*')
        .eq('lessonid', lessonId)
        .order('id');

      if (assetsError) throw assetsError;

      setAssets(assetsData || []);

      // Categorize assets
      const videoAssets = assetsData?.filter(asset => asset.assettype === 'video') || [];
      const audioAssets = assetsData?.filter(asset => asset.assettype === 'audio') || [];
      const exerciseAssets = assetsData?.filter(asset => 
        asset.assettype === 'document' && 
        asset.mimetype === 'application/pdf' &&
        (asset.title.includes('exercise') || asset.title.includes('handout'))
      ) || [];
      const answerAssets = assetsData?.filter(asset => 
        asset.assettype === 'document' && 
        asset.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' &&
        asset.title.includes('answer')
      ) || [];
      const imageAssets = assetsData?.filter(asset => asset.assettype === 'image') || [];

      setVideos(videoAssets);
      setAudios(audioAssets);
      setExercises(exerciseAssets);
      setAnswers(answerAssets);
      setImages(imageAssets);

    } catch (err) {
      console.error('Error fetching lesson data:', err);
      setError('Không thể tải dữ liệu bài học');
    } finally {
      setLoading(false);
    }
  };

  const handleVideoComplete = () => {
    setVideoCompleted(true);
    // Show exercises if available for vocabulary or pronunciation lessons
    if (exercises.length > 0 && (course?.id === 1 || course?.id === 3)) {
      setShowExercises(true);
    }
    // Update progress in database
    updateProgress('video_completed');
  };

  const handleExerciseComplete = () => {
    setExerciseCompleted(true);
    // Update progress in database
    updateProgress('exercise_completed');
  };

  const updateProgress = async (status: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('progress')
        .upsert({
          userid: user.id,
          lessonid: parseInt(lessonId),
          status: status === 'exercise_completed' ? 'completed' : 'started',
          updatedat: new Date().toISOString()
        });

      if (error) console.error('Error updating progress:', error);
    } catch (err) {
      console.error('Error updating progress:', err);
    }
  };

  const nextVideo = () => {
    if (currentVideoIndex < videos.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    }
  };

  const prevVideo = () => {
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải bài học...</p>
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy bài học</h2>
          <p className="text-gray-600 mb-4">{error || 'Bài học không tồn tại'}</p>
          <button
            onClick={() => router.back()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {course?.title}
              </h1>
              <p className="text-sm text-gray-600">
                {lesson.title}
              </p>
            </div>
            <Link
              href="/simple-courses"
              className="text-gray-500 hover:text-gray-700 flex items-center"
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Quay lại khóa học
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Section */}
            {videos.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Video Bài Học
                  </h2>
                  {videos.length > 1 && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={prevVideo}
                        disabled={currentVideoIndex === 0}
                        className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <span className="text-sm text-gray-600">
                        {currentVideoIndex + 1} / {videos.length}
                      </span>
                      <button
                        onClick={nextVideo}
                        disabled={currentVideoIndex === videos.length - 1}
                        className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
                
                <VideoPlayer
                  video={videos[currentVideoIndex]}
                  onComplete={handleVideoComplete}
                  isCompleted={videoCompleted}
                />
                
                {/* Skip to exercises button */}
                {!videoCompleted && exercises.length > 0 && course?.id === 1 && (
                  <div className="mt-4 text-center">
                    <button
                      onClick={() => {
                        setVideoCompleted(true);
                        setShowExercises(true);
                        updateProgress('video_completed');
                      }}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Bỏ qua video và làm bài tập
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Debug Info */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-yellow-800 mb-2">Debug Info:</h3>
              <p className="text-sm text-yellow-700">Course ID: {course?.id}</p>
              <p className="text-sm text-yellow-700">Exercises count: {exercises.length}</p>
              <p className="text-sm text-yellow-700">Answers count: {answers.length}</p>
              <p className="text-sm text-yellow-700">Audios count: {audios.length}</p>
              <p className="text-sm text-yellow-700">Show exercises: {exercises.length > 0 && (course?.id === 1 || course?.id === 3) ? 'YES' : 'NO'}</p>
            </div>

      {/* Exercise Quiz - Always show for vocabulary and pronunciation lessons if exercises available */}
      {exercises.length > 0 && (course?.id === 1 || course?.id === 3) && (
        <ExerciseQuiz
          exercises={exercises}
          answers={answers}
          audios={audios}
          onComplete={handleExerciseComplete}
        />
      )}

            {/* Listening Lesson Viewer */}
            {audios.length > 0 && course?.id === 4 && (
              <ListeningLessonViewer
                audios={audios}
                exercises={exercises}
                onComplete={handleExerciseComplete}
              />
            )}

            {/* Regular Exercise Section for non-listening lessons */}
            {audios.length === 0 && (exercises.length > 0 || images.length > 0) && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  📄 Bài Tập & Tài Liệu
                </h2>
                
                <ExerciseSection
                  exercises={exercises}
                  images={images}
                  onComplete={handleExerciseComplete}
                  isCompleted={exerciseCompleted}
                />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress Tracker */}
            <ProgressTracker
              lesson={lesson}
              videoCompleted={videoCompleted}
              exerciseCompleted={exerciseCompleted}
            />

            {/* Lesson Navigation */}
            <LessonNavigation
              courseId={course?.id}
              currentLessonId={parseInt(lessonId)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

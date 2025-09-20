'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Play, Pause, Volume2, Download, CheckCircle } from 'lucide-react'

interface Asset {
  id: number
  title: string
  provider_key: string
  mime_type: string
  size_bytes: number
}

interface Lesson {
  id: number
  title: string
  order_idx: number
  created_at: string
  assets: Asset[]
  course: {
    id: number
    title: string
  }
  progress?: {
    status: string
    last_position_sec: number
  }
}

export default function LessonPage({ params }: { params: { id: string; lessonId: string } }) {
  const { user, loading } = useAuth()
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loadingData, setLoadingData] = useState(true)
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({})
  const [currentAsset, setCurrentAsset] = useState<Asset | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user && params.id && params.lessonId) {
      fetchLessonData()
    }
  }, [user, params.id, params.lessonId])

  useEffect(() => {
    if (lesson?.assets && lesson.assets.length > 0) {
      fetchSignedUrls()
      setCurrentAsset(lesson.assets[0])
    }
  }, [lesson])

  const fetchLessonData = async () => {
    try {
      const { data, error } = await supabase
        .from('Lessons')
        .select(`
          *,
          Assets(*),
          Courses(id, title),
          Progress!left(user_id, lesson_id, status, last_position_sec)
        `)
        .eq('id', params.lessonId)
        .eq('course_id', params.id)
        .eq('Progress.user_id', user?.id)
        .single()

      if (error) throw error
      setLesson(data)
    } catch (error) {
      console.error('Error fetching lesson data:', error)
    } finally {
      setLoadingData(false)
    }
  }

  const fetchSignedUrls = async () => {
    if (!lesson?.assets) return

    const urls: Record<string, string> = {}
    
    for (const asset of lesson.assets) {
      try {
        const response = await fetch(`/api/sign-download?key=${encodeURIComponent(asset.provider_key)}`, {
          headers: {
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
          }
        })
        
        if (response.ok) {
          const { url } = await response.json()
          urls[asset.id] = url
        }
      } catch (error) {
        console.error(`Error fetching signed URL for asset ${asset.id}:`, error)
      }
    }
    
    setSignedUrls(urls)
  }

  const updateProgress = async (status: string, position: number = 0) => {
    if (!lesson) return

    try {
      const { error } = await supabase
        .from('Progress')
        .upsert({
          user_id: user?.id,
          lesson_id: lesson.id,
          status,
          last_position_sec: position,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      // Update local state
      setLesson(prev => prev ? {
        ...prev,
        progress: { status, last_position_sec: position }
      } : null)
    } catch (error) {
      console.error('Error updating progress:', error)
    }
  }

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement | HTMLAudioElement>) => {
    const target = e.target as HTMLVideoElement | HTMLAudioElement
    setCurrentTime(target.currentTime)
    
    // Update progress every 10 seconds
    if (Math.floor(target.currentTime) % 10 === 0) {
      updateProgress('started', Math.floor(target.currentTime))
    }
  }

  const handleEnded = () => {
    setIsPlaying(false)
    updateProgress('completed', Math.floor(duration))
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    )
  }

  if (!user || !lesson) {
    return null
  }

  const videoAssets = lesson.assets.filter(asset => asset.mime_type?.startsWith('video'))
  const audioAssets = lesson.assets.filter(asset => asset.mime_type?.startsWith('audio'))
  const documentAssets = lesson.assets.filter(asset => 
    asset.mime_type?.includes('pdf') || 
    asset.mime_type?.includes('document') ||
    asset.title?.endsWith('.pdf')
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href={`/courses/${lesson.course.id}`} className="mr-4">
                <ArrowLeft className="h-6 w-6 text-gray-600 hover:text-gray-900" />
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{lesson.title}</h1>
                <p className="text-sm text-gray-600">{lesson.course.title}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {lesson.progress?.status === 'completed' && (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-5 w-5 mr-1" />
                  <span className="text-sm font-medium">Hoàn thành</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Player Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {currentAsset && signedUrls[currentAsset.id] && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">{currentAsset.title}</h2>
                  
                  {/* Video Player */}
                  {currentAsset.mime_type?.startsWith('video') && (
                    <div className="mb-4">
                      <video
                        controls
                        className="w-full rounded-lg"
                        onTimeUpdate={handleTimeUpdate}
                        onEnded={handleEnded}
                        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                      >
                        <source src={signedUrls[currentAsset.id]} type={currentAsset.mime_type} />
                        Trình duyệt của bạn không hỗ trợ video.
                      </video>
                    </div>
                  )}

                  {/* Audio Player */}
                  {currentAsset.mime_type?.startsWith('audio') && (
                    <div className="mb-4">
                      <audio
                        controls
                        className="w-full"
                        onTimeUpdate={handleTimeUpdate}
                        onEnded={handleEnded}
                        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                      >
                        <source src={signedUrls[currentAsset.id]} type={currentAsset.mime_type} />
                        Trình duyệt của bạn không hỗ trợ audio.
                      </audio>
                    </div>
                  )}

                  {/* PDF Viewer */}
                  {currentAsset.mime_type?.includes('pdf') && (
                    <div className="mb-4">
                      <iframe
                        src={signedUrls[currentAsset.id]}
                        className="w-full h-96 rounded-lg border"
                        title={currentAsset.title}
                      />
                    </div>
                  )}

                  {/* Progress Info */}
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
                    <span>{formatFileSize(currentAsset.size_bytes)}</span>
                  </div>
                </div>
              )}

              {!currentAsset && (
                <div className="text-center py-12">
                  <Play className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Chọn tài liệu để phát</h3>
                  <p className="text-gray-600">Chọn một tài liệu từ danh sách bên phải để bắt đầu.</p>
                </div>
              )}
            </div>
          </div>

          {/* Assets List */}
          <div className="space-y-6">
            {/* Video Assets */}
            {videoAssets.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Play className="h-5 w-5 mr-2" />
                  Video
                </h3>
                <div className="space-y-2">
                  {videoAssets.map((asset) => (
                    <button
                      key={asset.id}
                      onClick={() => setCurrentAsset(asset)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        currentAsset?.id === asset.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-gray-900">{asset.title}</div>
                      <div className="text-sm text-gray-500">{formatFileSize(asset.size_bytes)}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Audio Assets */}
            {audioAssets.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Volume2 className="h-5 w-5 mr-2" />
                  Audio
                </h3>
                <div className="space-y-2">
                  {audioAssets.map((asset) => (
                    <button
                      key={asset.id}
                      onClick={() => setCurrentAsset(asset)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        currentAsset?.id === asset.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-gray-900">{asset.title}</div>
                      <div className="text-sm text-gray-500">{formatFileSize(asset.size_bytes)}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Document Assets */}
            {documentAssets.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Download className="h-5 w-5 mr-2" />
                  Tài liệu
                </h3>
                <div className="space-y-2">
                  {documentAssets.map((asset) => (
                    <button
                      key={asset.id}
                      onClick={() => setCurrentAsset(asset)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        currentAsset?.id === asset.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-gray-900">{asset.title}</div>
                      <div className="text-sm text-gray-500">{formatFileSize(asset.size_bytes)}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

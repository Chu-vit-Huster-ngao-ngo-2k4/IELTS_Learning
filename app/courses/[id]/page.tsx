'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, Play, Clock, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react'

interface Lesson {
  id: number
  title: string
  order_idx: number
  created_at: string
  assets: Asset[]
  progress?: {
    status: string
    last_position_sec: number
  }
}

interface Asset {
  id: number
  title: string
  provider_key: string
  mime_type: string
  size_bytes: number
}

interface Course {
  id: number
  title: string
  description: string
  created_at: string
}

export default function CourseDetailPage({ params }: { params: { id: string } }) {
  const { user, loading } = useAuth()
  const [course, setCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user && params.id) {
      fetchCourseData()
    }
  }, [user, params.id])

  const fetchCourseData = async () => {
    try {
      // Fetch course info
      const { data: courseData, error: courseError } = await supabase
        .from('Courses')
        .select('*')
        .eq('id', params.id)
        .single()

      if (courseError) throw courseError

      // Fetch lessons with assets and progress
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('Lessons')
        .select(`
          *,
          Assets(*),
          Progress!left(user_id, lesson_id, status, last_position_sec)
        `)
        .eq('course_id', params.id)
        .eq('Progress.user_id', user?.id)
        .order('order_idx')

      if (lessonsError) throw lessonsError

      setCourse(courseData)
      setLessons(lessonsData || [])
    } catch (error) {
      console.error('Error fetching course data:', error)
    } finally {
      setLoadingData(false)
    }
  }

  const updateProgress = async (lessonId: number, status: string, position: number = 0) => {
    try {
      const { error } = await supabase
        .from('Progress')
        .upsert({
          user_id: user?.id,
          lesson_id: lessonId,
          status,
          last_position_sec: position,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      // Update local state
      setLessons(prev => prev.map(lesson => 
        lesson.id === lessonId 
          ? { ...lesson, progress: { status, last_position_sec: position } }
          : lesson
      ))
    } catch (error) {
      console.error('Error updating progress:', error)
    }
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

  if (!user || !course) {
    return null
  }

  const completedLessons = lessons.filter(lesson => lesson.progress?.status === 'completed').length
  const progressPercentage = lessons.length > 0 ? (completedLessons / lessons.length) * 100 : 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/courses" className="mr-4">
                <ArrowLeft className="h-6 w-6 text-gray-600 hover:text-gray-900" />
              </Link>
              <BookOpen className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-2xl font-bold text-gray-900">IELTS LMS</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Course Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
          <p className="text-gray-600 mb-6">{course.description}</p>
          
          {/* Progress Bar */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Tiến độ khóa học</span>
              <span className="text-sm text-gray-500">{completedLessons}/{lessons.length} bài học</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-primary-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {Math.round(progressPercentage)}% hoàn thành
            </p>
          </div>
        </div>

        {/* Lessons List */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Danh sách bài học</h2>
          </div>
          
          {lessons.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có bài học nào</h3>
              <p className="text-gray-600">Bài học sẽ được thêm vào sớm nhất.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {lessons.map((lesson, index) => (
                <div key={lesson.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {lesson.progress?.status === 'completed' ? (
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        ) : (
                          <div className="h-6 w-6 rounded-full border-2 border-gray-300 flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-500">{index + 1}</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{lesson.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                          <div className="flex items-center">
                            <Play className="h-4 w-4 mr-1" />
                            {lesson.assets.length} tài liệu
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {lesson.assets.filter(a => a.mime_type?.startsWith('video')).length > 0 ? 'Video' : 'Audio'}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {lesson.progress?.status === 'completed' && (
                        <span className="text-sm text-green-600 font-medium">Hoàn thành</span>
                      )}
                      <Link 
                        href={`/lessons/${lesson.id}`}
                        className="btn-primary text-sm"
                      >
                        {lesson.progress?.status === 'completed' ? 'Xem lại' : 'Bắt đầu'}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

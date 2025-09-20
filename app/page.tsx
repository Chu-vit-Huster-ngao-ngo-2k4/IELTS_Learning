'use client';

import Link from 'next/link';
import { BookOpen, Play, Users, Award, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600 mr-2" />
              <h1 className="text-xl font-bold text-gray-900">IELTS Learning Management System</h1>
            </div>
            <nav className="flex space-x-4">
              <Link href="/simple-courses" className="text-gray-600 hover:text-gray-900">
                Khóa học
              </Link>
              <Link href="/courses" className="text-gray-600 hover:text-gray-900">
                Khóa học (Auth)
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Hệ thống học IELTS toàn diện
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Từ nền tảng đến chuyên sâu, trang bị đầy đủ kiến thức và kỹ năng để đạt điểm IELTS cao
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              href="/simple-courses"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Play className="h-5 w-5 mr-2" />
              Bắt đầu học ngay
            </Link>
            <Link
              href="/courses"
              className="bg-gray-200 text-gray-800 px-8 py-3 rounded-lg hover:bg-gray-300 transition-colors flex items-center"
            >
              <BookOpen className="h-5 w-5 mr-2" />
              Khóa học (Auth)
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Khóa học đa dạng</h3>
            <p className="text-gray-600">
              Từ vựng, ngữ pháp, phát âm đến listening gap-filling
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Play className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Video chất lượng cao</h3>
            <p className="text-gray-600">
              Video bài giảng rõ nét, dễ hiểu với hệ thống streaming hiện đại
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Award className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Theo dõi tiến độ</h3>
            <p className="text-gray-600">
              Hệ thống theo dõi tiến độ học tập chi tiết và chính xác
            </p>
          </div>
        </div>
      </div>

      {/* Course Preview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Khóa học nổi bật</h2>
          <p className="text-gray-600">Bắt đầu hành trình học IELTS của bạn</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Từ vựng cơ bản</h3>
              <p className="text-gray-600 text-sm mb-4">Nền tảng từ vựng IELTS</p>
              <Link
                href="/simple-courses/1"
                className="text-blue-600 hover:text-blue-700 flex items-center"
              >
                Xem chi tiết <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Ngữ pháp cơ bản</h3>
              <p className="text-gray-600 text-sm mb-4">Cấu trúc ngữ pháp quan trọng</p>
              <Link
                href="/simple-courses/2"
                className="text-blue-600 hover:text-blue-700 flex items-center"
              >
                Xem chi tiết <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Phát âm cơ bản</h3>
              <p className="text-gray-600 text-sm mb-4">Kỹ thuật phát âm chuẩn</p>
              <Link
                href="/simple-courses/3"
                className="text-blue-600 hover:text-blue-700 flex items-center"
              >
                Xem chi tiết <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Listening Gap-Filling</h3>
              <p className="text-gray-600 text-sm mb-4">Kỹ năng nghe và điền từ</p>
              <Link
                href="/simple-courses/4"
                className="text-blue-600 hover:text-blue-700 flex items-center"
              >
                Xem chi tiết <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <BookOpen className="h-8 w-8 text-blue-400 mr-2" />
              <h3 className="text-xl font-bold">IELTS LMS</h3>
            </div>
            <p className="text-gray-400 mb-4">
              Hệ thống quản lý học tập IELTS toàn diện
            </p>
            <div className="flex justify-center space-x-6">
              <Link href="/simple-courses" className="text-gray-400 hover:text-white">
                Khóa học
              </Link>
              <Link href="/courses" className="text-gray-400 hover:text-white">
                Khóa học (Auth)
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
export interface Course {
  id: number
  title: string
  description: string
  created_at: string
  lessons_count?: number
  completed_lessons?: number
}

export interface Lesson {
  id: number
  courseid: number
  title: string
  description?: string
  orderindex: number
  difficulty?: string
  created_at: string
  assets?: Asset[]
  course?: {
    id: number
    title: string
    description: string
  }
  progress?: {
    status: string
    last_position_sec: number
    updated_at: string
  }
}

export interface Asset {
  id: string
  lessonid: number
  title: string
  provider: string
  providerkey: string
  mimetype: string
  sizebytes: number
  checksum: string
  assettype: string
  created_at: string
}

export interface Progress {
  user_id: string
  lesson_id: number
  status: 'started' | 'completed'
  last_position_sec: number
  updated_at: string
}

export interface User {
  id: string
  email: string
  created_at: string
  updated_at: string
}

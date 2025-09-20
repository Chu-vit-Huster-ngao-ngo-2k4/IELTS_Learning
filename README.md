# IELTS Learning Management System (LMS)

A comprehensive IELTS learning platform built with Next.js, Supabase, and Cloudflare R2.

## 🚀 Features

- **Video Lessons**: Watch instructional videos for vocabulary, grammar, pronunciation, and listening
- **Interactive Exercises**: Practice with PDF exercises and downloadable answer keys
- **Audio Support**: Listen to pronunciation and listening exercises
- **Progress Tracking**: Track your learning progress across different courses
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## 📚 Courses Available

1. **Từ vựng cơ bản** (Basic Vocabulary) - 10 lessons
2. **Ngữ pháp cơ bản plus** (Grammar Plus) - 16 lessons
3. **Phát âm cơ bản** (Basic Pronunciation) - 18 lessons
4. **Listening Gap-Filling** - 15 lessons

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Authentication)
- **Storage**: Cloudflare R2 (Videos, PDFs, Audio files)
- **Deployment**: Vercel

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Cloudflare R2 account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ielts-lms.git
cd ielts-lms
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env.local
```

4. Configure your environment variables in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_R2_ENDPOINT=your_r2_endpoint
NEXT_PUBLIC_R2_BUCKET=your_r2_bucket
R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret_key
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── courses/           # Course pages
│   └── lessons/           # Lesson pages
├── components/            # React components
│   ├── VideoPlayer.tsx    # Video player component
│   ├── AudioPlayer.tsx    # Audio player component
│   └── ExerciseQuiz.tsx   # Exercise component
├── lib/                   # Utility functions
├── database/              # SQL scripts and schemas
└── scripts/               # Development scripts
```

## 🔧 Configuration

### Supabase Setup

1. Create a new Supabase project
2. Run the SQL scripts in `database/` folder to set up tables
3. Enable Row Level Security (RLS) policies
4. Set up authentication providers

### Cloudflare R2 Setup

1. Create a Cloudflare R2 bucket
2. Generate API credentials
3. Upload media files to the bucket
4. Configure CORS settings

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy!

### Deploy to Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

If you have any questions or need help, please open an issue on GitHub.

---

Built with ❤️ for IELTS learners worldwide.
'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Download } from 'lucide-react';

interface AudioPlayerCompactProps {
  src: string;
  title: string;
  mimeType: string;
  sizeBytes: number;
  onProgress?: (progress: number) => void;
  onCompleted?: () => void;
  onToggleCompleted?: () => void;
  isCompleted?: boolean;
}

export default function AudioPlayerCompact({ 
  src, 
  title, 
  mimeType, 
  sizeBytes, 
  onProgress,
  onCompleted,
  onToggleCompleted,
  isCompleted = false
}: AudioPlayerCompactProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Format time in MM:SS format
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Toggle play/pause
  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  // Handle audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadStart = () => setIsLoading(true);
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (onProgress && duration > 0) {
        onProgress((audio.currentTime / duration) * 100);
      }
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      if (onCompleted) {
        onCompleted();
      }
    };
    const handleError = () => {
      setError('Không thể phát audio');
      setIsLoading(false);
    };

    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [duration, onProgress]);

  // Download handler
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = src;
    link.download = title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Progress bar click
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current && duration > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const newTime = (clickX / rect.width) * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  if (error) {
    return (
      <div className="bg-red-50 rounded-lg p-2 border border-red-200">
        <p className="text-xs text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${isCompleted ? 'opacity-60' : ''}`}>
      {/* Audio Controls */}
      <div className="flex items-center space-x-2">
        <button
          onClick={togglePlayPause}
          disabled={isLoading}
          className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors disabled:opacity-50 ${
            isCompleted 
              ? 'bg-gray-200 hover:bg-gray-300' 
              : 'bg-blue-100 hover:bg-blue-200'
          }`}
        >
          {isLoading ? (
            <div className="w-2 h-2 border border-blue-600 border-t-transparent rounded-full animate-spin" />
          ) : isCompleted ? (
            <div className="w-2 h-2 bg-gray-500 rounded-full" />
          ) : isPlaying ? (
            <Pause className="w-2 h-2 text-blue-600" />
          ) : (
            <Play className="w-2 h-2 text-blue-600" />
          )}
        </button>
        
        <div className="flex-1 min-w-0">
          <div className={`text-xs truncate ${isCompleted ? 'text-gray-400' : 'text-gray-500'}`}>
            {isCompleted ? '✓ ' : ''}{title}
          </div>
          <div className={`text-xs ${isCompleted ? 'text-gray-300' : 'text-gray-400'}`}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>
        
        {onToggleCompleted && (
          <button
            onClick={onToggleCompleted}
            className={`p-1 rounded transition-colors ${
              isCompleted 
                ? 'text-gray-400 hover:text-gray-600' 
                : 'text-gray-300 hover:text-gray-500'
            }`}
            title={isCompleted ? 'Đánh dấu chưa nghe' : 'Đánh dấu đã nghe'}
          >
            {isCompleted ? '✓' : '○'}
          </button>
        )}
        
        <button
          onClick={handleDownload}
          className={`p-1 transition-colors ${
            isCompleted 
              ? 'text-gray-400 hover:text-gray-600' 
              : 'text-gray-400 hover:text-gray-600'
          }`}
          title="Tải xuống"
        >
          <Download className="w-3 h-3" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="relative">
        <div
          className="w-full h-1 bg-gray-200 rounded-full cursor-pointer"
          onClick={handleProgressClick}
        >
          <div
            className={`h-1 rounded-full transition-all duration-100 ${
              isCompleted ? 'bg-gray-500' : 'bg-blue-600'
            }`}
            style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
          />
        </div>
      </div>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
      />
    </div>
  );
}

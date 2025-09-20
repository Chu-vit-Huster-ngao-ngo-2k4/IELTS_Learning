'use client';

import { useState, useEffect } from 'react';
import AudioPlayerCompact from './AudioPlayerCompact';

interface AudioPlayerWrapperProps {
  audio: {
    id: string;
    title: string;
    providerkey: string;
    mimetype: string;
    sizebytes: number;
  };
  onProgress?: (progress: number) => void;
  onCompleted?: () => void;
  onToggleCompleted?: () => void;
  isCompleted?: boolean;
}

export default function AudioPlayerWrapper({ audio, onProgress, onCompleted, onToggleCompleted, isCompleted = false }: AudioPlayerWrapperProps) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (!audio) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-gray-600 text-sm">⚠️</span>
          </div>
          <div>
            <p className="text-sm text-gray-500">Audio không khả dụng</p>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (audio?.providerkey) {
      getSignedUrl();
    }
  }, [audio?.providerkey]);

  const getSignedUrl = async () => {
    if (!audio?.providerkey) {
      setError('Audio asset not available');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/r2-sign?key=${encodeURIComponent(audio.providerkey)}`);
      
      if (!response.ok) {
        throw new Error(`Failed to get signed URL: ${response.status}`);
      }
      
      const data = await response.json();
      setSignedUrl(data.signedUrl || data.url);
    } catch (err) {
      console.error('Error getting signed URL:', err);
      setError('Không thể tải audio file');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
            <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !signedUrl) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-3 border border-red-200">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-red-600 text-sm">⚠️</span>
          </div>
          <div>
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={getSignedUrl}
              className="mt-1 text-xs text-blue-600 hover:text-blue-800"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AudioPlayerCompact
      src={signedUrl}
      title={audio.title}
      mimeType={audio.mimetype}
      sizeBytes={audio.sizebytes}
      onProgress={onProgress}
      onCompleted={onCompleted}
      onToggleCompleted={onToggleCompleted}
      isCompleted={isCompleted}
    />
  );
}

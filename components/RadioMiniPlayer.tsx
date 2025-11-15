'use client';

import { useEffect, useRef } from 'react';
import { useRadioStore } from '@/store/radioStore';

// Format seconds to mm:ss
function formatTime(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function RadioMiniPlayer() {
  const {
    playlist,
    currentTrackIndex,
    isPlaying,
    currentTime,
    duration,
    isSeeking,
    audioRef,
    initializeAudio,
    togglePlay,
    next,
    setTrack,
    setCurrentTime,
    setDuration,
    setIsSeeking,
  } = useRadioStore();

  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const currentTrack = playlist[currentTrackIndex];

  // Initialize audio element and sync with store
  useEffect(() => {
    const { initializeAudio } = useRadioStore.getState();
    initializeAudio();
  }, []);

  // Set up audio event listeners
  useEffect(() => {
    const audio = audioRef;
    if (!audio) return;

    // Set source when track changes
    if (currentTrack?.url && audio.src !== currentTrack.url) {
      audio.src = currentTrack.url;
      setCurrentTime(0);
      setDuration(0);
    }

    // Handle metadata loaded
    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    // Handle time update
    const handleTimeUpdate = () => {
      if (!isSeeking) {
        setCurrentTime(audio.currentTime || 0);
      }
    };

    // Handle track ended
    const handleEnded = () => {
      next();
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrackIndex, currentTrack?.url, isSeeking, setCurrentTime, setDuration, next]);

  // Sync play/pause state with audio element
  useEffect(() => {
    const audio = audioRef;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch((err) => {
        console.error('Error playing audio:', err);
        useRadioStore.getState().pause();
      });
    } else {
      audio.pause();
    }
  }, [isPlaying]);


  // Calculate progress
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Handle progress bar click
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef;
    const progressBar = progressBarRef.current;
    if (!audio || !progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;

    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Handle drag
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsSeeking(true);
    const progressBar = progressBarRef.current;
    if (!progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = percentage * duration;

    setCurrentTime(newTime);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isSeeking) return;

    const progressBar = progressBarRef.current;
    if (!progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = percentage * duration;

    setCurrentTime(newTime);
  };

  const handleMouseUp = () => {
    const audio = audioRef;
    if (!audio) return;

    audio.currentTime = currentTime;
    setIsSeeking(false);
  };

  // Don't render if no track selected
  if (!currentTrack) return null;

  return (
    <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Play/Pause Button */}
          <button
            type="button"
            onClick={togglePlay}
            className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <span className="text-lg">{isPlaying ? '⏸' : '▶'}</span>
          </button>

          {/* Track Info */}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {currentTrack.title}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="hidden md:flex flex-1 max-w-md">
            <div
              ref={progressBarRef}
              className="relative w-full h-2 cursor-pointer group touch-none rounded-full"
              onClick={handleProgressClick}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <div className="absolute inset-0 h-1 bg-gray-300 dark:bg-gray-700 rounded-full mt-0.5"></div>
              <div
                className="absolute h-1 bg-blue-600 dark:bg-blue-500 rounded-full mt-0.5 transition-all duration-100"
                style={{ width: `${progress}%` }}
              ></div>
              <div
                className="absolute top-0 w-2 h-2 bg-white rounded-full shadow transform -translate-x-1/2 transition-transform hover:scale-110"
                style={{ left: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Next Button */}
          <button
            type="button"
            onClick={next}
            className="flex-shrink-0 px-3 py-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}


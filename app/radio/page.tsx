'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import { useRadioStore } from '@/store/radioStore';
import WrapperClient from '@/app/WrapperClient';

// Format seconds to mm:ss
function formatTime(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function RadioPage() {
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

  const [isShuffling, setIsShuffling] = useState(false);
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  // Initialize audio element if not already set in store
  useEffect(() => {
    if (!audioRef) {
      initializeAudio();
    }
  }, [audioRef, initializeAudio]);

  // Sync audio source when track changes
  useEffect(() => {
    const audio = audioRef;
    if (!audio) return;

    const track = playlist[currentTrackIndex];
    if (!track?.url) return;

    // Set source and load properly to avoid AbortError
    audio.src = track.url;
    audio.load();
    setCurrentTime(0);
    setDuration(0);

    if (isPlaying && track.url) {
      // Wait for audio to be ready before playing
      const handleCanPlayThrough = () => {
        audio
          .play()
          .then(() => {
            useRadioStore.getState().play();
          })
          .catch((err) => {
            console.error('Error playing audio:', err);
            useRadioStore.getState().pause();
          });
        audio.removeEventListener('canplaythrough', handleCanPlayThrough);
      };

      audio.addEventListener('canplaythrough', handleCanPlayThrough);
      
      // If already loaded, play immediately
      if (audio.readyState >= 3) {
        handleCanPlayThrough();
      }
    }
  }, [currentTrackIndex, playlist, isPlaying, audioRef, setCurrentTime, setDuration]);

  // Handle audio metadata loaded
  useEffect(() => {
    const audio = audioRef;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const handleTimeUpdate = () => {
      if (!isSeeking) {
        setCurrentTime(audio.currentTime || 0);
      }
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [isSeeking, audioRef, setCurrentTime, setDuration]);

  // Play random track (for shuffle mode)
  const playRandomTrack = useCallback(() => {
    if (playlist.length === 0) return;

    const audio = audioRef;
    if (!audio) return;

    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * playlist.length);
    } while (randomIndex === currentTrackIndex && playlist.length > 1);

    const track = playlist[randomIndex];
    if (!track?.url) return;

    // Set source and load properly
    audio.src = track.url;
    audio.load();
    // Update track index without calling setTrack (which would set src again)
    useRadioStore.setState({ currentTrackIndex: randomIndex, currentTime: 0, duration: 0 });

    // Wait for audio to be ready before playing
    const handleCanPlayThrough = () => {
      audio
        .play()
        .then(() => {
          useRadioStore.getState().play();
        })
        .catch((err) => {
          console.error('Error playing random track:', err);
          useRadioStore.getState().pause();
        });
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);
    };

    audio.addEventListener('canplaythrough', handleCanPlayThrough);
    
    // If already loaded, play immediately
    if (audio.readyState >= 3) {
      handleCanPlayThrough();
    }
  }, [playlist, currentTrackIndex, audioRef]);

  // Handle track ended event - auto-advance to next track
  useEffect(() => {
    const audio = audioRef;
    if (!audio) return;

    const handleEnded = () => {
      if (isShuffling) {
        playRandomTrack();
      } else {
        next();
      }
    };

    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioRef, next, isShuffling, playRandomTrack]);

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
  }, [isPlaying, audioRef]);

  // Play specific track from playlist
  const playTrack = (index: number) => {
    const audio = audioRef;
    if (!audio) return;

    const track = playlist[index];
    if (!track?.url) return;

    // Set source and load properly
    audio.src = track.url;
    audio.load();
    // Update track index without calling setTrack (which would set src again)
    useRadioStore.setState({ currentTrackIndex: index, currentTime: 0, duration: 0 });

    // Wait for audio to be ready before playing
    const handleCanPlayThrough = () => {
      audio
        .play()
        .then(() => {
          useRadioStore.getState().play();
        })
        .catch((err) => {
          console.error('Error playing track:', err);
          useRadioStore.getState().pause();
        });
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);
    };

    audio.addEventListener('canplaythrough', handleCanPlayThrough);
    
    // If already loaded, play immediately
    if (audio.readyState >= 3) {
      handleCanPlayThrough();
    }
  };

  // Calculate progress percentage
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

  // Handle progress bar drag
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

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setIsSeeking(true);
    const progressBar = progressBarRef.current;
    if (!progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const touchX = e.touches[0].clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, touchX / rect.width));
    const newTime = percentage * duration;

    setCurrentTime(newTime);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isSeeking) return;

    const progressBar = progressBarRef.current;
    if (!progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const touchX = e.touches[0].clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, touchX / rect.width));
    const newTime = percentage * duration;

    setCurrentTime(newTime);
  };

  const handleTouchEnd = () => {
    const audio = audioRef;
    if (!audio) return;

    audio.currentTime = currentTime;
    setIsSeeking(false);
  };

  const currentTrack = playlist[currentTrackIndex];

  return (
    <WrapperClient>
      {/* Station Header */}
      <div className="flex flex-col items-center text-center gap-4 mb-10 pt-10">
        <div className="w-full max-w-4xl mx-auto px-4">
          <Image
            src="/radio/banner.jpg"
            alt="Christmas LoFi Radio Banner"
            width={1600}
            height={900}
            className="rounded-3xl shadow-lg object-cover w-full"
            priority
          />
        </div>
        <h1 className="text-3xl font-semibold mt-2 text-white">🎄 Christmas LoFi Radio</h1>
        <p className="text-gray-600 dark:text-gray-300 max-w-xl">
          Soft, cozy winter melodies generated by AI. Perfect for writing, studying, and creating.
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-8 pb-24">

        {/* Player Card */}
        <div className="bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-gray-800 dark:to-gray-900 p-6 rounded-3xl shadow-md border border-white/40 mb-8">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Now Playing:</p>
          <h2 className="text-2xl font-semibold mt-2 mb-6 text-gray-900 dark:text-white">
            {currentTrack?.title || 'No track selected'}
          </h2>

          <div className="flex items-center gap-4 mb-6">
            <button
              type="button"
              onClick={togglePlay}
              className="px-8 py-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
            >
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <button
              type="button"
              onClick={next}
              className="px-6 py-3 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Next track
            </button>
            <button
              type="button"
              onClick={() => setIsShuffling(!isShuffling)}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-colors ${
                isShuffling
                  ? 'bg-indigo-600 text-white dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Shuffle
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full px-4 mt-4 rounded-full">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                {formatTime(currentTime)}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                {formatTime(duration)}
              </span>
            </div>
            <div
              ref={progressBarRef}
              className="relative w-full h-3 cursor-pointer group touch-none rounded-full"
              onClick={handleProgressClick}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Progress Track */}
              <div className="absolute inset-0 h-1 bg-gray-300 dark:bg-gray-700 rounded-full mt-1"></div>
              
              {/* Progress Fill */}
              <div
                className="absolute h-1 bg-blue-600 dark:bg-blue-500 rounded-full mt-1 transition-all duration-100"
                style={{ width: `${progress}%` }}
              ></div>
              
              {/* Draggable Thumb */}
              <div
                className="absolute top-0 w-3 h-3 bg-white rounded-full shadow-lg transform -translate-x-1/2 transition-transform hover:scale-110 group-hover:scale-110"
                style={{ left: `${progress}%` }}
              ></div>
            </div>
          </div>

        </div>

        {/* Playlist */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Playlist</h3>
          <div className="space-y-1">
            {playlist.map((track, index) => (
              <div
                key={track.id}
                className={`
                  flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition
                  ${index === currentTrackIndex
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 font-semibold'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200'
                  }
                `}
                onClick={() => playTrack(index)}
              >
                <div className="flex items-center gap-3">
                  {index === currentTrackIndex && isPlaying ? (
                    <div className="flex items-end gap-1 w-6 h-5">
                      <span className="equalizer-bar animate-eq w-1 bg-blue-500 rounded-sm"></span>
                      <span className="equalizer-bar animate-eq2 w-1 bg-blue-500 rounded-sm"></span>
                      <span className="equalizer-bar animate-eq3 w-1 bg-blue-500 rounded-sm"></span>
                    </div>
                  ) : (
                    <span className="text-sm w-6 opacity-60">{index + 1}</span>
                  )}
                  <span>{track.title}</span>
                </div>
                <span className="text-sm opacity-60">--:--</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </WrapperClient>
  );
}

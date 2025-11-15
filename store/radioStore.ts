import { create } from 'zustand';
import { christmasLofiPlaylist } from '@/lib/radioPlaylist';

type RadioState = {
  playlist: typeof christmasLofiPlaylist;
  currentTrackIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isSeeking: boolean;
  audioRef: HTMLAudioElement | null;
  initializeAudio: () => HTMLAudioElement;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  next: () => void;
  setTrack: (index: number) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setIsSeeking: (seeking: boolean) => void;
  reset: () => void;
};

export const useRadioStore = create<RadioState>((set, get) => ({
  playlist: christmasLofiPlaylist,
  currentTrackIndex: 0,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  isSeeking: false,
  audioRef: null,

  initializeAudio: () => {
    const { audioRef } = get();
    if (audioRef) return audioRef;

    if (typeof window !== 'undefined') {
      const audio = new Audio();
      audio.preload = 'auto';
      set({ audioRef: audio });
      return audio;
    }
    return null as any;
  },

  play: () => {
    const { audioRef } = get();
    if (!audioRef) return;

    audioRef
      .play()
      .then(() => {
        set({ isPlaying: true });
      })
      .catch((err) => {
        console.error('Error playing audio:', err);
        set({ isPlaying: false });
      });
  },

  pause: () => {
    const { audioRef } = get();
    if (audioRef) {
      audioRef.pause();
    }
    set({ isPlaying: false });
  },

  togglePlay: () => {
    const { isPlaying, play, pause } = get();
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  },

  next: () => {
    const { currentTrackIndex, playlist, setTrack, isPlaying } = get();
    const nextIndex = currentTrackIndex + 1 >= playlist.length ? 0 : currentTrackIndex + 1;
    setTrack(nextIndex);
    // Don't call play() here - let the useEffect in the component handle playback
    // after the audio source is loaded via canplaythrough event
  },

  setTrack: (index) => {
    const { audioRef, playlist } = get();
    if (index < 0 || index >= playlist.length) return;

    if (audioRef) {
      audioRef.src = playlist[index].url;
      audioRef.load(); // Load the new source to avoid AbortError
    }
    set({ currentTrackIndex: index, currentTime: 0, duration: 0 });
  },

  setCurrentTime: (time) => {
    set({ currentTime: time });
  },

  setDuration: (duration) => {
    set({ duration });
  },

  setIsSeeking: (seeking) => {
    set({ isSeeking: seeking });
  },

  reset: () => {
    set({
      currentTrackIndex: 0,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      isSeeking: false,
    });
  },
}));


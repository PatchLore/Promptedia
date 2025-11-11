'use client';

import { useCallback, useEffect, useState } from 'react';

type AudioState = {
  isPlaying: boolean;
  currentUrl: string | null;
  error: string | null;
};

let audioElement: HTMLAudioElement | null = null;
let sharedState: AudioState = {
  isPlaying: false,
  currentUrl: null,
  error: null,
};

const subscribers = new Set<(state: AudioState) => void>();

function ensureAudioElement(): HTMLAudioElement {
  if (typeof window === 'undefined') {
    throw new Error('Audio preview is only available in the browser.');
  }

  if (!audioElement) {
    audioElement = new Audio();
    audioElement.preload = 'none';

    audioElement.addEventListener('ended', () => {
      updateSharedState({ isPlaying: false, currentUrl: null });
    });

    audioElement.addEventListener('pause', () => {
      if (audioElement?.currentTime === 0 || audioElement?.ended) {
        updateSharedState({ isPlaying: false, currentUrl: null });
      }
    });

    audioElement.addEventListener('error', () => {
      updateSharedState({
        isPlaying: false,
        currentUrl: null,
        error: 'Audio preview failed to load.',
      });
    });
  }

  return audioElement;
}

function updateSharedState(partial: Partial<AudioState>) {
  sharedState = { ...sharedState, ...partial };
  notifySubscribers();
}

function notifySubscribers() {
  const snapshot = { ...sharedState };
  subscribers.forEach((listener) => listener(snapshot));
}

function stopPlaybackInternal() {
  if (!audioElement) return;
  audioElement.pause();
  audioElement.currentTime = 0;
  updateSharedState({ isPlaying: false, currentUrl: null });
}

async function playInternal(url: string) {
  if (!url) return;

  const audio = ensureAudioElement();

  if (sharedState.isPlaying && sharedState.currentUrl === url) {
    stopPlaybackInternal();
    return;
  }

  updateSharedState({ error: null });

  if (sharedState.currentUrl && sharedState.currentUrl !== url) {
    stopPlaybackInternal();
  }

  if (audio.src !== url) {
    audio.src = url;
  }

  try {
    await audio.play();
    updateSharedState({ isPlaying: true, currentUrl: url });
  } catch (error) {
    console.error('Audio preview playback failed:', error);
    stopPlaybackInternal();
    updateSharedState({ error: 'Audio preview playback failed.' });
  }
}

export function useAudioPreview() {
  const [state, setState] = useState<AudioState>(() => ({ ...sharedState }));

  useEffect(() => {
    subscribers.add(setState);
    setState({ ...sharedState });
    return () => {
      subscribers.delete(setState);
    };
  }, []);

  const play = useCallback((url: string) => {
    playInternal(url);
  }, []);

  const stop = useCallback(() => {
    stopPlaybackInternal();
  }, []);

  return {
    isPlaying: state.isPlaying,
    currentUrl: state.currentUrl,
    error: state.error,
    play,
    stop,
  };
}



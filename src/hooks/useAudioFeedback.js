import { useCallback, useRef } from "react";

export const useAudioFeedback = () => {
  const audioRefs = useRef({
    correct: null,
    wrong: null,
    courseComplete: null,
  });

  // Initialize audio objects
  const initializeAudio = useCallback(() => {
    if (!audioRefs.current.correct) {
      audioRefs.current.correct = new Audio("/content/media/audio/correct.mp3");
      audioRefs.current.wrong = new Audio("/content/media/audio/wrong.mp3");
      audioRefs.current.courseComplete = new Audio(
        "/content/media/audio/task_end.mp3"
      );

      // Preload audio files
      Object.values(audioRefs.current).forEach((audio) => {
        if (audio) {
          audio.preload = "auto";
          audio.volume = 0.6; // Set comfortable volume
        }
      });
    }
  }, []);

  const playAudio = useCallback(
    async (type) => {
      try {
        initializeAudio();

        const audio = audioRefs.current[type];
        if (!audio) {
          console.warn(`Audio type "${type}" not found`);
          return;
        }

        // Reset audio to beginning
        audio.currentTime = 0;

        // Play audio
        await audio.play();
      } catch (error) {
        // Handle autoplay restrictions gracefully
        console.warn("Audio playback failed:", error.message);
      }
    },
    [initializeAudio]
  );

  const playCorrectSound = useCallback(() => playAudio("correct"), [playAudio]);
  const playWrongSound = useCallback(() => playAudio("wrong"), [playAudio]);
  const playCourseCompleteSound = useCallback(
    () => playAudio("courseComplete"),
    [playAudio]
  );

  // Cleanup function
  const cleanup = useCallback(() => {
    Object.values(audioRefs.current).forEach((audio) => {
      if (audio) {
        audio.pause();
        audio.src = "";
      }
    });
    audioRefs.current = { correct: null, wrong: null, courseComplete: null };
  }, []);

  return {
    playCorrectSound,
    playWrongSound,
    playCourseCompleteSound,
    cleanup,
  };
};

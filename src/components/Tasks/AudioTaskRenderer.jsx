import { div } from "framer-motion/client";
import { CheckCircle, Pause, Play, Volume2, XCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion"; // Import Framer Motion for animations

export const AudioTaskRenderer = ({
  question,
  currentAnswer,
  onAnswerChange,
  isSubmitted,
  showFeedback,
  isCorrect,
  taskType,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayedAudio, setHasPlayedAudio] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  // Handle audio play/pause
  const handlePlayAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch((error) => {
        console.error("Audio play failed:", error);
      });
    }
  };

  // Event handlers for audio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handlePlay = () => {
      setIsPlaying(true);
      setHasPlayedAudio(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = (e) => {
      console.error("Audio error:", e);
      setIsPlaying(false);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, [question?.audio]);

  // Reset state on question change
  useEffect(() => {
    setHasPlayedAudio(false);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    // Stop any previous audio playing
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }, [question?.id]);

  // Option selection handler
  const handleOptionSelect = (index) => {
    if (isSubmitted) return; // Prevent selecting once submitted
    onAnswerChange(index);
  };

  // Format time for display
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Question Header */}
      {question.question && (
        <div className="text-center">
          <h4 className="text-xl md:text-2xl font-bold text-gray-800">
            {question.question}
          </h4>
        </div>
      )}

      {/* Audio Player */}
      <div className="bg-white rounded-xl py-6 border border-gray-200">
        <div className="text-center space-y-4">
          {/* Circular Button with Wave Effect */}
          <motion.button
            onClick={handlePlayAudio}
            disabled={!question.audio}
            className={`relative inline-flex items-center justify-center w-16 h-16 rounded-full transition-colors ${
              question.audio
                ? "bg-[#9C45FF] text-white hover:bg-[#9C45FF]"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
            whileTap={{ scale: 0.9 }} // Bounce effect on click
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}

            {/* Wave Effect */}
            {isPlaying && (
              <div className="absolute w-full h-full rounded-full bg-[#9C45FF] opacity-30 animate-ping"></div>
            )}
          </motion.button>

          {question.audio && (
            <audio ref={audioRef} src={question.audio} preload="metadata" />
          )}

          {/* Progress Bar */}
          {duration > 0 && (
            <div className="w-60 sm:w-70 md:w-80 mx-auto">
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                <span>{formatTime(currentTime)}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-1">
                  <div
                    className="bg-[#6976F8] h-full rounded-full transition-all"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  />
                </div>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Options */}
      {question.options?.length > 0 && (
        <div className="space-y-2">
          {question.options.map((option, index) => {
            const isSelected = currentAnswer === index;
            const isCorrectAnswer = index === question.answer;
            const showResult = showFeedback && isSelected;

            return (
              <button
                key={index}
                onClick={() => handleOptionSelect(index)}
                disabled={isSubmitted}
                className={`w-full text-left p-4 rounded-lg border transition-all ${
                  showResult
                    ? isCorrectAnswer
                      ? "border-green-400 bg-green-50 text-green-800"
                      : "border-red-400 bg-red-50 text-red-800"
                    : isSelected
                    ? "border-blue-400 bg-blue-50 text-[#6976F8]"
                    : "border-gray-200 bg-white hover:border-gray-300 text-gray-700"
                } ${
                  isSubmitted
                    ? "cursor-default"
                    : "cursor-pointer hover:shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between relative">
                  <span className="font-medium">{option}</span>

                  {showResult && isSubmitted && (
                    <div className="absolute right-3 flex items-center gap-1">
                      {isCorrectAnswer ? (
                        <CheckCircle size={16} className="text-green-600" />
                      ) : (
                        <XCircle size={16} className="text-red-600" />
                      )}
                    </div>
                  )}

                  {isSelected && !isSubmitted && (
                    <div className="absolute right-3 flex items-center gap-1">
                      <CheckCircle size={16} />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

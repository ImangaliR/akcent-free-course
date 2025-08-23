import {
  CheckCircle,
  Pause,
  Play,
  Volume,
  Volume1,
  Volume2,
  XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import talkingAnimation from "../../assets/talking_green_man.json";
import Lottie from "lottie-react";

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

  // NEW: lottie ref to control animation
  const lottieRef = useRef(null);

  const handlePlayAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) audio.pause();
    else audio.play().catch((e) => console.error("Audio play failed:", e));
  };

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoadedMetadata = () => setDuration(audio.duration);
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onPlay = () => {
      setIsPlaying(true);
      setHasPlayedAudio(true);
    };
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    const onError = (e) => {
      console.error("Audio error:", e);
      setIsPlaying(false);
    };

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
  }, [question?.audio]);

  // Reset on question change
  useEffect(() => {
    setHasPlayedAudio(false);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    // Reset Lottie to idle frame
    if (lottieRef.current) lottieRef.current.goToAndStop(0, true);
  }, [question?.id]);

  // NEW: drive Lottie from audio playing state
  useEffect(() => {
    const l = lottieRef.current;
    if (!l) return;
    if (isPlaying) {
      l.play();
    } else {
      // stop at idle frame (mouth closed). If your idle frame differs, replace 0.
      l.goToAndStop(0, true);
    }
  }, [isPlaying]);

  const handleOptionSelect = (index) => {
    if (isSubmitted) return;
    onAnswerChange(index);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {question.question && (
        <div className="text-center">
          <h4 className="text-xl md:text-2xl font-bold text-gray-800">
            {question.question}
          </h4>
        </div>
      )}

      <div className="bg-white rounded-xl pb-3 border border-gray-200">
        <div className="text-center">
          {/* NEW: relative container so we can overlay the speech bubble */}
          <div className="relative mx-auto w-56 h-56 sm:w-64 sm:h-64 overflow-hidden">
            <Lottie
              lottieRef={lottieRef}
              animationData={talkingAnimation}
              loop
              autoplay={false}
              className="absolute inset-0 w-full h-full pointer-events-none origin-top"
              // key bit: align to TOP and fill like object-fit: cover
              rendererSettings={{ preserveAspectRatio: "xMidYMin slice" }}
            />

            {/* LEFT-SIDE speech bubble (points right, at the mouth) */}
            <motion.button
              onClick={handlePlayAudio}
              disabled={!question.audio}
              className={`absolute top-[43%] md:top-[44%] -translate-y-1/2 left-[35%] md:left-[33%] -translate-x-full
     inline-flex items-center justify-center
    px-3 py-2 md:px-4 md:py-2.5 rounded-xl shadow-md border-2 cursor-pointer
    ${
      question.audio
        ? "bg-white border-[#9C45FF] text-[#9C45FF] hover:border-purple-500"
        : "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed"
    }`}
              whileTap={{ scale: 0.95 }}
              aria-label={isPlaying ? "Pause audio" : "Play audio"}
            >
              {/* Icon grows on hover */}
              <motion.div
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 md:w-6 md:h-6" />
                ) : (
                  <Volume2 className="w-5 h-5 md:w-6 md:h-6" />
                )}
              </motion.div>

              {/* RIGHT-SIDE tail (attached + clickable) */}
              <div
                className={`absolute -right-[1px] top-1/2 translate-x-1/2 -translate-y-1/2
      w-3 h-3 rotate-45
      ${
        question.audio
          ? "bg-white border-t-2 border-r-2 border-[#9C45FF]"
          : "bg-gray-100 border-t-2 border-r-2 border-gray-300"
      }`}
              />
            </motion.button>
          </div>

          {question.audio && (
            <audio
              ref={audioRef}
              src={question.audio}
              preload="metadata"
              className="hidden"
            />
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
                      ? "border-green-600 bg-green-100 text-green-800"
                      : "border-red-600 bg-red-100 text-red-800"
                    : isSelected
                    ? "border-blue-600 bg-blue-100 text-[#3849ff]"
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

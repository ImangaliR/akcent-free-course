import { CheckCircle, Pause, Play, Volume2, XCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

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

  // Воспроизведение аудио
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

  // Обработчики событий аудио
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

  // Сброс состояния при смене вопроса
  useEffect(() => {
    setHasPlayedAudio(false);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    // Останавливаем предыдущее аудио если оно играет
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }, [question?.id]);

  // Выбор опции
  const handleOptionSelect = (index) => {
    if (isSubmitted) return;
    onAnswerChange(index);
  };

  // Проверяем наличие question
  // Проверяем наличие question
  if (!question) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-gray-400">Загрузка...</p>
      </div>
    );
  }

  // Форматирование времени
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Заголовок */}
      {question.question && (
        <div className="text-center">
          <h4 className="text-lg font-medium text-gray-800">
            {question.question}
          </h4>
        </div>
      )}

      {/* Аудио плеер */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="text-center space-y-4">
          <Volume2 className="mx-auto text-gray-400" size={24} />

          <button
            onClick={handlePlayAudio}
            disabled={!question.audio}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              question.audio
                ? "bg-[#ED8A2E] text-white hover:bg-[#D6761F]"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isPlaying ? (
              <>
                <Pause size={16} />
                Тоқтату
              </>
            ) : (
              <>
                <Play size={16} />
                Тыңдау
              </>
            )}
          </button>

          {/* Прогресс */}
          {hasPlayedAudio && duration > 0 && (
            <div className="max-w-xs mx-auto">
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

          {question.audio && (
            <audio ref={audioRef} src={question.audio} preload="metadata" />
          )}
        </div>
      </div>

      {/* Варианты ответов */}
      {question.options?.length > 0 && (
        <div className="space-y-2">
          {question.options.map((option, index) => {
            const isSelected = currentAnswer === index;
            const isCorrect = index === question.answer;
            const showResult = showFeedback && isSelected;

            return (
              <button
                key={index}
                onClick={() => handleOptionSelect(index)}
                disabled={isSubmitted}
                className={`w-full text-left p-4 rounded-lg border transition-all ${
                  showResult
                    ? isCorrect
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
                <div className="flex items-center justify-between">
                  <span className="font-medium">{option}</span>

                  {showResult && (
                    <div className="flex items-center gap-1">
                      {isCorrect ? (
                        <CheckCircle size={16} className="text-green-600" />
                      ) : (
                        <XCircle size={16} className="text-red-600" />
                      )}
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

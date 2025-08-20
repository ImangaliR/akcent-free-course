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
  if (!question) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">Вопрос загружается...</p>
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
    <div className="mx-auto max-w-4xl">
      {/* Заголовок */}
      <div className="text-center mb-8">
        <h4 className="text-2xl font-bold text-gray-800 mb-3">
          {question.question || "Аудио тапсырма"}
        </h4>
        <p className="text-sm text-gray-500">
          Аудионы тыңдап, дұрыс жауапты таңдаңыз
        </p>
      </div>

      {/* Аудио плеер */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 text-center border border-blue-100">
          <Volume2 className="mx-auto text-blue-600 mb-4" size={32} />

          <button
            onClick={handlePlayAudio}
            disabled={!question.audio}
            className={`inline-flex items-center gap-3 px-8 py-4 rounded-xl transition-all font-semibold text-lg shadow-md ${
              question.audio
                ? "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg transform hover:scale-105"
                : "bg-gray-400 text-gray-200 cursor-not-allowed"
            }`}
          >
            {isPlaying ? (
              <>
                <Pause size={20} />
                Тоқтату
              </>
            ) : (
              <>
                <Play size={20} />
                {hasPlayedAudio ? "Қайта тыңдау" : "Тыңдау"}
              </>
            )}
          </button>

          {/* Прогресс бар */}
          {hasPlayedAudio && duration > 0 && (
            <div className="mt-4 max-w-md mx-auto">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <span>{formatTime(currentTime)}</span>
                <div className="flex-1 bg-blue-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full transition-all duration-200"
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

          {/* Debug info */}
          {!question.audio && (
            <p className="text-red-500 text-sm mt-2">
              Нет аудио файла. Получен: {JSON.stringify(question.audio)}
            </p>
          )}
        </div>
      </div>

      {/* Варианты ответов */}
      <div className="space-y-4 mb-6">
        {question.options?.length > 0 ? (
          question.options.map((option, index) => {
            const isSelected = currentAnswer === index;
            const isCorrectOption = index === question.answer;
            const showCorrectAnswer =
              showFeedback && isCorrectOption && isSelected;
            const showIncorrectAnswer =
              showFeedback && isSelected && !isCorrectOption;

            return (
              <button
                key={index}
                onClick={() => handleOptionSelect(index)}
                disabled={isSubmitted}
                className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-200 ${
                  !isSubmitted
                    ? isSelected
                      ? "border-blue-500 bg-blue-50 shadow-md transform scale-[1.02]"
                      : "border-gray-200 hover:border-blue-300 hover:bg-blue-25 hover:shadow-sm"
                    : showCorrectAnswer
                    ? "border-green-500 bg-green-50 shadow-lg"
                    : showIncorrectAnswer
                    ? "border-red-500 bg-red-50 shadow-lg"
                    : isSelected
                    ? "border-gray-300 bg-gray-50"
                    : "border-gray-200 bg-gray-25"
                } ${isSubmitted ? "cursor-not-allowed" : "cursor-pointer"}`}
              >
                <div className="flex items-center gap-4">
                  {/* Радио кнопка с улучшенным дизайном */}
                  <div className="relative">
                    <div
                      className={`w-6 h-6 rounded-full border-2 transition-all ${
                        isSelected
                          ? showFeedback
                            ? isCorrectOption
                              ? "border-green-500 bg-green-500"
                              : "border-red-500 bg-red-500"
                            : "border-blue-500 bg-blue-500"
                          : "border-gray-400"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute inset-1 rounded-full bg-white" />
                      )}
                    </div>
                  </div>

                  <span className="text-lg font-medium flex-1">{option}</span>

                  {/* Иконки результата */}
                  {showFeedback && (
                    <div className="flex items-center gap-2">
                      {showCorrectAnswer && (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle size={22} />
                          <span className="text-sm font-medium">Дұрыс</span>
                        </div>
                      )}
                      {showIncorrectAnswer && (
                        <div className="flex items-center gap-1 text-red-600">
                          <XCircle size={22} />
                          <span className="text-sm font-medium">Қате</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </button>
            );
          })
        ) : (
          <div className="text-center p-8 bg-red-50 rounded-lg">
            <p className="text-red-600">Варианты ответов не найдены</p>
            <p className="text-sm text-gray-500 mt-2">
              Получено: {JSON.stringify(question.options)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

import { CheckCircle, Pause, Play, Volume2, XCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// ========================================
// МИНИМАЛИСТИЧНЫЙ РЕНДЕРЕР ДЛЯ AUDIOTASK
// ========================================
export const AudioTaskRenderer = ({
  question,
  currentAnswer,
  onAnswerChange,
  isSubmitted,
  showFeedback,
  isCorrect,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayedAudio, setHasPlayedAudio] = useState(false);
  const audioRef = useRef(null);

  // Воспроизведение аудио
  const handlePlayAudio = () => {
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
      setHasPlayedAudio(true);
    }
  };

  // Обработчики событий аудио
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => setIsPlaying(false);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("pause", handlePause);

    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("pause", handlePause);
    };
  }, []);

  // Сброс состояния при смене вопроса
  useEffect(() => {
    setHasPlayedAudio(false);
    setIsPlaying(false);
  }, [question.id]);

  // Выбор опции
  const handleOptionSelect = (index) => {
    if (isSubmitted) return;
    onAnswerChange(index);
  };

  return (
    <div>
      {/* Простой аудио плеер */}
      <div className="mb-8">
        <div className="bg-gray-50 rounded-xl p-6 text-center border">
          <Volume2 className="mx-auto text-gray-600 mb-3" size={28} />

          <button
            onClick={handlePlayAudio}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {isPlaying ? (
              <>
                <Pause size={18} />
                Тоқтату
              </>
            ) : (
              <>
                <Play size={18} />
                {hasPlayedAudio ? "Қайта тыңдау" : "Тыңдау"}
              </>
            )}
          </button>

          <audio ref={audioRef} src={question.audio} />
        </div>
      </div>

      {/* Вопрос */}
      <div className="mb-6">
        <h4 className="text-2xl font-semibold text-gray-800">
          {question.question}
        </h4>
      </div>

      {/* Чистые варианты ответов */}
      <div className="space-y-3 mb-6">
        {question.options?.map((option, index) => {
          const isSelected = currentAnswer === index;
          const isCorrectOption = index === question.answer;

          return (
            <button
              key={index}
              onClick={() => handleOptionSelect(index)}
              disabled={isSubmitted}
              className={`w-full text-left p-4 rounded-lg border transition-all ${
                !isSubmitted
                  ? isSelected
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  : isSelected && isCorrectOption
                  ? "border-green-500 bg-green-50"
                  : isSelected
                  ? "border-red-500 bg-red-50"
                  : "border-gray-200 bg-gray-50"
              } ${isSubmitted ? "cursor-not-allowed" : "cursor-pointer"}`}
            >
              <div className="flex items-center gap-3">
                {/* Простая радио-кнопка */}
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? "border-current" : "border-gray-400"
                  }`}
                >
                  {isSelected && (
                    <div className="w-2.5 h-2.5 rounded-full bg-current"></div>
                  )}
                </div>

                <span className="text-lg">{option}</span>

                {/* Простые иконки результата */}
                {isSubmitted && isSelected && (
                  <div className="ml-auto">
                    {isCorrectOption ? (
                      <CheckCircle className="text-green-600" size={20} />
                    ) : (
                      <XCircle className="text-red-600" size={20} />
                    )}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Простая обратная связь */}
      {showFeedback && (
        <div
          className={`p-4 rounded-lg mb-6 ${
            isCorrect
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          <div
            className={`flex items-center gap-2 font-medium ${
              isCorrect ? "text-green-800" : "text-red-800"
            }`}
          >
            {isCorrect ? (
              <>
                <span>Дұрыс! </span>
              </>
            ) : (
              <>
                <span>Қате </span>
              </>
            )}
          </div>

          {question.explanation && (
            <p
              className={`text-sm mt-2 ${
                isCorrect ? "text-green-700" : "text-red-700"
              }`}
            >
              {question.explanation}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

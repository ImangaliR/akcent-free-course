import { CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";

export const StoryTask = ({ lesson, onStepComplete, previousAnswer }) => {
  const [selectedOption, setSelectedOption] = useState(
    previousAnswer?.selectedAnswer || null
  );
  const [isSubmitted, setIsSubmitted] = useState(
    previousAnswer?.completed || false
  );
  const [showFeedback, setShowFeedback] = useState(
    previousAnswer?.completed || false
  );
  const [isCompleted, setIsCompleted] = useState(
    previousAnswer?.completed || false
  );

  const handleOptionSelect = (index) => {
    if (isSubmitted) return;
    setSelectedOption(index);
  };

  const handleSubmit = () => {
    if (selectedOption === null) return;

    setIsSubmitted(true);
    setShowFeedback(true);

    const isCorrect = selectedOption === lesson.answer;

    // Сразу завершаем без задержек
    setIsCompleted(true);
    onStepComplete?.("storytask", {
      completed: true,
      correct: isCorrect,
      selectedAnswer: selectedOption,
      correctAnswer: lesson.answer,
      attempts: 1,
    });
  };

  const handleTryAgain = () => {
    setSelectedOption(null);
    setIsSubmitted(false);
    setShowFeedback(false);
    setIsCompleted(false);
  };

  const getOptionStyle = (index) => {
    if (!isSubmitted) {
      return selectedOption === index
        ? "border-blue-500 bg-blue-50"
        : "border-gray-300 hover:border-gray-400 hover:bg-gray-50";
    }

    if (index === selectedOption) {
      if (selectedOption === lesson.answer) {
        return "border-green-500 bg-green-50";
      } else {
        return "border-red-500 bg-red-50";
      }
    }

    return "border-gray-300 bg-gray-100";
  };

  const getLocationIcon = () => {
    switch (lesson.location) {
      case "office":
        return "🏢";
      case "metro":
        return "🚇";
      case "park":
        return "🌳";
      default:
        return "📍";
    }
  };

  return (
    <div className="mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Локация и фокус */}
        {lesson.location && (
          <div className="mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="text-lg">{getLocationIcon()}</span>
              <span className="capitalize">
                {lesson.location === "office"
                  ? "Офис"
                  : lesson.location === "metro"
                  ? "Метро"
                  : lesson.location === "park"
                  ? "Парк"
                  : "Локация"}
              </span>
              {lesson.focus && (
                <span className="ml-4 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                  Фокус: {lesson.focus}
                </span>
              )}
            </div>
          </div>
        )}

        {/* История */}
        <div className="mb-8">
          <div className="bg-blue-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Оқиға</h3>
            <p className="text-blue-800 text-lg leading-relaxed">
              {lesson.story}
            </p>
            {lesson.media && (
              <div className="mt-6">
                <img
                  src={lesson.media}
                  alt="story illustration"
                  className="w-full max-w-md h-60 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Вопрос */}
        <div className="mb-6">
          <h4 className="text-xl font-semibold text-gray-800 mb-4">
            {lesson.question}
          </h4>
        </div>

        {/* Варианты ответов */}
        <div className="space-y-3 mb-6">
          {lesson.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleOptionSelect(index)}
              disabled={isSubmitted}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${getOptionStyle(
                index
              )} ${isSubmitted ? "cursor-not-allowed" : "cursor-pointer"}`}
            >
              <div className="flex items-center">
                <div
                  className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${
                    selectedOption === index
                      ? "border-current"
                      : "border-gray-400"
                  }`}
                >
                  {selectedOption === index && (
                    <div className="w-3 h-3 rounded-full bg-current" />
                  )}
                </div>
                <span className="text-lg">{option}</span>
                {isSubmitted &&
                  index === selectedOption &&
                  selectedOption === lesson.answer && (
                    <CheckCircle className="ml-auto text-green-600" size={20} />
                  )}
                {isSubmitted &&
                  index === selectedOption &&
                  selectedOption !== lesson.answer && (
                    <XCircle className="ml-auto text-red-600" size={20} />
                  )}
              </div>
            </button>
          ))}
        </div>

        {/* Обратная связь */}
        {showFeedback && (
          <div
            className={`p-4 rounded-lg mb-6 ${
              selectedOption === lesson.answer
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            <p
              className={`font-medium ${
                selectedOption === lesson.answer
                  ? "text-green-800"
                  : "text-red-800"
              }`}
            >
              {selectedOption === lesson.answer
                ? "Правильно! Отличная работа!"
                : "Неправильно. Попробуйте еще раз."}
            </p>
            {lesson.explanation && selectedOption === lesson.answer && (
              <p className="text-green-700 text-sm mt-2">
                {lesson.explanation}
              </p>
            )}
          </div>
        )}

        {/* Кнопки действий */}
        <div className="flex justify-end gap-3">
          {!isSubmitted ? (
            <button
              onClick={handleSubmit}
              disabled={selectedOption === null}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                selectedOption !== null
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Проверить ответ
            </button>
          ) : selectedOption !== lesson.answer ? (
            <button
              onClick={handleTryAgain}
              className="px-6 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors"
            >
              Попробовать снова
            </button>
          ) : (
            <div className="flex items-center text-green-600 font-medium">
              <CheckCircle size={20} className="mr-2" />
              Отлично! Задание завершено
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

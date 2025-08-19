import { CheckCircle, XCircle } from "lucide-react";

// ========================================
// РЕНДЕРЕР ДЛЯ STORYTASK
// ========================================
export const StoryTaskRenderer = ({
  question,
  currentAnswer,
  onAnswerChange,
  isSubmitted,
  showFeedback,
  isCorrect,
}) => {
  const optionThemes = [
    {
      base: "bg-blue-50 border-blue-300 hover:bg-blue-100",
      text: "text-blue-900",
      badge: "bg-blue-600 text-white",
    },
    {
      base: "bg-purple-50 border-purple-300 hover:bg-purple-100",
      text: "text-purple-900",
      badge: "bg-purple-600 text-white",
    },
    {
      base: "bg-amber-50 border-amber-300 hover:bg-amber-100",
      text: "text-amber-900",
      badge: "bg-amber-600 text-white",
    },
    {
      base: "bg-cyan-50 border-cyan-300 hover:bg-cyan-100",
      text: "text-cyan-900",
      badge: "bg-cyan-600 text-white",
    },
  ];

  const getLocationIcon = () => {
    switch (question?.location) {
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

  const getOptionCardClasses = (index) => {
    const theme = optionThemes[index % optionThemes.length];
    const isSelected = currentAnswer === index;

    if (isSubmitted) {
      const isCorrectOption = index === question.answer;
      if (isSelected && isCorrectOption)
        return "border-2 bg-green-500 text-white hover:bg-green-600";
      if (isSelected && !isCorrectOption)
        return "border-2 bg-red-500 text-white hover:bg-red-600";
      return "border-2 bg-gray-100 text-gray-700";
    }

    // ВОТ ЗДЕСЬ НУЖНО ИЗМЕНИТЬ:
    if (isSelected) {
      return `border-3 ${theme.badge.replace(
        "bg-",
        "bg-"
      )} ${theme.badge.replace(
        "bg-",
        "border-"
      )} text-white shadow-lg transform scale-[1.02]`;
    }
    return `border-2 ${theme.base} ${theme.text} hover:shadow-md`;
  };

  return (
    <div>
      {/* Локация и фокус */}
      {question.location && (
        <div className="mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="text-lg">{getLocationIcon()}</span>
            <span className="capitalize">
              {question.location === "office"
                ? "Кеңсе"
                : question.location === "metro"
                ? "Метро"
                : question.location === "park"
                ? "Саябақ"
                : "Орналасқан жері"}
            </span>
            {question.focus && (
              <span className="ml-4 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                Фокус: {question.focus}
              </span>
            )}
          </div>
        </div>
      )}

      {/* История */}
      {question.story && (
        <div className="mb-8">
          <div className="bg-blue-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Оқиға</h3>
            <p className="text-blue-800 text-lg leading-relaxed">
              {question.story}
            </p>
            {question.media && (
              <div className="mt-6">
                <img
                  src={question.media}
                  alt="story illustration"
                  className="w-full max-w-md h-60 object-cover rounded-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Вопрос */}
      <div className="mb-6 rounded-lg p-4">
        <h4 className="text-3xl font-semibold text-gray-800">
          {question.question}
        </h4>
      </div>

      {/* Варианты ответов — responsive grid как в Quizizz */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {question.options?.map((option, index) => {
          const isSelected = currentAnswer === index;
          const showIcon = isSubmitted && isSelected;
          const isCorrectOption = index === question.answer;

          return (
            <button
              key={index}
              onClick={() => onAnswerChange(index)}
              disabled={isSubmitted}
              className={`group relative text-left w-full rounded-2xl px-4 py-6 md:px-6 md:py-8 transition-all duration-200 h-full
                  ${getOptionCardClasses(index)}
                  ${
                    isSubmitted
                      ? "cursor-not-allowed"
                      : "hover:shadow-md active:scale-[0.99]"
                  }`}
              aria-pressed={isSelected}
            >
              {/* Option text */}
              <span className="align-middle text-lg md:text-lg">{option}</span>

              {/* Correct/Incorrect icon на правой стороне (только для выбранного) */}
              {showIcon && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  {isCorrectOption ? (
                    <CheckCircle
                      className="text-white md:text-green-50"
                      size={22}
                    />
                  ) : (
                    <XCircle className="text-white md:text-red-50" size={22} />
                  )}
                </div>
              )}

              {/* Focus ring для a11y */}
              <span className="absolute inset-0 rounded-2xl ring-inset ring-transparent group-focus-visible:ring-2 group-focus-visible:ring-blue-500 pointer-events-none" />
            </button>
          );
        })}
      </div>

      {/* Результат */}
      {showFeedback && (
        <div
          className={`p-4 rounded-lg mb-6 ${
            isCorrect ? "bg-green-50 border border-green-200" : ""
          }`}
        >
          <p className={`font-medium ${isCorrect ? "text-green-800" : ""}`}>
            {isCorrect ? "Дұрыс!" : ""}
          </p>
          {isCorrect && question.explanation && (
            <p className="text-green-700 text-sm mt-2">
              {question.explanation}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

import { useState, useEffect } from "react";
import { CheckCircle, RotateCcw, X } from "lucide-react";

export const ImageQuiz = ({ lesson, onStepComplete, previousAnswer }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);

  // Load previous answer if exists
  useEffect(() => {
    if (previousAnswer?.selectedOption) {
      setSelectedOption(previousAnswer.selectedOption);
      setShowResult(previousAnswer.isCompleted || false);
      setIsCompleted(previousAnswer.isCompleted || false);
      setIsCorrect(previousAnswer.isCorrect || null);
    }
  }, [previousAnswer]);

  // Auto-complete when option is selected
  useEffect(() => {
    if (selectedOption && !isCompleted) {
      const correct = selectedOption === lesson.answer;
      setIsCorrect(correct);
      setShowResult(true);
      setIsCompleted(true);

      const completionData = {
        selectedOption,
        correctAnswer: lesson.answer,
        isCorrect: correct,
        isCompleted: true,
        completedAt: new Date().toISOString(),
      };

      onStepComplete?.("imagequiz", completionData);
    }
  }, [selectedOption, lesson.answer, isCompleted, onStepComplete]);

  const handleOptionClick = (optionId) => {
    if (isCompleted) return;
    setSelectedOption(optionId);
  };

  const resetTask = () => {
    setSelectedOption(null);
    setIsCompleted(false);
    setShowResult(false);
    setIsCorrect(null);
  };

  const getOptionStyle = (optionId) => {
    if (!showResult) {
      if (selectedOption === optionId) {
        return "border-blue-500 bg-blue-50 shadow-lg transform scale-105";
      }
      return "border-gray-300 bg-white hover:border-blue-300 hover:bg-blue-50 hover:shadow-md cursor-pointer";
    } else {
      if (isCorrect) {
        // Only highlight the correct option if user got it right
        if (optionId === lesson.answer) {
          return "border-green-500 bg-green-50";
        }
        return "border-gray-300 bg-gray-50 opacity-60";
      } else {
        // User was wrong → only highlight their wrong choice
        if (selectedOption === optionId) {
          return "border-red-500 bg-red-50";
        }
        return "border-gray-300 bg-gray-50 opacity-60";
      }
    }
  };

  const getOptionIcon = (optionId) => {
    if (!showResult) return null;

    if (isCorrect && optionId === lesson.answer) {
      return <CheckCircle className="w-6 h-6 text-green-600" />;
    } else if (!isCorrect && selectedOption === optionId) {
      return <X className="w-6 h-6 text-red-600" />;
    }
    return null;
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-3">
          {lesson.title}
        </h2>
        <p className="text-gray-600 text-lg">{lesson.question}</p>
      </div>

      {/* Result feedback */}
      {showResult && (
        <div
          className={`mb-6 p-4 rounded-xl border ${
            isCorrect
              ? "border-green-200 bg-green-50"
              : "border-red-200 bg-red-50"
          }`}
        >
          <div className="flex items-center gap-3">
            {isCorrect ? (
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
            ) : (
              <X className="w-6 h-6 text-red-600 flex-shrink-0" />
            )}
            <div>
              <p
                className={`font-medium ${
                  isCorrect ? "text-green-800" : "text-red-800"
                }`}
              >
                {isCorrect ? lesson.feedback.correct : lesson.feedback.wrong}
              </p>
              {/* {!isCorrect && (
                <p className="text-sm text-gray-600 mt-1">
                  Правильный ответ:{" "}
                  {
                    lesson.options.find((opt) => opt.id === lesson.answer)
                      ?.label
                  }
                </p>
              )} */}
            </div>
          </div>
        </div>
      )}

      {/* Options grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {lesson.options.map((option) => (
          <div
            key={option.id}
            className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${getOptionStyle(
              option.id
            )} ${isCompleted ? "" : "cursor-pointer"}`}
            onClick={() => handleOptionClick(option.id)}
          >
            {/* Result icon */}
            <div className="absolute top-3 right-3 z-10">
              {getOptionIcon(option.id)}
            </div>

            {/* Image container */}
            <div className="aspect-square mb-3 bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={`/images/${option.image}`}
                alt={option.label}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback for missing images
                  e.target.style.display = "none";
                  e.target.nextElementSibling.style.display = "flex";
                }}
              />
              {/* Fallback placeholder */}
              <div
                className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm"
                style={{ display: "none" }}
              >
                {option.label}
              </div>
            </div>

            {/* Selection indicator */}
            {!showResult && selectedOption === option.id && (
              <div className="absolute inset-0 border-4 border-blue-500 rounded-xl pointer-events-none"></div>
            )}
          </div>
        ))}
      </div>

      {/* Action button */}
      {isCompleted && (
        <div className="flex justify-center">
          <button
            onClick={resetTask}
            className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
          >
            <RotateCcw className="w-4 h-4" />
            Try again
          </button>
        </div>
      )}
    </div>
  );
};

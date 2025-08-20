import { CheckCircle, X } from "lucide-react";
import { useEffect, useState } from "react";

export const ImageQuizRenderer = ({
  question,
  currentAnswer,
  onAnswerChange,
  isSubmitted,
}) => {
  const [selectedOption, setSelectedOption] = useState(null);

  // Early return if no question data
  if (!question) {
    return (
      <div className="mx-auto max-w-4xl text-center p-8">
        <p className="text-gray-600">Loading question...</p>
        <p className="text-xs text-gray-400 mt-2">
          Question prop is: {JSON.stringify(question)}
        </p>
      </div>
    );
  }

  // Load current answer on mount
  useEffect(() => {
    if (currentAnswer?.selectedOption) {
      setSelectedOption(currentAnswer.selectedOption);
    }
  }, [currentAnswer]);

  // Handle option selection
  const handleOptionClick = (optionId) => {
    if (isSubmitted || !question?.answer) return;

    setSelectedOption(optionId);

    // Update answer immediately
    const answerData = {
      selectedOption: optionId,
      correctAnswer: question.answer,
      isCorrect: optionId === question.answer,
    };

    onAnswerChange?.(answerData);
  };

  // Get styling for option based on state
  const getOptionStyle = (optionId) => {
    if (!isSubmitted) {
      if (selectedOption === optionId) {
        return "border-blue-500 bg-blue-50 shadow-lg transform scale-105";
      }
      return "border-gray-300 bg-white hover:border-blue-300 hover:bg-blue-50 hover:shadow-md cursor-pointer";
    } else {
      // Show results after submission
      const isCorrect = selectedOption === question?.answer;

      if (isCorrect) {
        // Only highlight the correct option if user got it right
        if (optionId === question?.answer) {
          return "border-green-500 bg-green-50";
        }
        return "border-gray-300 bg-gray-50 opacity-60";
      } else {
        // User was wrong - only highlight their wrong choice, don't show correct answer
        if (selectedOption === optionId) {
          return "border-red-500 bg-red-50";
        }
        return "border-gray-300 bg-gray-50 opacity-60";
      }
    }
  };

  // Get icon for option based on state
  const getOptionIcon = (optionId) => {
    if (!isSubmitted) return null;

    const isCorrect = selectedOption === question?.answer;

    if (isCorrect && optionId === question?.answer) {
      return <CheckCircle className="w-6 h-6 text-green-600" />;
    } else if (!isCorrect && selectedOption === optionId) {
      // Only show X for the wrong answer user selected, don't show correct answer
      return <X className="w-6 h-6 text-red-600" />;
    }
    return null;
  };

  // Check if user's answer is correct
  const isCorrect = selectedOption === question?.answer;

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-1">
          {question.title || "Найди правильный рисунок"}
        </h2>
        <p className="text-gray-600 md:text-lg">{question.question}</p>
        {question.description && (
          <p className="text-gray-500 text-base mt-1">{question.description}</p>
        )}
      </div>

      {/* Options grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 place-items-center ">
        {question.options?.map((option) => (
          <div
            key={option.id}
            className={`relative w-[150px] md:w-[220px] aspect-square md:p-1 rounded-lg border-2 transition-all duration-200 ${getOptionStyle(
              option.id
            )} ${isSubmitted ? "cursor-default" : "cursor-pointer"}`}
            onClick={() => handleOptionClick(option.id)}
          >
            {/* Result icon */}
            <div className="absolute top-1.5 right-1.5 z-10">
              {getOptionIcon(option.id)}
            </div>

            <div className="w-full h-full bg-[#FEF9F2] rounded overflow-hidden">
              <img
                src={option.image}
                alt={option.label || `Option ${option.id}`}
                className="w-full h-full object-contain p-1.5"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextElementSibling.style.display = "flex";
                }}
              />
              <div
                className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs"
                style={{ display: "none" }}
              >
                {option.label || `Option ${option.id}`}
              </div>
            </div>

            {!isSubmitted && selectedOption === option.id && (
              <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export const WarmupQuestionRenderer = ({
  question,
  onAnswer,
  selectedIndex,
  isSubmitted,
}) => {
  return (
    <div className="bg-white rounded-2xl p-6  pt-8 md:pt-0 shadow-md text-center">
      <h3 className="text-xl font-semibold text-gray-800 mb-6 transform transition-all duration-500">
        {question.question}
      </h3>

      <div className="grid grid-cols-1 gap-3">
        {question.options.map((option, idx) => {
          const isSelected = selectedIndex === idx;
          const isCorrect = isSubmitted && idx === question.correctIndex;
          const isWrong =
            isSubmitted && isSelected && idx !== question.correctIndex;

          return (
            <button
              key={idx}
              disabled={isSubmitted}
              onClick={() => onAnswer(idx)}
              className={`px-4 py-3 rounded-lg border transition-all duration-300 transform relative overflow-hidden
                ${
                  isCorrect
                    ? "bg-green-500 text-white border-green-500 animate-pulse"
                    : isWrong
                    ? "bg-red-500 text-white border-red-500 animate-bounce"
                    : isSelected
                    ? "bg-[#9C45FF] text-white border-[#9C45FF] scale-105"
                    : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                }
                ${
                  isSubmitted
                    ? "cursor-not-allowed"
                    : "hover:shadow-md hover:scale-105"
                }
                ${!isSubmitted ? "hover:-translate-y-1" : ""}
              `}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
};

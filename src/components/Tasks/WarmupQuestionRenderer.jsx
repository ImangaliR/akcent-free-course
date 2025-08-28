export const WarmupQuestionRenderer = ({
  question,
  onAnswer,
  selectedIndex,
  isSubmitted,
}) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-md text-center">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        {question.question}
      </h3>
      <div className="grid grid-cols-1 gap-3">
        {question.options.map((option, idx) => (
          <button
            key={idx}
            disabled={isSubmitted}
            onClick={() => onAnswer(idx)}
            className={`px-4 py-3 rounded-lg border transition-colors
              ${
                selectedIndex === idx
                  ? "bg-[#9C45FF] text-white border-[#9C45FF]"
                  : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
              }
              ${isSubmitted ? "cursor-not-allowed opacity-70" : ""}
            `}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

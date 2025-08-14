export const MultipleChoiceQuestion = ({ answers, handleAnswerChange }) => (
  <div className="w-full mx-auto px-0">
    <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-100">
        <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-800">
          Вопрос 2
        </h3>
        <p className="text-sm sm:text-base text-gray-600">
          Which of the following are informal greetings?
        </p>
      </div>

      {/* Options */}
      <div className="p-4 sm:p-6">
        <div className="space-y-3 sm:space-y-4">
          {["Привет", "Добрый день", "Здравствуй", "До свидания"].map(
            (option, index) => (
              <label
                key={index}
                className={`flex items-center p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md active:scale-[0.98] ${
                  answers.multipleChoice.includes(
                    String.fromCharCode(97 + index)
                  )
                    ? "bg-indigo-50 border-indigo-400 shadow-sm"
                    : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
                }`}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={answers.multipleChoice.includes(
                    String.fromCharCode(97 + index)
                  )}
                  onChange={() =>
                    handleAnswerChange(
                      "multipleChoice",
                      String.fromCharCode(97 + index)
                    )
                  }
                />

                {/* Custom Checkbox */}
                <div
                  className={`w-5 h-5 sm:w-6 sm:h-6 rounded border-2 flex items-center justify-center transition-colors ${
                    answers.multipleChoice.includes(
                      String.fromCharCode(97 + index)
                    )
                      ? "border-blue-500 bg-blue-500"
                      : "border-gray-300"
                  }`}
                >
                  {answers.multipleChoice.includes(
                    String.fromCharCode(97 + index)
                  ) && (
                    <svg
                      className="w-3 h-3 sm:w-4 sm:h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>

                <span
                  className={`ml-3 sm:ml-4 text-base sm:text-lg transition-colors ${
                    answers.multipleChoice.includes(
                      String.fromCharCode(97 + index)
                    )
                      ? "text-blue-700 font-medium"
                      : "text-gray-700"
                  }`}
                >
                  {option}
                </span>
              </label>
            )
          )}
        </div>
      </div>
    </div>
  </div>
);

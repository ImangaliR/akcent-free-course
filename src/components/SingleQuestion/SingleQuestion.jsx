export const SingleChoiceQuestion = ({ answers, handleAnswerChange }) => (
  <div className="w-full mx-auto px-0">
    <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-100">
        <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-800">
          Вопрос 1
        </h3>
        <p className="text-sm sm:text-base text-gray-600">
          Based on the video, how do you formally say "Hello"?
        </p>
      </div>

      {/* Options */}
      <div className="p-4 sm:p-6">
        <div className="space-y-3 sm:space-y-4">
          {["Привет", "Здравствуйте", "Пока", "Как дела?"].map(
            (option, index) => (
              <label
                key={index}
                className={`flex items-center p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md active:scale-[0.98] ${
                  answers.singleChoice === String.fromCharCode(97 + index)
                    ? "bg-indigo-50 border-indigo-400 shadow-sm"
                    : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name="single-choice"
                  className="sr-only"
                  checked={
                    answers.singleChoice === String.fromCharCode(97 + index)
                  }
                  onChange={() =>
                    handleAnswerChange(
                      "singleChoice",
                      String.fromCharCode(97 + index)
                    )
                  }
                />

                {/* Custom Radio */}
                <div
                  className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    answers.singleChoice === String.fromCharCode(97 + index)
                      ? "border-blue-500 bg-blue-500"
                      : "border-gray-300"
                  }`}
                >
                  {answers.singleChoice === String.fromCharCode(97 + index) && (
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-white" />
                  )}
                </div>

                <span
                  className={`ml-3 sm:ml-4 text-base sm:text-lg transition-colors ${
                    answers.singleChoice === String.fromCharCode(97 + index)
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

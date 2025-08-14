export const MultipleChoiceQuestion = ({ answers, handleAnswerChange }) => (
  <div>
    <h3 className="text-xl font-semibold mb-1 text-gray-800">
      Вопрос 2 (Question 2)
    </h3>
    <p className="text-gray-600 mb-6">
      Which of the following are informal greetings? (Select all that apply)
    </p>
    <div className="space-y-4">
      {["Привет", "Добрый день", "Здравствуй", "До свидания"].map(
        (option, index) => (
          <label
            key={index}
            className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
              answers.multipleChoice.includes(String.fromCharCode(97 + index))
                ? "bg-indigo-100 border-indigo-400"
                : "border-gray-300 hover:border-indigo-300"
            }`}
          >
            <input
              type="checkbox"
              className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 rounded"
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
            <span className="ml-4 text-lg text-gray-700">{option}</span>
          </label>
        )
      )}
    </div>
  </div>
);

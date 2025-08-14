export const SingleChoiceQuestion = ({ answers, handleAnswerChange }) => (
  <div>
    <h3 className="text-xl font-semibold mb-1 text-gray-800">
      Вопрос 1 (Question 1)
    </h3>
    <p className="text-gray-600 mb-6">
      Based on the video, how do you formally say "Hello"?
    </p>
    <div className="space-y-4">
      {["Привет", "Здравствуйте", "Пока", "Как дела?"].map((option, index) => (
        <label
          key={index}
          className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
            answers.singleChoice === String.fromCharCode(97 + index)
              ? "bg-indigo-100 border-indigo-400"
              : "border-gray-300 hover:border-indigo-300"
          }`}
        >
          <input
            type="radio"
            name="single-choice"
            className="h-5 w-5 text-indigo-600 focus:ring-indigo-500"
            checked={answers.singleChoice === String.fromCharCode(97 + index)}
            onChange={() =>
              handleAnswerChange(
                "singleChoice",
                String.fromCharCode(97 + index)
              )
            }
          />
          <span className="ml-4 text-lg text-gray-700">{option}</span>
        </label>
      ))}
    </div>
  </div>
);

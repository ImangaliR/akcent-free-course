export const FillInTheBlankQuestion = ({ answers, handleAnswerChange }) => (
  <div>
    <h3 className="text-xl font-semibold mb-1 text-gray-800">
      Грамматика (Grammar)
    </h3>
    <p className="text-gray-600 mb-6">
      Fill in the blank. The word for "good" or "well" is...
    </p>
    <div className="flex items-center text-lg">
      <span className="mr-2">У меня всё</span>
      <input
        type="text"
        className="w-40 px-3 py-2 border-b-2 border-gray-300 focus:border-indigo-500 focus:outline-none transition"
        placeholder="_______"
        value={answers.fillInTheBlank}
        onChange={(e) => handleAnswerChange("fillInTheBlank", e.target.value)}
      />
      <span className="ml-2">.</span>
    </div>
  </div>
);

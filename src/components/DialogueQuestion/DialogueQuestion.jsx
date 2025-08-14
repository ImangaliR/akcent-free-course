export const DialogueQuestion = ({ answers, handleAnswerChange }) => (
  <div>
    <h3 className="text-xl font-semibold mb-1 text-gray-800">
      Диалог (Dialogue)
    </h3>
    <p className="text-gray-600 mb-6">
      Complete the dialogue using the words you've learned.
    </p>
    <div className="space-y-6 text-lg">
      <div className="flex items-center">
        <span className="w-24 font-semibold text-gray-700">Анна:</span>
        <input
          type="text"
          name="blank1"
          value={answers.dialogue.blank1}
          onChange={(e) =>
            handleAnswerChange("dialogue", {
              name: e.target.name,
              val: e.target.value,
            })
          }
          className="w-32 mx-2 px-2 py-1 border-b-2 border-gray-300 focus:border-indigo-500 focus:outline-none"
        />
        <span>, Иван!</span>
      </div>
      <div className="flex items-center">
        <span className="w-24 font-semibold text-gray-700">Иван:</span>
        <span>Привет, Анна! Как </span>
        <input
          type="text"
          name="blank2"
          value={answers.dialogue.blank2}
          onChange={(e) =>
            handleAnswerChange("dialogue", {
              name: e.target.name,
              val: e.target.value,
            })
          }
          className="w-32 mx-2 px-2 py-1 border-b-2 border-gray-300 focus:border-indigo-500 focus:outline-none"
        />
        <span>?</span>
      </div>
      <div className="flex items-center">
        <span className="w-24 font-semibold text-gray-700">Анна:</span>
        <input
          type="text"
          name="blank3"
          value={answers.dialogue.blank3}
          onChange={(e) =>
            handleAnswerChange("dialogue", {
              name: e.target.name,
              val: e.target.value,
            })
          }
          className="w-32 mx-2 px-2 py-1 border-b-2 border-gray-300 focus:border-indigo-500 focus:outline-none"
        />
        <span>, хорошо. А у тебя?</span>
      </div>
    </div>
  </div>
);

// src/components/MultiBlankStoryTask.jsx
import { useMemo, useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";

/**
 * Props:
 * - lesson: {
 *     id, type: "storytask-blanks",
 *     title, story, question, media?,
 *     blanks: [{ id, options, answer, feedback }]
 *   }
 * - onStepComplete?: (type, payload) => void   // совместимо с вашим колбэком
 */
export default function MultiBlankStoryTask({ lesson, onStepComplete }) {
  const [choices, setChoices] = useState(
    lesson.blanks.map(() => null) // индекс выбранного варианта для каждого пропуска
  );
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const blankIndexById = useMemo(() => {
    const m = new Map();
    lesson.blanks.forEach((b, i) => m.set(b.id, i));
    return m;
  }, [lesson.blanks]);

  // Разбиваем story на части: текст и плейсхолдеры {{blankX}}
  const storyTokens = useMemo(() => {
    const re = /(\{\{(.*?)\}\})/g;
    const tokens = [];
    let last = 0;
    let match;
    while ((match = re.exec(lesson.story)) !== null) {
      if (match.index > last) {
        tokens.push({
          type: "text",
          value: lesson.story.slice(last, match.index),
        });
      }
      tokens.push({ type: "blank", id: match[2].trim() });
      last = re.lastIndex;
    }
    if (last < lesson.story.length) {
      tokens.push({ type: "text", value: lesson.story.slice(last) });
    }
    return tokens;
  }, [lesson.story]);

  const allChosen = choices.every((c) => c !== null);
  const allCorrect = choices.every(
    (c, i) => c !== null && c === lesson.blanks[i].answer
  );

  const handleSubmit = () => {
    if (!allChosen) return;
    setIsSubmitted(true);

    const payload = {
      completed: true,
      correct: allCorrect,
      selectedAnswers: choices,
      correctAnswers: lesson.blanks.map((b) => b.answer),
      attempts: 1,
    };

    if (allCorrect) {
      setTimeout(() => {
        setIsCompleted(true);
        onStepComplete?.("storytask-blanks", payload);
      }, 1500);
    } else {
      setTimeout(() => {
        setIsCompleted(true);
      }, 1000);
    }
  };

  const handleTryAgain = () => {
    setChoices(lesson.blanks.map(() => null));
    setIsSubmitted(false);
    setIsCompleted(false);
  };

  return (
    <div className="mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Story */}
        <div className="mb-8">
          <div className="bg-blue-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Оқиға</h3>
            <p className="text-blue-800 text-lg leading-relaxed whitespace-pre-wrap">
              {storyTokens.map((t, i) => {
                if (t.type === "text") return <span key={i}>{t.value}</span>;
                const idx = blankIndexById.get(t.id);
                const selected = choices[idx];
                const correct =
                  isSubmitted && selected === lesson.blanks[idx].answer;
                const wrong =
                  isSubmitted &&
                  selected !== null &&
                  selected !== lesson.blanks[idx].answer;

                return (
                  <span key={i} className="inline-block align-middle mx-2">
                    <select
                      className={[
                        "border-2 rounded-lg px-3 py-1.5 bg-white min-w-[9rem] transition",
                        !isSubmitted && selected === null
                          ? "border-gray-300"
                          : "",
                        !isSubmitted && selected !== null
                          ? "border-blue-500 bg-blue-50"
                          : "",
                        correct ? "border-green-500 bg-green-50" : "",
                        wrong ? "border-red-500 bg-red-50" : "",
                      ].join(" ")}
                      value={selected ?? ""}
                      disabled={isSubmitted}
                      onChange={(e) => {
                        const val =
                          e.target.value === "" ? null : Number(e.target.value);
                        const next = [...choices];
                        next[idx] = val;
                        setChoices(next);
                      }}
                    >
                      <option value="">— выберите —</option>
                      {lesson.blanks[idx].options.map((opt, o) => (
                        <option key={o} value={o}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </span>
                );
              })}
            </p>

            {/* {lesson.media && (
              <div className="mt-6">
                <img src={lesson.media} alt="question" className="w-90 h-60" />
              </div>
            )} */}
          </div>
        </div>

        {/* Question */}
        <div className="mb-6">
          <h4 className="text-xl font-semibold text-gray-800 mb-4">
            {lesson.question}
          </h4>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          {!isSubmitted ? (
            <button
              onClick={handleSubmit}
              disabled={!allChosen}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                allChosen
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Проверить ответ
            </button>
          ) : !isCompleted ? (
            <div className="flex items-center text-blue-600">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
              Проверяем...
            </div>
          ) : !allCorrect ? (
            <button
              onClick={handleTryAgain}
              className="px-6 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors"
            >
              Попробовать снова
            </button>
          ) : (
            <div className="flex items-center text-green-600 font-medium">
              <CheckCircle size={20} className="mr-2" />
              Отлично!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

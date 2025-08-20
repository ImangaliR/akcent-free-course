import { Award, CheckCircle, RotateCcw, Target } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useQuizLogic } from "../../utils/useQuizLogic";

export const UniversalQuiz = ({
  lesson,
  onStepComplete,
  taskType,
  TaskRenderer,
  autoAdvanceMs = 1000,
}) => {
  // Поддерживаем и старый формат и новый
  const allQuestions = lesson.questions || [lesson];

  const quiz = useQuizLogic(allQuestions, onStepComplete, taskType);

  // ---- auto-advance timer ----
  const [autoAdvanceLeftMs, setAutoAdvanceLeftMs] = useState(null);
  const tickRef = useRef(null);

  const clearAutoAdvance = () => {
    if (tickRef.current) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
    setAutoAdvanceLeftMs(null);
  };

  // Запускаем автопродвижение после отправки ответа
  useEffect(() => {
    if (quiz.state.submitted && autoAdvanceMs && autoAdvanceMs > 0) {
      clearAutoAdvance();
      setAutoAdvanceLeftMs(autoAdvanceMs);
      const startedAt = performance.now();
      tickRef.current = window.setInterval(() => {
        const elapsed = performance.now() - startedAt;
        const left = Math.max(0, autoAdvanceMs - Math.floor(elapsed));
        setAutoAdvanceLeftMs(left);
        if (left <= 0) {
          clearAutoAdvance();
          quiz.nextQuestion(); // автоматический переход
        }
      }, 100);
    }
    return () => clearAutoAdvance();
  }, [quiz.state.submitted, autoAdvanceMs]);

  // Очищаем таймер при размонтировании
  useEffect(() => () => clearAutoAdvance(), []);

  // Экран завершения
  if (quiz.state.phase === "done") {
    return (
      <div className="mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 text-center">
          <div className="mb-6">
            {quiz.stats.passed ? (
              <Award className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            ) : (
              <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            )}
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              {quiz.stats.passed ? "Поздравляем!" : "Тест не пройден"}
            </h3>
            <p className="text-gray-600">
              {quiz.stats.passed
                ? `Вы успешно прошли тест с результатом ${quiz.stats.percent}%`
                : `Результат: ${quiz.stats.percent}%. Требуется: 80%`}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 md:p-6 mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium text-gray-700">Негізгі айналым</div>
                <div className="text-xl font-bold text-blue-600">
                  {quiz.stats.mainCorrect}/{allQuestions.length}
                </div>
              </div>
              {quiz.stats.redemptionCorrect > 0 && (
                <div>
                  <div className="font-medium text-gray-700">Redemption</div>
                  <div className="text-xl font-bold text-green-600">
                    +{quiz.stats.redemptionCorrect}
                  </div>
                </div>
              )}
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="font-medium text-gray-700">Барлығы</div>
              <div className="text-2xl font-bold text-gray-800">
                {quiz.stats.total}/{allQuestions.length}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center text-green-600 font-medium">
            <CheckCircle size={20} className="mr-2" />
            Тапсырма аяқталды
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto">
      <div className="bg-white rounded-lg px-3 md:px-6 py-1">
        {/* Прогресс и статистика */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs md:text-sm text-gray-600">
              {quiz.state.phase === "main" ? (
                <span>Негізгі айналым: {quiz.stats.progress}</span>
              ) : (
                <div className="flex items-center gap-2">
                  <RotateCcw size={16} className="text-orange-500" />
                  <span>Өтеу: {quiz.stats.progress}</span>
                </div>
              )}
            </div>
            <div className="text-xs md:text-sm font-medium">
              Дұрыс: {quiz.stats.total}/{allQuestions.length}
              <span className="text-gray-500 ml-2">
                (керек: {quiz.stats.needed})
              </span>
            </div>
          </div>

          {/* Прогресс бар */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                quiz.stats.passed ? "bg-green-500" : "bg-blue-500"
              }`}
              style={{
                width: `${Math.min(
                  100,
                  (quiz.stats.total / quiz.stats.needed) * 100
                )}%`,
              }}
            />
          </div>
        </div>

        {/* Рендер задания */}
        <div className="mb-6">
          <TaskRenderer
            question={quiz.currentQuestion}
            currentAnswer={quiz.state.currentAnswer}
            onAnswerChange={quiz.setAnswer}
            isSubmitted={quiz.state.submitted}
            showFeedback={quiz.state.showResult}
            isCorrect={
              quiz.state.showResult && quiz.isAnswerCorrect
                ? quiz.isAnswerCorrect(
                    quiz.state.currentAnswer,
                    quiz.currentQuestion
                  )
                : null
            }
            taskType={taskType}
          />
        </div>

        {/* Кнопки */}
        <div className="flex justify-center gap-3 text-sm md:text-base">
          {!quiz.state.submitted ? (
            <button
              onClick={quiz.submitAnswer}
              disabled={!quiz.isAnswerReady(quiz.state.currentAnswer)}
              className={`px-4 md:px-6 py-3 rounded-lg font-medium transition-colors ${
                quiz.isAnswerReady(quiz.state.currentAnswer)
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Жауапты тексеріңіз
            </button>
          ) : (
            <button
              onClick={() => {
                clearAutoAdvance();
                quiz.nextQuestion();
              }}
              className="relative overflow-hidden flex items-center px-3 md:px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              {/* background progress filler */}
              {autoAdvanceLeftMs !== null && (
                <div
                  className="absolute left-0 top-0 h-full bg-blue-600 transition-all"
                  style={{
                    width: `${
                      100 - (autoAdvanceLeftMs / autoAdvanceMs) * 100
                    }%`,
                  }}
                />
              )}

              {/* button label (on top of filler) */}
              <span className="relative z-10">
                {quiz.state.phase === "main"
                  ? quiz.state.currentIndex < allQuestions.length - 1
                    ? "Келесі сұрақ"
                    : "Негізгі айналымды аяқтау"
                  : quiz.isAnswerCorrect &&
                    quiz.isAnswerCorrect(
                      quiz.state.currentAnswer,
                      quiz.currentQuestion
                    )
                  ? quiz.state.redemptionIndex <
                    quiz.state.wrongQuestions.length - 1
                    ? "Келесі сұрақ"
                    : "Тестті аяқтау"
                  : "Попробовать снова"}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

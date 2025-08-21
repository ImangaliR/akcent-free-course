import Lottie from "lottie-react";
import { RotateCcw, Target } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import successAnim from "../../assets/congrats.json";
// import ClapAudio from "../../assets/sound.mp3";
import { useQuizLogic } from "../../utils/useQuizLogic";

export const UniversalQuiz = ({
  lesson,
  onStepComplete,
  taskType,
  TaskRenderer,
  autoAdvanceMs = 3000,
}) => {
  // Поддерживаем и старый формат и новый
  const allQuestions = lesson.questions || [lesson];
  const quizId = lesson.id || `${taskType}_${allQuestions.length}`;

  const quiz = useQuizLogic(allQuestions, onStepComplete, taskType, quizId);

  // ---- auto-advance timer ----
  const [autoAdvanceLeftMs, setAutoAdvanceLeftMs] = useState(null);
  const tickRef = useRef(null);

  // useEffect(() => {
  //   if (quiz.stats.passed) {
  //     const audio = new Audio(ClapAudio); // путь к звуку
  //     audio.play();
  //   }
  // }, [quiz.stats.passed]);

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
        <div className="bg-white rounded-2xl p-4 md:p-4 text-center">
          <div className="mb-0">
            {quiz.stats.passed ? (
              <Lottie
                animationData={successAnim}
                loop={true}
                className="w-72 h-72 mx-auto "
              />
            ) : (
              <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            )}
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              {quiz.stats.passed ? "Құттықтаймыз!" : "Тест өтілмеді"}
            </h3>
            <p className="text-gray-600">
              {quiz.stats.passed
                ? `Сіз ${quiz.stats.percent}% нәтижемен тапсырмалардан сәтті өттіңіз`
                : `Нәтиже: ${quiz.stats.percent}%. Керек: 80%`}
            </p>
          </div>

          <div className=" rounded-lg p-4 md:p-6 mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium text-gray-700">Негізгі айналым</div>
                <div className="text-xl font-bold text-[#9C45FF]">
                  {quiz.stats.mainCorrect}/{allQuestions.length}
                </div>
              </div>
              {quiz.stats.redemptionCorrect >= 0 && (
                <div>
                  <div className="font-medium text-gray-700">Қатені түзеу</div>
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
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto pt-8 pb-3 md:py-0">
      <div className="bg-white rounded-2xl px-3 py-2 md:px-6 md:py-4">
        {/* Прогресс и статистика */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs md:text-sm text-gray-600">
              {quiz.state.phase === "main" ? (
                <span> {quiz.stats.progress}</span>
              ) : (
                <div className="flex items-center gap-2">
                  <RotateCcw size={16} className="text-orange-500" />
                  <span>{quiz.stats.progress}</span>
                </div>
              )}
            </div>
          </div>

          {/* Прогресс бар */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                quiz.stats.passed
                  ? "bg-green-500"
                  : "bg-gradient-to-r from-blue-500 to-indigo-500"
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
                  ? "bg-[#9C45FF] text-white hover:bg-[#7E2AD9]"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Тексеру
            </button>
          ) : (
            <button
              onClick={() => {
                clearAutoAdvance();
                quiz.nextQuestion();
              }}
              className="relative overflow-hidden flex items-center px-3 md:px-6 py-3 bg-[#9C45FF] hover:bg-[#7E2AD9] text-white rounded-lg font-medium transition-colors"
            >
              {/* background progress filler */}
              {autoAdvanceLeftMs !== null && (
                <div
                  className="absolute left-0 top-0 h-full bg-[#7E2AD9] transition-all"
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

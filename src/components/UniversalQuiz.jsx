import Lottie from "lottie-react";
import { RotateCcw, Target } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import successAnim from "../assets/Businessman flies up with rocket (1).json";
import { useCourse } from "../context/CourseContext";
import { useAudioFeedback } from "../hooks/useAudioFeedback";
import { useQuizLogic } from "../utils/useQuizLogic";
import { ContinuousChatGame } from "./ContinuousChatGame";

export const UniversalQuiz = ({
  lesson,
  onStepComplete,
  taskType,
  TaskRenderer,
  autoAdvanceMs = 2000,
}) => {
  const { getProgressPercentage } = useCourse();
  const progress = getProgressPercentage();

  // Audio feedback hook
  const { playCorrectSound, playWrongSound, playCourseCompleteSound, cleanup } =
    useAudioFeedback();

  const allQuestions = lesson.dialogs || lesson.questions || [lesson];
  const quizId = lesson.id || `${taskType}_${allQuestions.length}`;
  const [apiCallCompleted, setApiCallCompleted] = useState(false);
  const hasCalledApi = useRef(false);

  const quiz = useQuizLogic(allQuestions, onStepComplete, taskType, quizId);

  // Track previous result state to detect changes
  const previousResultRef = useRef(null);

  // auto-advance timer
  const [autoAdvanceLeftMs, setAutoAdvanceLeftMs] = useState(null);
  const tickRef = useRef(null);

  const clearAutoAdvance = () => {
    if (tickRef.current) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
    setAutoAdvanceLeftMs(null);
  };

  // Play audio feedback when answer is submitted and result is shown
  useEffect(() => {
    if (quiz.state.showResult && quiz.state.submitted) {
      const currentIsCorrect =
        quiz.isAnswerCorrect &&
        quiz.isAnswerCorrect(quiz.state.currentAnswer, quiz.currentQuestion);

      // Only play sound if this is a new result (prevent duplicate sounds)
      if (previousResultRef.current !== currentIsCorrect) {
        if (currentIsCorrect) {
          playCorrectSound();
        } else {
          playWrongSound();
        }
        previousResultRef.current = currentIsCorrect;
      }
    }
  }, [
    quiz.state.showResult,
    quiz.state.submitted,
    quiz.state.currentAnswer,
    playCorrectSound,
    playWrongSound,
  ]);

  // Reset previous result when moving to next question
  useEffect(() => {
    if (!quiz.state.showResult) {
      previousResultRef.current = null;
    }
  }, [quiz.state.showResult]);

  // Auto-advance timer
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
          quiz.nextQuestion();
        }
      }, 100);
    }
    return () => clearAutoAdvance();
  }, [quiz.state.submitted, autoAdvanceMs]);

  useEffect(() => {
    if (quiz.state.phase === "done" && !hasCalledApi.current) {
      // Play completion audio if quiz was passed
      if (quiz.stats.passed) {
        setTimeout(() => {
          playCourseCompleteSound();
        }, 300); // Delay to allow Lottie animation to start
      }

      onStepComplete(taskType, {
        phase: "completed",
        stats: quiz.stats,
        finalResults: true,
      });
      hasCalledApi.current = true;
    }
  }, [
    quiz.state.phase,
    onStepComplete,
    taskType,
    quiz.stats,
    playCourseCompleteSound,
  ]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      clearAutoAdvance();
      cleanup();
    };
  }, [cleanup]);

  // Completion screen
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
            <h3 className="text-2xl font-bold text-gray-800 mb-2  mt-[-40px]">
              {quiz.stats.passed ? "Құттықтаймыз!" : "Тест өтілмеді"}
            </h3>
            <p className="text-gray-600">
              {progress < 30 &&
                "🔥 Бастама жасалды! Әлі алда көп қызық күтіп тұр 🚀"}
              {progress >= 30 &&
                progress < 60 &&
                "💪 Жарайсың! Сен жолдың жартысынан астың!"}
              {progress >= 60 &&
                progress < 90 &&
                "🌟 Керемет! Мақсатқа жақындап қалдың!"}
              {progress >= 90 &&
                progress < 100 &&
                "⚡ Сәл қалды! Сен соңғы қадамдасың!"}
              {progress === 100 && "🎉 Тамаша! Сен курсты толығымен аяқтадың!"}
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
        {/* Progress and statistics */}
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

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                quiz.stats.passed
                  ? "bg-gradient-to-r from-blue-500 to-indigo-500"
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

        {/* Task renderer */}
        <div className="mb-6">
          {taskType === "chatgame" ? (
            <ContinuousChatGame
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
          ) : (
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
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-3 text-sm md:text-base">
          {!quiz.state.submitted ? (
            <button
              onClick={quiz.submitAnswer}
              disabled={!quiz.isAnswerReady(quiz.state.currentAnswer)}
              className={`px-4 md:px-6 py-3 rounded-lg font-medium cursor-pointer transition-colors ${
                quiz.isAnswerReady(quiz.state.currentAnswer)
                  ? "bg-[#9C45FF] text-white hover:bg-[#7E2AD9]"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {taskType === "chatgame" ? "Жіберу" : "Тексеру"}
            </button>
          ) : (
            taskType !== "chatgame" && (
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
                <span className="relative z-10 cursor-pointer">
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
            )
          )}
        </div>
      </div>
    </div>
  );
};

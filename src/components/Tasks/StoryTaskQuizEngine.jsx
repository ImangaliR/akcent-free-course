import { Award, CheckCircle, RotateCcw, Target, XCircle } from "lucide-react";
import { useState } from "react";

export const StoryTaskQuizEngine = ({
  lesson,
  onStepComplete,
  previousAnswer,
}) => {
  const questions = lesson.questions || [];
  const minimumPassRate = 0.8;
  const requiredCorrect = Math.ceil(questions.length * minimumPassRate);

  const [gameState, setGameState] = useState({
    phase: "main", // 'main' | 'redemption' | 'completed'
    currentQuestionIndex: 0,
    mainRoundAnswers: [], // [{ questionId, isCorrect, selectedOption, question }]
    incorrectQuestions: [], // вопросы для redemption
    redemptionAnswers: [], // ответы в redemption раунде
    currentRedemptionIndex: 0,
    showFeedback: false,
    lastAnswerCorrect: null,
    selectedOption: null,
    isSubmitted: false,
  });

  // Текущий вопрос
  const getCurrentQuestion = () => {
    if (gameState.phase === "main") {
      return questions[gameState.currentQuestionIndex];
    } else if (gameState.phase === "redemption") {
      return gameState.incorrectQuestions[gameState.currentRedemptionIndex];
    }
    return null;
  };

  const currentQuestion = getCurrentQuestion();

  // Статистика
  const getStats = () => {
    const mainCorrect = gameState.mainRoundAnswers.filter(
      (a) => a.isCorrect
    ).length;
    const redemptionCorrect = gameState.redemptionAnswers.filter(
      (a) => a.isCorrect
    ).length;
    const totalCorrect = mainCorrect + redemptionCorrect;
    const totalAnswered =
      gameState.mainRoundAnswers.length + gameState.redemptionAnswers.length;

    return {
      mainCorrect,
      redemptionCorrect,
      totalCorrect,
      totalAnswered,
      mainRoundProgress: `${gameState.currentQuestionIndex}/${questions.length}`,
      redemptionProgress:
        gameState.phase === "redemption"
          ? `${gameState.currentRedemptionIndex}/${gameState.incorrectQuestions.length}`
          : null,
      passRate: totalAnswered > 0 ? (totalCorrect / questions.length) * 100 : 0,
      passed: totalCorrect >= requiredCorrect,
    };
  };

  const stats = getStats();

  // Обработка выбора варианта
  const handleOptionSelect = (index) => {
    if (gameState.isSubmitted) return;
    setGameState((prev) => ({ ...prev, selectedOption: index }));
  };

  // Отправка ответа
  const handleSubmit = () => {
    if (gameState.selectedOption === null || !currentQuestion) return;

    const isCorrect = gameState.selectedOption === currentQuestion.answer;

    setGameState((prev) => ({
      ...prev,
      isSubmitted: true,
      showFeedback: true,
      lastAnswerCorrect: isCorrect,
    }));

    // Добавляем ответ в соответствующий массив
    if (gameState.phase === "main") {
      setGameState((prev) => ({
        ...prev,
        mainRoundAnswers: [
          ...prev.mainRoundAnswers,
          {
            questionId: currentQuestion.id || gameState.currentQuestionIndex,
            isCorrect,
            selectedOption: gameState.selectedOption,
            question: currentQuestion,
          },
        ],
      }));
    } else if (gameState.phase === "redemption") {
      setGameState((prev) => ({
        ...prev,
        redemptionAnswers: [
          ...prev.redemptionAnswers,
          {
            questionId: currentQuestion.id || gameState.currentRedemptionIndex,
            isCorrect,
            selectedOption: gameState.selectedOption,
            question: currentQuestion,
          },
        ],
      }));
    }
  };

  // Переход к следующему вопросу
  const handleNext = () => {
    if (gameState.phase === "main") {
      if (gameState.currentQuestionIndex < questions.length - 1) {
        // Следующий вопрос в основном раунде
        setGameState((prev) => ({
          ...prev,
          currentQuestionIndex: prev.currentQuestionIndex + 1,
          selectedOption: null,
          isSubmitted: false,
          showFeedback: false,
          lastAnswerCorrect: null,
        }));
      } else {
        // Основной раунд завершен, проверяем результат
        checkMainRoundComplete();
      }
    } else if (gameState.phase === "redemption") {
      const currentAnswer =
        gameState.redemptionAnswers[gameState.redemptionAnswers.length - 1];

      if (!currentAnswer.isCorrect) {
        // Неправильный ответ в redemption - показываем тот же вопрос заново
        setGameState((prev) => ({
          ...prev,
          selectedOption: null,
          isSubmitted: false,
          showFeedback: false,
          lastAnswerCorrect: null,
          // Удаляем последний неправильный ответ
          redemptionAnswers: prev.redemptionAnswers.slice(0, -1),
        }));
      } else {
        // Правильный ответ - переходим к следующему вопросу redemption
        if (
          gameState.currentRedemptionIndex <
          gameState.incorrectQuestions.length - 1
        ) {
          setGameState((prev) => ({
            ...prev,
            currentRedemptionIndex: prev.currentRedemptionIndex + 1,
            selectedOption: null,
            isSubmitted: false,
            showFeedback: false,
            lastAnswerCorrect: null,
          }));
        } else {
          // Redemption завершен
          completeQuiz();
        }
      }
    }
  };

  // Проверка завершения основного раунда
  const checkMainRoundComplete = () => {
    const correctCount = gameState.mainRoundAnswers.filter(
      (a) => a.isCorrect
    ).length;

    if (correctCount >= requiredCorrect) {
      // Прошел основной раунд
      completeQuiz();
    } else {
      // Нужен redemption раунд
      const incorrectQuestions = gameState.mainRoundAnswers
        .filter((a) => !a.isCorrect)
        .map((a) => a.question);

      setGameState((prev) => ({
        ...prev,
        phase: "redemption",
        incorrectQuestions,
        currentRedemptionIndex: 0,
        selectedOption: null,
        isSubmitted: false,
        showFeedback: false,
        lastAnswerCorrect: null,
      }));
    }
  };

  // Завершение квиза
  const completeQuiz = () => {
    const finalStats = getStats();

    setGameState((prev) => ({ ...prev, phase: "completed" }));

    onStepComplete?.("storytask", {
      completed: true,
      passed: finalStats.passed,
      mainRoundAnswers: gameState.mainRoundAnswers,
      redemptionAnswers: gameState.redemptionAnswers,
      totalCorrect: finalStats.totalCorrect,
      totalQuestions: questions.length,
      passRate: finalStats.passRate,
      requiredCorrect,
    });
  };

  // Стили для вариантов ответов
  const getOptionStyle = (index) => {
    if (!gameState.isSubmitted) {
      return gameState.selectedOption === index
        ? "border-blue-500 bg-blue-50"
        : "border-gray-300 hover:border-gray-400 hover:bg-gray-50";
    }

    if (index === gameState.selectedOption) {
      if (gameState.selectedOption === currentQuestion.answer) {
        return "border-green-500 bg-green-50";
      } else {
        return "border-red-500 bg-red-50";
      }
    }

    return "border-gray-300 bg-gray-100";
  };

  const getLocationIcon = () => {
    switch (currentQuestion?.location) {
      case "office":
        return "🏢";
      case "metro":
        return "🚇";
      case "park":
        return "🌳";
      default:
        return "📍";
    }
  };

  // Экран завершения
  if (gameState.phase === "completed") {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            {stats.passed ? (
              <Award className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            ) : (
              <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            )}
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              {stats.passed ? "Поздравляем!" : "Тест не пройден"}
            </h3>
            <p className="text-gray-600">
              {stats.passed
                ? `Вы успешно прошли тест с результатом ${stats.passRate.toFixed(
                    0
                  )}%`
                : `Результат: ${stats.passRate.toFixed(0)}%. Требуется: ${
                    minimumPassRate * 100
                  }%`}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium text-gray-700">Основной раунд</div>
                <div className="text-xl font-bold text-blue-600">
                  {stats.mainCorrect}/{questions.length}
                </div>
              </div>
              {stats.redemptionCorrect > 0 && (
                <div>
                  <div className="font-medium text-gray-700">Redemption</div>
                  <div className="text-xl font-bold text-green-600">
                    +{stats.redemptionCorrect}
                  </div>
                </div>
              )}
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="font-medium text-gray-700">Итого</div>
              <div className="text-2xl font-bold text-gray-800">
                {stats.totalCorrect}/{questions.length}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center text-green-600 font-medium">
            <CheckCircle size={20} className="mr-2" />
            Задание завершено
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <p className="text-gray-500">Нет доступных вопросов</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Прогресс и статистика */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-600">
              {gameState.phase === "main" ? (
                <span>Основной раунд: {stats.mainRoundProgress}</span>
              ) : (
                <div className="flex items-center gap-2">
                  <RotateCcw size={16} className="text-orange-500" />
                  <span>Redemption: {stats.redemptionProgress}</span>
                </div>
              )}
            </div>
            <div className="text-sm font-medium">
              Правильно: {stats.totalCorrect}/{questions.length}
              <span className="text-gray-500 ml-2">
                (нужно: {requiredCorrect})
              </span>
            </div>
          </div>

          {/* Прогресс бар */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                stats.passed ? "bg-green-500" : "bg-blue-500"
              }`}
              style={{
                width: `${Math.min(
                  100,
                  (stats.totalCorrect / requiredCorrect) * 100
                )}%`,
              }}
            />
          </div>
        </div>

        {/* Локация и фокус */}
        {currentQuestion.location && (
          <div className="mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="text-lg">{getLocationIcon()}</span>
              <span className="capitalize">
                {currentQuestion.location === "office"
                  ? "Офис"
                  : currentQuestion.location === "metro"
                  ? "Метро"
                  : currentQuestion.location === "park"
                  ? "Парк"
                  : "Локация"}
              </span>
              {currentQuestion.focus && (
                <span className="ml-4 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                  Фокус: {currentQuestion.focus}
                </span>
              )}
            </div>
          </div>
        )}

        {/* История */}
        {currentQuestion.story && (
          <div className="mb-8">
            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                Оқиға
              </h3>
              <p className="text-blue-800 text-lg leading-relaxed">
                {currentQuestion.story}
              </p>
              {currentQuestion.media && (
                <div className="mt-6">
                  <img
                    src={currentQuestion.media}
                    alt="story illustration"
                    className="w-full max-w-md h-60 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Вопрос */}
        <div className="mb-6">
          <h4 className="text-xl font-semibold text-gray-800 mb-4">
            {currentQuestion.question}
          </h4>
        </div>

        {/* Варианты ответов */}
        <div className="space-y-3 mb-6">
          {currentQuestion.options?.map((option, index) => (
            <button
              key={index}
              onClick={() => handleOptionSelect(index)}
              disabled={gameState.isSubmitted}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${getOptionStyle(
                index
              )} ${
                gameState.isSubmitted ? "cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              <div className="flex items-center">
                <div
                  className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${
                    gameState.selectedOption === index
                      ? "border-current"
                      : "border-gray-400"
                  }`}
                >
                  {gameState.selectedOption === index && (
                    <div className="w-3 h-3 rounded-full bg-current" />
                  )}
                </div>
                <span className="text-lg">{option}</span>
                {gameState.isSubmitted &&
                  index === gameState.selectedOption &&
                  gameState.selectedOption === currentQuestion.answer && (
                    <CheckCircle className="ml-auto text-green-600" size={20} />
                  )}
                {gameState.isSubmitted &&
                  index === gameState.selectedOption &&
                  gameState.selectedOption !== currentQuestion.answer && (
                    <XCircle className="ml-auto text-red-600" size={20} />
                  )}
              </div>
            </button>
          ))}
        </div>

        {/* Обратная связь */}
        {gameState.showFeedback && (
          <div
            className={`p-4 rounded-lg mb-6 ${
              gameState.lastAnswerCorrect
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            <p
              className={`font-medium ${
                gameState.lastAnswerCorrect ? "text-green-800" : "text-red-800"
              }`}
            >
              {gameState.lastAnswerCorrect ? "Правильно! ✅" : "Неправильно ❌"}
            </p>
            {gameState.lastAnswerCorrect && currentQuestion.explanation && (
              <p className="text-green-700 text-sm mt-2">
                {currentQuestion.explanation}
              </p>
            )}
          </div>
        )}

        {/* Кнопки действий */}
        <div className="flex justify-end gap-3">
          {!gameState.isSubmitted ? (
            <button
              onClick={handleSubmit}
              disabled={gameState.selectedOption === null}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                gameState.selectedOption !== null
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Проверить ответ
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              {gameState.phase === "main"
                ? gameState.currentQuestionIndex < questions.length - 1
                  ? "Следующий вопрос"
                  : "Завершить основной раунд"
                : gameState.lastAnswerCorrect
                ? gameState.currentRedemptionIndex <
                  gameState.incorrectQuestions.length - 1
                  ? "Следующий вопрос"
                  : "Завершить тест"
                : "Попробовать снова"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

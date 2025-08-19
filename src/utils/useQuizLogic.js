import { useState } from "react";

// ========================================
// УНИВЕРСАЛЬНАЯ ЛОГИКА КВИЗА
// ========================================
export const useQuizLogic = (allQuestions, onComplete, taskType) => {
  const needCorrect = Math.ceil(allQuestions.length * 0.8); // 80%

  const [state, setState] = useState({
    phase: "main",
    currentIndex: 0,
    currentAnswer: null,
    submitted: false,
    showResult: false,

    mainAnswers: [], // [{correct: true/false, question, userAnswer}]
    wrongQuestions: [], // вопросы которые нужно переделать
    redemptionIndex: 0,
    redemptionAnswers: [],
  });

  // Проверка правильности ответа в зависимости от типа
  const checkAnswer = (userAnswer, question, taskType) => {
    switch (taskType) {
      case "storytask":
      case "imagequiz":
        return userAnswer === question.answer;

      case "audiotask":
        if (typeof question.answer === "number") {
          return userAnswer === question.answer;
        }
        return (
          userAnswer?.toLowerCase().trim() ===
          question.answer?.toLowerCase().trim()
        );

      case "matchtask":
        if (!userAnswer || typeof userAnswer !== "object") return false;
        if (!question.answer || typeof question.answer !== "object")
          return false;

<<<<<<< HEAD
        // Сравниваем объекты соответствий
        const userKeys = Object.keys(userAnswer).sort();
        const correctKeys = Object.keys(question.answer).sort();

=======
        const userKeys = Object.keys(userAnswer).sort();
        const correctKeys = Object.keys(question.answer).sort();
>>>>>>> c63cd58ebd4a7400bcef3e7bcec0f8a519e92b97
        if (userKeys.length !== correctKeys.length) return false;

        return userKeys.every(
          (key) => userAnswer[key] === question.answer[key]
        );

      case "multiblanktask":
        if (!Array.isArray(userAnswer) || !Array.isArray(question.blanks)) {
          return false;
        }

        // Проверяем, что все blanks заполнены и правильные
        return (
          userAnswer.length === question.blanks.length &&
          userAnswer.every((selectedIndex, blankIndex) => {
            const blank = question.blanks[blankIndex];
            return (
              selectedIndex !== null &&
              selectedIndex !== undefined &&
              selectedIndex === blank.answer
            );
          })
        );

      default:
        return false;
    }
  };

  // Проверка готовности ответа
  const isAnswerReady = (answer, taskType) => {
    switch (taskType) {
      case "storytask":
      case "imagequiz":
        return answer !== null && answer !== undefined;

      case "audiotask":
        return answer !== null && answer !== undefined;

      case "matchtask":
        return (
          answer && typeof answer === "object" && Object.keys(answer).length > 0
        );

      case "multiblanktask":
        return (
          Array.isArray(answer) &&
          answer.length > 0 &&
          answer.every((item) => item !== null && item !== undefined)
        );

      default:
        return false;
    }
  };

  // Текущий вопрос
  const getCurrentQuestion = () => {
    if (state.phase === "main") {
      return allQuestions[state.currentIndex];
    } else {
      return state.wrongQuestions[state.redemptionIndex];
    }
  };

  // Статистика
  const getStats = () => {
    const mainCorrect = state.mainAnswers.filter((a) => a.correct).length;
    const redemptionCorrect = state.redemptionAnswers.filter(
      (a) => a.correct
    ).length;
    const total = mainCorrect + redemptionCorrect;

    return {
      mainCorrect,
      redemptionCorrect,
      total,
      needed: needCorrect,
      passed: total >= needCorrect,
      percent: Math.round((total / allQuestions.length) * 100),
      progress:
        state.phase === "main"
          ? `${state.currentIndex + 1}/${allQuestions.length}`
          : `${state.redemptionIndex + 1}/${state.wrongQuestions.length}`,
    };
  };

  // Установка ответа
  const setAnswer = (answer) => {
    if (state.submitted) return;
    setState((prev) => ({ ...prev, currentAnswer: answer }));
  };

  // Отправка ответа
  const submitAnswer = () => {
    if (!isAnswerReady(state.currentAnswer, taskType)) return;

    const currentQ = getCurrentQuestion();
    const isCorrect = checkAnswer(state.currentAnswer, currentQ, taskType);

    setState((prev) => ({
      ...prev,
      submitted: true,
      showResult: true,
    }));

    // Добавляем ответ через небольшую задержку для UI
    setTimeout(() => {
      if (state.phase === "main") {
        setState((prev) => ({
          ...prev,
          mainAnswers: [
            ...prev.mainAnswers,
            {
              correct: isCorrect,
              question: currentQ,
              userAnswer: state.currentAnswer,
            },
          ],
        }));
      } else {
        setState((prev) => ({
          ...prev,
          redemptionAnswers: [
            ...prev.redemptionAnswers,
            {
              correct: isCorrect,
              question: currentQ,
              userAnswer: state.currentAnswer,
            },
          ],
        }));
      }
    }, 100);
  };

  // Следующий вопрос
  const nextQuestion = () => {
    if (state.phase === "main") {
      if (state.currentIndex < allQuestions.length - 1) {
        setState((prev) => ({
          ...prev,
          currentIndex: prev.currentIndex + 1,
          currentAnswer: null,
          submitted: false,
          showResult: false,
        }));
      } else {
        finishMainRound();
      }
    } else {
      const lastAnswer =
        state.redemptionAnswers[state.redemptionAnswers.length - 1];

      if (!lastAnswer.correct) {
        setState((prev) => ({
          ...prev,
          currentAnswer: null,
          submitted: false,
          showResult: false,
          redemptionAnswers: prev.redemptionAnswers.slice(0, -1),
        }));
      } else {
        if (state.redemptionIndex < state.wrongQuestions.length - 1) {
          setState((prev) => ({
            ...prev,
            redemptionIndex: prev.redemptionIndex + 1,
            currentAnswer: null,
            submitted: false,
            showResult: false,
          }));
        } else {
          finishQuiz();
        }
      }
    }
  };

  // Завершение основного раунда
  const finishMainRound = () => {
    const correctCount = state.mainAnswers.filter((a) => a.correct).length;

    if (correctCount >= needCorrect) {
      finishQuiz();
    } else {
      const wrongQuestions = state.mainAnswers
        .filter((a) => !a.correct)
        .map((a) => a.question);

      setState((prev) => ({
        ...prev,
        phase: "redemption",
        wrongQuestions,
        redemptionIndex: 0,
        currentAnswer: null,
        submitted: false,
        showResult: false,
      }));
    }
  };

  // Завершение квиза
  const finishQuiz = () => {
    setState((prev) => ({ ...prev, phase: "done" }));

    const stats = getStats();
    onComplete?.(taskType, {
      completed: true,
      passed: stats.passed,
      mainAnswers: state.mainAnswers,
      redemptionAnswers: state.redemptionAnswers,
      totalCorrect: stats.total,
      totalQuestions: allQuestions.length,
      passRate: stats.percent,
    });
  };

  return {
    state,
    stats: getStats(),
    currentQuestion: getCurrentQuestion(),
    setAnswer,
    submitAnswer,
    nextQuestion,
    isAnswerReady: (answer) => isAnswerReady(answer, taskType),
  };
};

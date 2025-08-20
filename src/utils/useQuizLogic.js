// Исправленный useQuizLogic hook

import { useCallback, useEffect, useMemo, useState } from "react";

export const useQuizLogic = (
  allQuestions,
  onStepComplete,
  taskType,
  quizId
) => {
  // Normalize questions array - handle both single question and multi-question formats

  const storageKey = `quiz_progress_${quizId || taskType}`;

  const questions = useMemo(() => {
    if (Array.isArray(allQuestions)) {
      return allQuestions;
    }
    // For imagequiz and other multi-question types
    if (allQuestions?.questions && Array.isArray(allQuestions.questions)) {
      return allQuestions.questions;
    }
    // Single question format
    return [allQuestions];
  }, [allQuestions]);
  const loadSavedState = useCallback(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsedState = JSON.parse(saved);
        if (
          parsedState.questionsLength === questions.length &&
          parsedState.taskType === taskType
        ) {
          return parsedState.state;
        }
      }
    } catch (error) {
      console.warn("Error loading quiz state:", error);
    }
    return null;
  }, [storageKey, questions.length, taskType]);

  const saveState = useCallback(
    (newState) => {
      try {
        const dataToSave = {
          state: newState,
          questionsLength: questions.length,
          taskType: taskType,
          timestamp: Date.now(),
        };
        localStorage.setItem(storageKey, JSON.stringify(dataToSave));
      } catch (error) {
        console.warn("Error saving quiz state:", error);
      }
    },
    [storageKey, questions.length, taskType]
  );
  () => {
    if (Array.isArray(allQuestions)) {
      return allQuestions;
    }
    // For imagequiz and other multi-question types
    if (allQuestions?.questions && Array.isArray(allQuestions.questions)) {
      return allQuestions.questions;
    }
    // Single question format
    return [allQuestions];
  },
    [allQuestions];

  const [state, setState] = useState(() => {
    const savedState = loadSavedState();
    return (
      savedState || {
        phase: "main", // 'main' | 'redemption' | 'done'
        currentIndex: 0,
        currentAnswer: null,
        submitted: false,
        showResult: false,
        wrongQuestions: [],
        redemptionIndex: 0,
        answers: [], // Store all answers for main phase
        redemptionAnswers: [], // Store redemption answers
      }
    );
  });

  // Get current question
  const currentQuestion = useMemo(() => {
    if (state.phase === "main") {
      return questions[state.currentIndex];
    } else {
      return state.wrongQuestions[state.redemptionIndex];
    }
  }, [
    questions,
    state.phase,
    state.currentIndex,
    state.wrongQuestions,
    state.redemptionIndex,
  ]);

  // ИСПРАВЛЕННАЯ функция isAnswerReady - более гибкая проверка
  const isAnswerReady = useCallback(
    (answer) => {
      // Null и undefined не готовы
      if (answer === null || answer === undefined) {
        return false;
      }

      // If answer has its own isReady method, use it
      if (typeof answer?.isReady === "function") {
        return answer.isReady();
      }

      // If answer has explicit isComplete property, use it
      if (typeof answer?.isComplete === "boolean") {
        return answer.isComplete;
      }

      // Task-specific logic с улучшенными проверками
      switch (taskType) {
        case "imagequiz":
          // Для imagequiz проверяем наличие selectedOption (включая 0)
          return (
            typeof answer === "object" &&
            answer !== null &&
            "selectedOption" in answer &&
            answer.selectedOption !== null &&
            answer.selectedOption !== undefined
          );

        case "storytask":
        case "audiotask":
          // Для storytask и audiotask answer это индекс выбранного варианта (число)
          return typeof answer === "number" && answer >= 0;

        case "matchtask":
          // Для match задач проверяем объект с соответствиями
          return (
            typeof answer === "object" &&
            answer !== null &&
            Object.keys(answer).length > 0
          );

        case "multiblanktask":
          // Для multiblank проверяем массив с выбранными опциями
          return (
            Array.isArray(answer) &&
            answer.length > 0 &&
            answer.every((item) => item !== null && item !== undefined)
          );

        default:
          // Общая проверка для неизвестных типов
          // Разрешаем 0, false как валидные ответы
          if (typeof answer === "number" || typeof answer === "boolean") {
            return true;
          }
          // Для строк проверяем что не пустая
          if (typeof answer === "string") {
            return answer.trim().length > 0;
          }
          // Для объектов и массивов просто проверяем что не null
          return answer != null;
      }
    },
    [taskType]
  );

  // Universal correctness check - delegates to answer itself if it has isCorrect method
  const isAnswerCorrect = useCallback(
    (answer, question) => {
      if ((!answer && answer !== 0) || !question) return false;
      // If answer has its own isCorrect property, use it
      if (typeof answer?.isCorrect === "boolean") {
        return answer.isCorrect;
      }

      // If answer has its own checkCorrectness method, use it
      if (typeof answer?.checkCorrectness === "function") {
        return answer.checkCorrectness(question);
      }

      // Fallback to task-specific logic
      switch (taskType) {
        case "imagequiz":
          return answer.selectedOption === question.answer;
        case "storytask":
        case "audiotask":
          // Для storytask и audiotask сравниваем индекс с правильным ответом
          return answer === question.answer;
        case "matchtask":
          // Для match задач проверяем правильность соответствий
          if (typeof answer !== "object" || !answer || !question.answer) {
            return false;
          }

          // Проверяем что все соответствия правильные
          return (
            Object.keys(answer).every(
              (leftId) => answer[leftId] === question.answer[leftId]
            ) &&
            Object.keys(answer).length === Object.keys(question.answer).length
          );
        case "multiblanktask":
          // Проверяем правильность выбранных опций для каждого бланка
          if (!Array.isArray(answer) || !Array.isArray(question.blanks)) {
            return false;
          }

          return (
            answer.length === question.blanks.length &&
            answer.every((selectedOptionIndex, blankIndex) => {
              const blank = question.blanks[blankIndex];
              return selectedOptionIndex === blank.answer;
            })
          );
        default:
          return answer === question.answer;
      }
    },
    [taskType]
  );

  // Set answer
  const setAnswer = useCallback((answer) => {
    setState((prev) => ({
      ...prev,
      currentAnswer: answer,
    }));
  }, []);

  // Submit answer
  const submitAnswer = useCallback(() => {
    if (!isAnswerReady(state.currentAnswer)) {
      return;
    }

    const isCorrect = isAnswerCorrect(state.currentAnswer, currentQuestion);
    // if (!isAnswerReady(state.currentAnswer)) return;

    // const isCorrect = isAnswerCorrect(state.currentAnswer, currentQuestion);

    setState((prev) => {
      const newState = {
        ...prev,
        submitted: true,
        showResult: true,
      };

      if (prev.phase === "main") {
        newState.answers = [
          ...prev.answers,
          {
            questionIndex: prev.currentIndex,
            answer: prev.currentAnswer,
            isCorrect,
            question: currentQuestion,
          },
        ];
      } else {
        newState.redemptionAnswers = [
          ...prev.redemptionAnswers,
          {
            questionIndex: prev.redemptionIndex,
            answer: prev.currentAnswer,
            isCorrect,
            question: currentQuestion,
          },
        ];
      }

      return newState;
    });
  }, [state.currentAnswer, currentQuestion, isAnswerReady, isAnswerCorrect]);

  // Next question
  const nextQuestion = useCallback(() => {
    setState((prev) => {
      if (prev.phase === "main") {
        const isLastQuestion = prev.currentIndex >= questions.length - 1;

        if (isLastQuestion) {
          // End of main phase - collect wrong questions
          const wrongQuestions = prev.answers
            .filter((a) => !a.isCorrect)
            .map((a) => a.question);

          const correctCount = prev.answers.filter((a) => a.isCorrect).length;
          const passThreshold = Math.ceil(questions.length * 0.8);

          if (correctCount >= passThreshold || wrongQuestions.length === 0) {
            // Passed or no wrong questions - finish
            return {
              ...prev,
              phase: "done",
              wrongQuestions,
            };
          } else {
            // Go to redemption phase
            return {
              ...prev,
              phase: "redemption",
              wrongQuestions,
              redemptionIndex: 0,
              currentAnswer: null,
              submitted: false,
              showResult: false,
            };
          }
        } else {
          // Next question in main phase
          return {
            ...prev,
            currentIndex: prev.currentIndex + 1,
            currentAnswer: null,
            submitted: false,
            showResult: false,
          };
        }
      } else {
        // Redemption phase
        const currentAnswer =
          prev.redemptionAnswers[prev.redemptionAnswers.length - 1];
        const isLastRedemption =
          prev.redemptionIndex >= prev.wrongQuestions.length - 1;

        if (currentAnswer?.isCorrect) {
          // Correct answer in redemption
          if (isLastRedemption) {
            // Last redemption question - finish
            return {
              ...prev,
              phase: "done",
            };
          } else {
            // Next redemption question
            return {
              ...prev,
              redemptionIndex: prev.redemptionIndex + 1,
              currentAnswer: null,
              submitted: false,
              showResult: false,
            };
          }
        } else {
          // Wrong answer - try again
          return {
            ...prev,
            currentAnswer: null,
            submitted: false,
            showResult: false,
          };
        }
      }
    });
  }, [questions]);

  useEffect(() => {
    if (state.phase !== "done") {
      saveState(state);
    } else {
      try {
        localStorage.removeItem(storageKey);
      } catch (error) {}
    }
  }, [state, saveState, storageKey]); // ← storageKey добавлен в зависимости

  // Calculate stats
  const stats = useMemo(() => {
    const mainCorrect = state.answers.filter((a) => a.isCorrect).length;
    const redemptionCorrect = state.redemptionAnswers.filter(
      (a) => a.isCorrect
    ).length;
    const total = mainCorrect + redemptionCorrect;
    const needed = Math.ceil(questions.length * 0.8);
    const passed = total >= needed;
    const percent = Math.round((total / questions.length) * 100);

    let progress = "";
    if (state.phase === "main") {
      progress = `${state.currentIndex + 1}/${questions.length}`;
    } else if (state.phase === "redemption") {
      progress = `${state.redemptionIndex + 1}/${state.wrongQuestions.length}`;
    }

    return {
      mainCorrect,
      redemptionCorrect,
      total,
      needed,
      passed,
      percent,
      progress,
    };
  }, [state, questions.length]);

  // Complete quiz
  const completeQuiz = useCallback(() => {
    onStepComplete?.(taskType, {
      answers: state.answers,
      redemptionAnswers: state.redemptionAnswers,
      stats,
      passed: stats.passed,
    });
  }, [state.answers, state.redemptionAnswers, stats, onStepComplete, taskType]);

  // Auto-complete when done
  useEffect(() => {
    if (state.phase === "done" && stats.passed) {
      const timer = setTimeout(completeQuiz, 100);
      return () => clearTimeout(timer);
    }
  }, [state.phase, stats.passed, completeQuiz]);

  return {
    currentQuestion,
    state,
    stats,
    setAnswer,
    submitAnswer,
    nextQuestion,
    isAnswerCorrect,
    isAnswerReady,
    completeQuiz,
  };
};

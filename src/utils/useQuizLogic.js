// Universal useQuizLogic hook that works with all task types

import { useState, useCallback, useMemo } from "react";

export const useQuizLogic = (allQuestions, onStepComplete, taskType) => {
  // Normalize questions array - handle both single question and multi-question formats
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

  const [state, setState] = useState({
    phase: "main", // 'main' | 'redemption' | 'done'
    currentIndex: 0,
    currentAnswer: null,
    submitted: false,
    showResult: false,
    wrongQuestions: [],
    redemptionIndex: 0,
    answers: [], // Store all answers for main phase
    redemptionAnswers: [], // Store redemption answers
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

  // Universal answer readiness check - delegates to answer itself if it has isReady method
  const isAnswerReady = useCallback(
    (answer) => {
      if (!answer) return false;

      // If answer has its own isReady method, use it
      if (typeof answer?.isReady === "function") {
        return answer.isReady();
      }

      // If answer has explicit isComplete property, use it
      if (typeof answer?.isComplete === "boolean") {
        return answer.isComplete;
      }

      // Fallback to task-specific logic
      switch (taskType) {
        case "imagequiz":
          return answer.selectedOption != null;
        case "storytask":
        case "audiotask":
          return answer != null && answer !== "";
        case "matchtask":
          return Array.isArray(answer) && answer.length > 0;
        case "multiblanktask":
          return (
            Array.isArray(answer) &&
            answer.every(
              (item) => item && typeof item === "object" && item.value?.trim()
            )
          );
        default:
          // Generic check for simple values
          return answer != null && answer !== "";
      }
    },
    [taskType]
  );

  // Universal correctness check - delegates to answer itself if it has isCorrect method
  const isAnswerCorrect = useCallback(
    (answer, question) => {
      if (!answer || !question) return false;

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
          return answer === question.answer;
        case "matchtask":
          // For match tasks, check if all pairs are correct
          return (
            Array.isArray(answer) &&
            answer.length === question.pairs?.length &&
            answer.every((pair) => {
              const correctPair = question.pairs.find(
                (p) => p.left === pair.left
              );
              return correctPair && correctPair.right === pair.right;
            })
          );
        case "multiblanktask":
          // Check if all blanks are filled correctly
          if (!Array.isArray(answer) || !Array.isArray(question.blanks)) {
            return false;
          }

          return (
            answer.length === question.blanks.length &&
            answer.every((item, index) => {
              const blank = question.blanks[index];
              if (!item || !blank) return false;

              const userAnswer = item.value?.trim().toLowerCase();
              const correctAnswer = blank.answer?.trim().toLowerCase();

              return userAnswer === correctAnswer;
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
    if (!isAnswerReady(state.currentAnswer)) return;

    const isCorrect = isAnswerCorrect(state.currentAnswer, currentQuestion);

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
  if (state.phase === "done" && stats.passed) {
    setTimeout(completeQuiz, 100);
  }

  return {
    currentQuestion,
    state,
    stats,
    setAnswer,
    submitAnswer,
    nextQuestion,
    isAnswerReady,
    completeQuiz,
  };
};

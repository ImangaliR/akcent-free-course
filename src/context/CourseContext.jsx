// context/CourseContext.js
import { createContext, useContext, useEffect, useState } from "react";

const CourseContext = createContext();

export const useCourse = () => {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error("useCourse must be used within a CourseProvider");
  }
  return context;
};

export const CourseProvider = ({ children }) => {
  const [courseManifest, setCourseManifest] = useState(null);
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [completedBlocks, setCompletedBlocks] = useState([]);
  // NEW: Add user answers storage
  const [userAnswers, setUserAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API endpoints для твоего бэкенда
  const API_BASE =
    "https://us-central1-akcent-course.cloudfunctions.net/api/storage";

  const token = localStorage.getItem("token"); // Или другое имя ключа

  // Загрузка манифеста курса
  useEffect(() => {
    const loadCourseManifest = async () => {
      try {
        setLoading(true);
        const response = await fetch("/content/course.manifest.json");

        if (!response.ok) {
          throw new Error(
            "Файл манифеста не найден, используем тестовые данные"
          );
        }

        const manifest = await response.json();
        setCourseManifest(manifest);

        // Загружаем прогресс пользователя с бэкенда
        await loadUserProgress();
      } catch (err) {
        console.warn("Используем fallback манифест:", err.message);

        // Fallback манифест для тестирования
        const fallbackManifest = {
          courseId: "ru-demo-01",
          title: "Орыс тілі",
          locale: "ru",
          sequence: [
            { ref: "blocks/v1.video.json" },
            { ref: "blocks/v2.video.json" },
            { ref: "blocks/v3.video.json" },
            { ref: "blocks/v4.video.json" },
            { ref: "blocks/v5.video.json" },
            { ref: "blocks/v6.video.json" },
          ],
        };

        setCourseManifest(fallbackManifest);
        await loadUserProgress();
      } finally {
        setLoading(false);
      }
    };

    loadCourseManifest();
  }, []);

  const loadUserProgress = async () => {
    try {
      // Load progress
      const progressResponse = await fetch(
        `${API_BASE}?token=${token}&key=course_progress`
      );

      if (progressResponse.ok) {
        const data = await progressResponse.json();
        if (data.value) {
          const progress = JSON.parse(data.value);
          setCurrentBlockIndex(progress.currentBlockIndex || 0);
          setCompletedBlocks(progress.completedBlocks || []);
        }
      }

      // NEW: Load user answers
      const answersResponse = await fetch(
        `${API_BASE}?token=${token}&key=user_answers`
      );

      if (answersResponse.ok) {
        const answersData = await answersResponse.json();
        if (answersData.value) {
          const answers = JSON.parse(answersData.value);
          setUserAnswers(answers || {});
        }
      }
    } catch (err) {
      console.warn("Не удалось загрузить прогресс:", err);
    }
  };

  // Enhanced: Save both progress and answers
  const saveUserProgress = async (blockIndex, completed, answers = null) => {
    try {
      // Save progress (existing functionality)
      const progress = {
        currentBlockIndex: blockIndex,
        completedBlocks: completed,
        lastUpdated: new Date().toISOString(),
      };

      await fetch(API_BASE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          key: "course_progress",
          value: JSON.stringify(progress),
        }),
      });

      // NEW: Save answers if provided
      if (answers !== null) {
        await fetch(API_BASE, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            key: "user_answers",
            value: JSON.stringify(answers),
          }),
        });
      }
    } catch (err) {
      console.error("Ошибка сохранения прогресса:", err);
    }
  };

  // NEW: Save user answers separately (for real-time saving)
  const saveUserAnswers = async (answers) => {
    try {
      await fetch(API_BASE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          key: "user_answers",
          value: JSON.stringify(answers),
        }),
      });
    } catch (err) {
      console.error("Ошибка сохранения ответов:", err);
    }
  };

  // Переход к следующему блоку
  const goToNextBlock = async () => {
    if (!courseManifest) return;

    const nextIndex = currentBlockIndex + 1;
    if (nextIndex < courseManifest.sequence.length) {
      setCurrentBlockIndex(nextIndex);
      await saveUserProgress(nextIndex, completedBlocks);
    }
  };

  // Переход к предыдущему блоку
  const goToPreviousBlock = async () => {
    const prevIndex = Math.max(0, currentBlockIndex - 1);
    setCurrentBlockIndex(prevIndex);
    await saveUserProgress(prevIndex, completedBlocks);
  };

  // Переход к конкретному блоку
  const goToBlock = async (index) => {
    if (!courseManifest || index < 0 || index >= courseManifest.sequence.length)
      return;

    setCurrentBlockIndex(index);
    await saveUserProgress(index, completedBlocks);
  };

  // Enhanced: Complete block with answer data
  const completeBlock = async (blockId, answerData = null) => {
    const newCompleted = [...completedBlocks];
    if (!newCompleted.includes(blockId)) {
      newCompleted.push(blockId);
      setCompletedBlocks(newCompleted);
    }

    // NEW: Save answer data if provided
    if (answerData) {
      const currentBlock = getCurrentBlock();
      const blockRef = currentBlock?.ref || blockId;

      const newAnswers = {
        ...userAnswers,
        [blockRef]: {
          ...answerData,
          completedAt: new Date().toISOString(),
          completed: true,
        },
      };

      setUserAnswers(newAnswers);
      await saveUserProgress(currentBlockIndex, newCompleted, newAnswers);
    } else {
      await saveUserProgress(currentBlockIndex, newCompleted);
    }
  };

  // NEW: Update answer without completing (for draft saves)
  const updateAnswer = async (blockRef, answerData) => {
    const newAnswers = {
      ...userAnswers,
      [blockRef]: {
        ...answerData,
        updatedAt: new Date().toISOString(),
        isDraft: true,
      },
    };

    setUserAnswers(newAnswers);

    // Debounced save to avoid too many API calls
    if (updateAnswer.timeoutId) {
      clearTimeout(updateAnswer.timeoutId);
    }

    updateAnswer.timeoutId = setTimeout(async () => {
      await saveUserAnswers(newAnswers);
    }, 2000); // Save after 2 seconds of inactivity
  };

  // NEW: Get user's answer for a specific block
  const getUserAnswer = (blockRef) => {
    return userAnswers[blockRef] || null;
  };

  // NEW: Check if user has answered a specific block
  const hasUserAnswer = (blockRef) => {
    return blockRef in userAnswers && userAnswers[blockRef] !== null;
  };

  // Получение текущего блока
  const getCurrentBlock = () => {
    if (!courseManifest || !courseManifest.sequence[currentBlockIndex])
      return null;
    return courseManifest.sequence[currentBlockIndex];
  };

  // Проверка, можно ли перейти к следующему блоку
  const canGoNext = () => {
    return (
      courseManifest && currentBlockIndex < courseManifest.sequence.length - 1
    );
  };

  // Проверка, можно ли вернуться к предыдущему блоку
  const canGoPrevious = () => {
    return currentBlockIndex > 0;
  };

  const isCourseCompleted = () => {
    if (!courseManifest?.sequence) return false;

    // Получаем все блоки кроме info блоков
    const mainBlocks = courseManifest.sequence.filter((block) => {
      const lowerRef = block.ref.toLowerCase();
      return !lowerRef.includes("inf");
    });

    // Проверяем что мы на последнем блоке и он завершен
    const isLastBlock =
      currentBlockIndex === courseManifest.sequence.length - 1;
    const lastBlockCompleted = mainBlocks.every((block) => {
      const answer = getUserAnswer(block.ref);
      return answer?.completed === true;
    });

    return isLastBlock && lastBlockCompleted;
  };

  // NEW: Get course completion statistics
  const getCourseStats = () => {
    if (!courseManifest?.sequence) return {};

    const mainBlocks = courseManifest.sequence.filter((block) => {
      const lowerRef = block.ref.toLowerCase();
      return !lowerRef.includes("inf");
    });

    const completedCount = getCompletedCount();
    const totalBlocks = getTotalBlocks();

    // Calculate accuracy from user answers
    let totalQuestions = 0;
    let correctAnswers = 0;

    Object.values(userAnswers).forEach((answer) => {
      if (answer.score !== undefined) {
        totalQuestions += answer.totalQuestions || 1;
        correctAnswers += answer.score || 0;
      }
    });

    const accuracy =
      totalQuestions > 0
        ? Math.round((correctAnswers / totalQuestions) * 100)
        : 0;

    // Get course start date
    const startTime = localStorage.getItem("courseStartTime");
    const startDate = startTime ? new Date(parseInt(startTime)) : new Date();

    // Calculate total study time (примерно)
    const totalTime = `${Math.max(1, Math.round(completedCount * 3))} мин`;

    return {
      totalBlocks,
      completedBlocks: completedCount,
      totalTime,
      accuracy,
      startDate: startDate.toLocaleDateString("kk-KZ"),
      completionDate: new Date().toLocaleDateString("kk-KZ"),
    };
  };

  // Проверка, завершен ли блок
  const isBlockCompleted = (blockId) => {
    return completedBlocks.includes(blockId);
  };

  // NEW: Enhanced block completion check using blockRef
  const isBlockCompletedByRef = (blockRef) => {
    // Check if block is in completed list by ID
    const blockAnswer = getUserAnswer(blockRef);
    return blockAnswer?.completed === true;
  };

  // NEW: Get completion status with answer data
  const getBlockStatus = (blockRef) => {
    const answer = getUserAnswer(blockRef);
    if (!answer) return "not_started";
    if (answer.completed) return "completed";
    if (answer.isDraft) return "draft";
    return "in_progress";
  };

  // NEW: Functions for progress calculation (для Header)
  const getTotalBlocks = () => {
    return (
      courseManifest?.sequence?.filter((block) => {
        const lowerRef = block.ref.toLowerCase();
        return !lowerRef.includes("inf");
      }).length || 0
    );
  };

  const getCompletedCount = () => {
    if (!courseManifest?.sequence) return 0;

    return courseManifest.sequence.filter((block) => {
      const lowerRef = block.ref.toLowerCase();
      // Исключаем info блоки
      if (lowerRef.includes("inf")) return false;

      // Проверяем завершение через userAnswers (более надежно)
      const answer = getUserAnswer(block.ref);
      return answer?.completed === true;
    }).length;
  };

  const getProgressPercentage = () => {
    const total = getTotalBlocks();
    const completed = getCompletedCount();
    return total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;
  };

  const value = {
    // Existing state
    courseManifest,
    currentBlockIndex,
    completedBlocks,
    loading,
    error,

    // NEW: Answer-related state
    userAnswers,

    // Existing navigation methods
    goToNextBlock,
    goToPreviousBlock,
    goToBlock,
    completeBlock, // Enhanced with answer support

    // Existing utilities
    getCurrentBlock,
    canGoNext,
    canGoPrevious,
    isBlockCompleted,

    // NEW: Answer-related methods
    updateAnswer,
    getUserAnswer,
    hasUserAnswer,
    isBlockCompletedByRef,
    getBlockStatus,

    // NEW: Progress calculation methods (for Header)
    getTotalBlocks,
    getCompletedCount,
    getProgressPercentage,
    isCourseCompleted,
    getCourseStats,

    // Existing progress calculation
    progress: courseManifest
      ? Math.round(
          (completedBlocks.length / courseManifest.sequence.length) * 100
        )
      : 0,
  };

  return (
    <CourseContext.Provider value={value}>{children}</CourseContext.Provider>
  );
};

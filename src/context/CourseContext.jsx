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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API endpoints для твоего бэкенда
  const API_BASE =
    "https://us-central1-accent-course.cloudfunctions.net/api/storage";
  const token =
    "8eef074d9cfac3b76180386c3db8371875d9ad5f24b58cd2938e4c845fa9f921"; // Твой токен

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
          title: "Демо-курс русского языка",
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

  // Загрузка прогресса пользователя
  const loadUserProgress = async () => {
    try {
      const response = await fetch(
        `${API_BASE}?token=${token}&key=course_progress`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.value) {
          const progress = JSON.parse(data.value);
          setCurrentBlockIndex(progress.currentBlockIndex || 0);
          setCompletedBlocks(progress.completedBlocks || []);
        }
      }
    } catch (err) {
      console.warn("Не удалось загрузить прогресс:", err);
    }
  };

  // Сохранение прогресса на бэкенд
  const saveUserProgress = async (blockIndex, completed) => {
    try {
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
    } catch (err) {
      console.error("Ошибка сохранения прогресса:", err);
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

  // Отметка блока как завершенного
  const completeBlock = async (blockId) => {
    const newCompleted = [...completedBlocks];
    if (!newCompleted.includes(blockId)) {
      newCompleted.push(blockId);
      setCompletedBlocks(newCompleted);
      await saveUserProgress(currentBlockIndex, newCompleted);
    }
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

  // Проверка, завершен ли блок
  const isBlockCompleted = (blockId) => {
    return completedBlocks.includes(blockId);
  };

  const value = {
    // Состояние
    courseManifest,
    currentBlockIndex,
    completedBlocks,
    loading,
    error,

    // Методы навигации
    goToNextBlock,
    goToPreviousBlock,
    goToBlock,
    completeBlock,

    // Утилиты
    getCurrentBlock,
    canGoNext,
    canGoPrevious,
    isBlockCompleted,

    // Прогресс
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

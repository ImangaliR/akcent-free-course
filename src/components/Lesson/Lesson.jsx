import { useEffect, useState } from "react";
import { VideoLessonWithSubtitles } from "../VideoLesson/VideoLesson";

export const Lesson = ({ currentBlockRef, onBlockComplete }) => {
  const [loading, setLoading] = useState(true);
  const [blockData, setBlockData] = useState(null);
  const [error, setError] = useState(null);

  // Загрузка данных блока из JSON
  useEffect(() => {
    const loadBlockData = async () => {
      // Для тестирования загружаем первое видео по умолчанию
      const blockRef = currentBlockRef || "blocks/v1.video.json";

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/content/${blockRef}`);

        if (!response.ok) {
          throw new Error(`Не удалось загрузить блок: ${response.status}`);
        }

        const data = await response.json();
        setBlockData(data);
      } finally {
        setLoading(false);
      }
    };

    loadBlockData();
  }, [currentBlockRef]);

  // Обработка завершения блока
  const handleBlockComplete = (blockType, completionData = {}) => {
    console.log(`Блок ${blockData?.id} завершен:`, completionData);
    onBlockComplete?.(blockData?.id, { blockType, ...completionData });
  };

  // Состояние загрузки
  if (loading) {
    return (
      <div className="w-full bg-white rounded-xl shadow-lg min-h-[600px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Загружаем контент...</p>
        </div>
      </div>
    );
  }

  // Состояние ошибки
  if (error) {
    return (
      <div className="w-full bg-white rounded-xl shadow-lg min-h-[600px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Ошибка загрузки
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  // Если нет данных блока (только после загрузки)
  if (!blockData && !loading) {
    return (
      <div className="w-full bg-white rounded-xl shadow-lg min-h-[600px] flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Контент не найден
          </h3>
          <p className="text-gray-600">Не удалось загрузить данные блока</p>
        </div>
      </div>
    );
  }

  // Рендер только видео контента
  const renderBlockContent = () => {
    if (blockData?.type === "video") {
      return (
        <VideoLessonWithSubtitles
          lesson={blockData}
          onStepComplete={handleBlockComplete}
        />
      );
    }

    // Для всех остальных типов - простая заглушка
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-gray-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {blockData?.title || "Контент"}
        </h3>
        <p className="text-gray-600 mb-4">
          Тип: {blockData?.type || "неизвестен"}
        </p>
        <p className="text-sm text-gray-500">
          Компонент для этого типа контента будет добавлен позже
        </p>
      </div>
    );
  };

  // Определяем название типа для отображения
  const getTypeLabel = (type) => {
    switch (type) {
      case "video":
        return "Видео";
      case "storyTask":
        return "Задание";
      case "audioTask":
        return "Аудирование";
      case "infoCard":
        return "Инфокарточка";
      default:
        return type;
    }
  };

  return (
    <div className="w-full">
      {/* Заголовок блока */}
      <div className="bg-white rounded-xl shadow-lg mb-6 p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {blockData.title}
            </h2>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-sm text-gray-500">ID: {blockData.id}</span>
              <span className="capitalize bg-gray-100 px-2 py-1 rounded text-xs text-gray-600">
                {getTypeLabel(blockData.type)}
              </span>
            </div>
          </div>

          {/* Статус блока */}
          <div className="text-right">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-xs text-gray-500 mt-1 block">Активный</span>
          </div>
        </div>
      </div>

      {/* Основной контент */}
      <div className="bg-white rounded-xl shadow-lg min-h-[600px]">
        <div className="p-6">{renderBlockContent()}</div>
      </div>
    </div>
  );
};

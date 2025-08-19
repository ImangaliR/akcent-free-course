import { useEffect, useState } from "react";
import { useCourse } from "../../context/CourseContext";
import { useInfoCardModal } from "../../hooks/useModal";
import { MatchTaskRenderer } from "../MatchTaskRenderer";
import { StoryTaskRenderer } from "../StoryTaskRenderer";
import { AudioTaskRenderer } from "../Tasks/AudioTaskRenderer";
import { MultiBlankTaskRenderer } from "../Tasks/MultiBlankTaskRenderer";
import { ImageQuiz } from "../Tasks/ImageQuiz";
import { InfoCardModal } from "../Tasks/InfoCardModal";
import { UniversalQuiz } from "../Tasks/UniversalQuiz";
import { VideoLessonWithSubtitles } from "../VideoLesson/VideoLesson";

export const Lesson = ({ currentBlockRef, onBlockComplete }) => {
  const [loading, setLoading] = useState(true);
  const [blockData, setBlockData] = useState(null);
  const [error, setError] = useState(null);

  const { isOpen, currentInfoCard, showInfoCard, hideInfoCard } =
    useInfoCardModal();
  const { getUserAnswer, completeBlock, updateAnswer } = useCourse();

  const userAnswer = getUserAnswer(currentBlockRef);

  // Загрузка блока
  useEffect(() => {
    const loadBlock = async () => {
      if (!currentBlockRef) return;

      setLoading(true);
      try {
        const response = await fetch(`/content/${currentBlockRef}`);
        if (!response.ok) throw new Error("Ошибка загрузки");
        const data = await response.json();
        setBlockData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadBlock();
  }, [currentBlockRef]);

  // Автоматический показ InfoCard для InfoCard блоков
  useEffect(() => {
    if (blockData?.type === "infocard" && !isOpen) {
      setTimeout(() => {
        showInfoCard(blockData);
        // Автопереход через 3 секунды
        setTimeout(() => {
          hideInfoCard();
          handleInfoCardComplete();
        }, 3000);
      }, 500);
    }
  }, [blockData]);

  // Завершение обычного блока (задания, видео)
  const handleBlockComplete = async (blockType, completionData = {}) => {
    const answerData = {
      blockType,
      blockId: blockData?.id,
      blockRef: currentBlockRef,
      ...completionData,
    };

    await completeBlock(blockData?.id, answerData);
    onBlockComplete?.(blockData?.id, answerData);
  };

  // Завершение InfoCard и автопереход
  const handleInfoCardComplete = () => {
    const answerData = {
      blockType: "infocard",
      blockId: blockData?.id,
      blockRef: currentBlockRef,
      completed: true,
      autoAdvance: true, // Флаг для автоперехода
    };

    completeBlock(blockData?.id, answerData);
    onBlockComplete?.(blockData?.id, answerData);
  };

  // Обновление ответа
  const handleAnswerUpdate = (answerData) => {
    updateAnswer(currentBlockRef, {
      blockType: blockData?.type,
      blockId: blockData?.id,
      blockRef: currentBlockRef,
      ...answerData,
    });
  };

  // Рендер контента
  const renderContent = () => {
    const props = {
      lesson: blockData,
      onStepComplete: handleBlockComplete,
      onAnswerUpdate: handleAnswerUpdate,
      previousAnswer: userAnswer,
    };

    switch (blockData?.type) {
      case "video":
        return <VideoLessonWithSubtitles {...props} />;

      case "storytask":
        return (
          <UniversalQuiz
            lesson={blockData}
            onStepComplete={handleBlockComplete}
            taskType="storytask"
            TaskRenderer={StoryTaskRenderer}
          />
        );
      case "matchtask":
        return (
          <UniversalQuiz
            lesson={blockData}
            onStepComplete={handleBlockComplete}
            taskType="matchtask"
            TaskRenderer={MatchTaskRenderer}
          />
        );
      case "audiotask":
        return (
          <UniversalQuiz
            lesson={blockData}
            onStepComplete={handleBlockComplete}
            taskType="audiotask"
            TaskRenderer={AudioTaskRenderer}
          />
        );
      case "multiblanktask":
        return (
          <UniversalQuiz
            lesson={blockData} // используем blockData как в storytask
            onStepComplete={handleBlockComplete}
            taskType="multiblanktask"
            TaskRenderer={MultiBlankTaskRenderer}
          />
        );
      case "imagequiz":
        return <ImageQuiz {...props} />;
      case "infocard":
        return (
          <div className="bg-blue-50 rounded-lg p-8 text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          </div>
        );
      default:
        return (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {blockData?.title}
            </h3>
            <p className="text-gray-600">Тип: {blockData?.type}</p>
          </div>
        );
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="w-full bg-white rounded-xl shadow-lg min-h-[600px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Загружаем...</p>
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="w-full bg-white rounded-xl shadow-lg min-h-[600px] flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-red-600 mb-2">Ошибка</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Перезагрузить
          </button>
        </div>
      </div>
    );
  }

  // No data
  if (!blockData) {
    return (
      <div className="w-full bg-white rounded-xl shadow-lg min-h-[600px] flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Нет данных
          </h3>
          <p className="text-gray-600">Не удалось загрузить блок</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Заголовок */}
      <div className="bg-[#9C45FF] rounded-xl shadow-lg mb-6 p-4">
        <h2 className="text-2xl font-bold text-white">{blockData.title}</h2>
        <div className="flex items-center gap-3 mt-2">
          <span className="bg-gray-100 px-2 py-1 rounded text-xs">
            {blockData.type}
          </span>

          {blockData.enableQuizMode && (
            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
              Режим квиза
            </span>
          )}
        </div>
      </div>

      {/* Контент */}
      <div className="bg-white rounded-xl shadow-lg min-h-[600px]">
        <div className="p-2">{renderContent()}</div>
      </div>

      {/* Модал InfoCard */}
      <InfoCardModal
        lesson={currentInfoCard}
        isOpen={isOpen}
        onClose={hideInfoCard}
        autoCloseDelay={3000}
      />
    </div>
  );
};

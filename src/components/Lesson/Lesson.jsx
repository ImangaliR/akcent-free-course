import { Quantum } from "ldrs/react";
import "ldrs/react/Quantum.css";
import { useEffect, useState } from "react";
import { useCourse } from "../../context/CourseContext";
import { useInfoCardModal } from "../../hooks/useModal";
import { ContinuousChatGame } from "../ContinuousChatGame";
import { AudioTaskRenderer } from "../Tasks/AudioTaskRenderer";
import { ImageQuizRenderer } from "../Tasks/ImageQuizRenderer";
import { InfoCardModal } from "../Tasks/InfoCardModal";
import { MatchTaskRenderer } from "../Tasks/MatchTaskRenderer";
import { MultiBlankTaskRenderer } from "../Tasks/MultiBlankTaskRenderer";
import { UniversalQuiz } from "../UniversalQuiz";
import { FeedbackRenderer } from "../VideoLesson/FeedbackRenderer";
import { VideoLessonWithSubtitles } from "../VideoLesson/VideoLesson";
import { WarmupQuiz } from "../WarmupQuiz";

export const Lesson = ({
  currentBlockRef,
  onBlockComplete,
  isWelcomeModalOpen,
}) => {
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

        // Handle the new JSON structure for imagequiz
        if (data.questions && Array.isArray(data.questions)) {
          // Keep the original structure but add question navigation metadata
          setBlockData({
            ...data, // Preserve the original type and other root properties
            currentQuestionIndex: 0, // Track which question we're on
            totalQuestions: data.questions.length,
          });
        } else {
          setBlockData(data);
        }
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
        }, 6000);
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

    if (currentBlockRef === "blocks/v6.video.json") {
      return (
        <FeedbackRenderer
          lesson={blockData}
          onComplete={handleBlockComplete}
          onAdvance={onBlockComplete} // Используем onBlockComplete для перехода
        />
      );
    }

    switch (blockData?.type) {
      case "video":
        return (
          <VideoLessonWithSubtitles
            {...props}
            isWelcomeModalOpen={isWelcomeModalOpen}
          />
        );

      case "chatgame": // ИСПРАВЛЕННЫЙ CASE
        return (
          <ContinuousChatGame
            lesson={blockData}
            onStepComplete={handleBlockComplete}
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
            lesson={blockData}
            onStepComplete={handleBlockComplete}
            taskType="multiblanktask"
            TaskRenderer={MultiBlankTaskRenderer}
          />
        );
      case "imagequiz":
        return (
          <UniversalQuiz
            lesson={blockData}
            onStepComplete={handleBlockComplete}
            taskType="imagequiz"
            TaskRenderer={ImageQuizRenderer}
          />
        );
      case "warmupquiz":
        return (
          <WarmupQuiz lesson={blockData} onStepComplete={handleBlockComplete} />
        );

      case "infocard":
        return (
          <div className="bg-indigo-50 rounded-lg p-8 text-center">
            {/* <div className="w-8 h-8 border-4 border-[#9C45FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div> */}
            <Quantum size="65" speed="3.00" color="#9C45FF" />
          </div>
        );
      default:
        console.log("Falling to default case with blockData:", blockData);
        return (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {blockData?.title}
            </h3>
            <p className="text-gray-600">Тип: {blockData?.type}</p>
            <pre className="text-xs text-gray-400 mt-4 text-left">
              {JSON.stringify(blockData, null, 2)}
            </pre>
          </div>
        );
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="w-full bg-white rounded-xl shadow-lg min-h-[600px] flex items-center justify-center">
        <div className="text-center">
          <Quantum size="65" speed="3.00" color="#9C45FF" />
          <p className="text-gray-600">Жүктелуде...</p>
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
            Деректер жоқ
          </h3>
          <p className="text-gray-600">Не удалось загрузить блок</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Контент */}
      <div className="rounded-sm">
        <div className="p-1 md:p-5">{renderContent()}</div>
      </div>

      {/* Модал InfoCard */}
      <InfoCardModal
        lesson={currentInfoCard}
        isOpen={isOpen}
        onClose={hideInfoCard}
        autoCloseDelay={5000}
      />
    </div>
  );
};

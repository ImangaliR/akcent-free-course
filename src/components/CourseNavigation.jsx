// components/CourseNavigation/CourseNavigation.jsx
import { CheckCircle, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { useCourse } from "../context/CourseContext";

export const CourseNavigation = ({ currentBlockCompleted = false }) => {
  const {
    currentBlockIndex,
    courseManifest,
    goToNextBlock,
    goToPreviousBlock,
    canGoNext,
    canGoPrevious,
    completeBlock,
    getCurrentBlock,
    progress,
  } = useCourse();

  const currentBlock = getCurrentBlock();

  const handleNext = async () => {
    // Если текущий блок завершен, отмечаем его и переходим дальше
    if (currentBlockCompleted && currentBlock) {
      await completeBlock(currentBlock.ref);
    }
    await goToNextBlock();
  };

  const getBlockTypeLabel = (ref) => {
    if (ref.includes("video")) return "Видео";
    if (ref.includes("task")) return "Задание";
    if (ref.includes("audio")) return "Аудирование";
    if (ref.includes("inf-")) return "Инфокарточка";
    return "Блок";
  };

  const getCurrentBlockInfo = () => {
    if (!currentBlock) return null;

    const blockNumber = currentBlockIndex + 1;
    const totalBlocks = courseManifest?.sequence?.length || 0;
    const blockType = getBlockTypeLabel(currentBlock.ref);

    return { blockNumber, totalBlocks, blockType };
  };

  const blockInfo = getCurrentBlockInfo();

  if (!courseManifest || !currentBlock) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border-t">
      {/* Прогресс бар */}
      <div className="px-6 py-3 border-b bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>
            {blockInfo?.blockType} {blockInfo?.blockNumber} из{" "}
            {blockInfo?.totalBlocks}
          </span>
          <span>{progress}% завершено</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Кнопки навигации */}
      <div className="p-6">
        <div className="flex items-center justify-between">
          {/* Кнопка "Назад" */}
          <button
            onClick={goToPreviousBlock}
            disabled={!canGoPrevious()}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
              ${
                canGoPrevious()
                  ? "text-gray-700 hover:bg-gray-100 border border-gray-300"
                  : "text-gray-400 cursor-not-allowed border border-gray-200"
              }
            `}
          >
            <ChevronLeft size={20} />
            Назад
          </button>

          {/* Информация о текущем блоке */}
          <div className="text-center">
            <div className="text-sm text-gray-500 mb-1">Текущий блок</div>
            <div className="font-medium text-gray-800">
              {blockInfo?.blockType} {blockInfo?.blockNumber}
            </div>
          </div>

          {/* Кнопка "Далее" */}
          {canGoNext() ? (
            <button
              onClick={handleNext}
              disabled={!currentBlockCompleted}
              className={`
                flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors
                ${
                  currentBlockCompleted
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }
              `}
            >
              {currentBlockCompleted ? (
                <>
                  Далее
                  <ChevronRight size={20} />
                </>
              ) : (
                <>
                  <Play size={16} />
                  Завершите блок
                </>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-2 px-6 py-2 rounded-lg bg-green-100 text-green-800 font-medium">
              <CheckCircle size={20} />
              Курс завершен!
            </div>
          )}
        </div>

        {/* Подсказка */}
        {!currentBlockCompleted && (
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              💡 Завершите просмотр текущего блока, чтобы перейти к следующему
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

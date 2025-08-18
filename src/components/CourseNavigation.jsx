import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit3,
  Info,
  PenTool,
  Play,
  Volume2,
} from "lucide-react";
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
    getBlockStatus,
    hasUserAnswer,
  } = useCourse();

  const currentBlock = getCurrentBlock();

  const getAnswerStatus = (blockRef) => {
    const status = getBlockStatus(blockRef);
    const hasAnswer = hasUserAnswer(blockRef);

    return {
      status,
      hasAnswer,
      isCompleted: status === "completed",
      isDraft: status === "draft",
      hasProgress: hasAnswer,
    };
  };

  const handleNext = async () => {
    // If current block is completed, mark it and continue
    if (currentBlockCompleted && currentBlock) {
      // Use the block ID for completion tracking
      await completeBlock(currentBlock.ref);
    }
    await goToNextBlock();
  };

  const getBlockTypeInfo = (ref) => {
    if (ref.includes("video") || ref.includes("v")) {
      return {
        type: "video",
        label: "Видео",
        icon: <Play className="w-5 h-5" />,
        color: "blue",
      };
    }
    if (ref.includes("task") || ref.includes("t")) {
      return {
        type: "task",
        label: "Задание",
        icon: <PenTool className="w-5 h-5" />,
        color: "green",
      };
    }
    if (ref.includes("audio")) {
      return {
        type: "audio",
        label: "Аудирование",
        icon: <Volume2 className="w-5 h-5" />,
        color: "purple",
      };
    }
    if (ref.includes("inf")) {
      return {
        type: "info",
        label: "Инфокарточка",
        icon: <Info className="w-5 h-5" />,
        color: "indigo",
      };
    }
    return {
      type: "unknown",
      label: "Блок",
      icon: <Play className="w-5 h-5" />,
      color: "gray",
    };
  };

  const getCurrentBlockInfo = () => {
    if (!currentBlock) return null;

    const blockNumber = currentBlockIndex + 1;
    const totalBlocks = courseManifest?.sequence?.length || 0;
    const typeInfo = getBlockTypeInfo(currentBlock.ref);
    const answerStatus = getAnswerStatus(currentBlock.ref);

    return { blockNumber, totalBlocks, answerStatus, ...typeInfo };
  };

  const getNextBlockInfo = () => {
    if (!canGoNext() || !courseManifest?.sequence) return null;

    const nextBlock = courseManifest.sequence[currentBlockIndex + 1];
    if (!nextBlock) return null;

    const typeInfo = getBlockTypeInfo(nextBlock.ref);
    const answerStatus = getAnswerStatus(nextBlock.ref);

    return {
      blockNumber: currentBlockIndex + 2,
      answerStatus,
      ...typeInfo,
    };
  };

  const getPreviousBlockInfo = () => {
    if (!canGoPrevious() || !courseManifest?.sequence) return null;

    const prevBlock = courseManifest.sequence[currentBlockIndex - 1];
    if (!prevBlock) return null;

    const typeInfo = getBlockTypeInfo(prevBlock.ref);
    const answerStatus = getAnswerStatus(prevBlock.ref);

    return {
      blockNumber: currentBlockIndex,
      answerStatus,
      ...typeInfo,
    };
  };

  const blockInfo = getCurrentBlockInfo();
  const nextBlockInfo = getNextBlockInfo();
  const previousBlockInfo = getPreviousBlockInfo();

  if (!courseManifest || !currentBlock) {
    return null;
  }

  // Enhanced status indicator
  const getStatusIndicator = (answerStatus) => {
    if (answerStatus.isCompleted) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    if (answerStatus.isDraft) {
      return <Edit3 className="w-4 h-4 text-yellow-500" />;
    }
    if (answerStatus.hasProgress) {
      return <Clock className="w-4 h-4 text-blue-500" />;
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border-t">
      {/* Progress bar */}

      {/* Navigation buttons */}
      <div className="p-6">
        <div className="flex items-center justify-between gap-4">
          {/* Back button */}
          <div className="flex-1">
            {canGoPrevious() ? (
              <button
                onClick={goToPreviousBlock}
                className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all text-gray-700 hover:bg-gray-100 border border-gray-300 hover:border-gray-400 w-full group"
              >
                <ChevronLeft className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <div className="text-sm flex items-center gap-2">
                    Артқа
                    {previousBlockInfo?.answerStatus &&
                      getStatusIndicator(previousBlockInfo.answerStatus)}
                  </div>
                  {previousBlockInfo && (
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      {previousBlockInfo.icon}
                      {previousBlockInfo.label} {previousBlockInfo.blockNumber}
                    </div>
                  )}
                </div>
              </button>
            ) : (
              <div className="px-4 py-3 text-gray-400 text-sm flex items-center gap-3 border border-gray-300 rounded-xl">
                <ChevronLeft className="w-5 h-5" />
                <div>
                  <div>Назад</div>
                  <div className="text-xs">Первый блок</div>
                </div>
              </div>
            )}
          </div>

          {/* Current block info */}
          <div className="text-center px-6">
            <div className="font-bold text-gray-800 flex items-center gap-2 justify-center">
              {blockInfo?.icon}
              <span>
                {blockInfo?.label} {blockInfo?.blockNumber}
              </span>
              {blockInfo?.answerStatus &&
                getStatusIndicator(blockInfo.answerStatus)}
            </div>
          </div>

          {/* Next button */}
          <div className="flex-1">
            {canGoNext() ? (
              <button
                onClick={handleNext}
                disabled={
                  !currentBlockCompleted &&
                  !blockInfo?.answerStatus?.isCompleted
                }
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all w-full justify-end group
                  ${
                    currentBlockCompleted ||
                    blockInfo?.answerStatus?.isCompleted
                      ? "bg-blue-500 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }
                `}
              >
                <div className="text-right">
                  {currentBlockCompleted ||
                  blockInfo?.answerStatus?.isCompleted ? (
                    <>
                      <div className="text-sm flex items-center gap-2 justify-end">
                        Алға
                        {nextBlockInfo?.answerStatus &&
                          getStatusIndicator(nextBlockInfo.answerStatus)}
                      </div>
                      {nextBlockInfo && (
                        <div className="text-xs opacity-90 flex items-center gap-1 justify-end">
                          {nextBlockInfo.icon}
                          {nextBlockInfo.label} {nextBlockInfo.blockNumber}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="text-sm flex items-center gap-2 justify-end">
                        <Play className="w-4 h-4" />
                        Блокты аяқтау
                      </div>
                      <div className="text-xs">Чтобы продолжить</div>
                    </>
                  )}
                </div>
                {(currentBlockCompleted ||
                  blockInfo?.answerStatus?.isCompleted) && (
                  <ChevronRight className="w-5 h-5 group-hover:scale-110 transition-transform" />
                )}
              </button>
            ) : (
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium justify-end shadow-lg">
                <div className="text-right">
                  <div className="text-sm flex items-center gap-2 justify-end">
                    <CheckCircle className="w-4 h-4" />
                    Курс завершен!
                  </div>
                  <div className="text-xs opacity-90">Поздравляем!</div>
                </div>
              </div>
            )}
          </div>
        </div>
        {blockInfo?.answerStatus?.isDraft &&
          !blockInfo?.answerStatus?.isCompleted && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 text-blue-800">
                <Edit3 className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium">
                  У вас есть сохраненный черновик ответа
                </span>
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

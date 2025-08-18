import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Play,
  Info,
  Volume2,
  PenTool,
  Edit3,
  Clock,
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
    progress,
    completedBlocks,
    // NEW: Answer-related methods
    getUserAnswer,
    getBlockStatus,
    hasUserAnswer,
  } = useCourse();

  const currentBlock = getCurrentBlock();

  // Enhanced helper function to safely check if a block is completed
  const isBlockCompleted = (blockRef) => {
    // Check both old completion tracking and new answer-based completion
    if (!completedBlocks) return false;

    // Check old array-based completion
    if (
      completedBlocks.includes &&
      typeof completedBlocks.includes === "function"
    ) {
      if (completedBlocks.includes(blockRef)) return true;
    }

    // Check Set-based completion
    if (completedBlocks.has && typeof completedBlocks.has === "function") {
      if (completedBlocks.has(blockRef)) return true;
    }

    // Check object-based completion
    if (completedBlocks[blockRef]) return true;

    // NEW: Check answer-based completion
    const blockStatus = getBlockStatus(blockRef);
    return blockStatus === "completed";
  };

  // Enhanced helper function to get completed count
  const getCompletedCount = () => {
    if (!completedBlocks || !courseManifest?.sequence) return 0;

    const validBlockRefs = courseManifest.sequence.map((b) => b.ref);

    // Normalize to array of refs
    let completedArray = [];
    if (completedBlocks.size !== undefined) {
      completedArray = Array.from(completedBlocks);
    } else if (completedBlocks.length !== undefined) {
      completedArray = completedBlocks;
    } else if (typeof completedBlocks === "object") {
      completedArray = Object.keys(completedBlocks);
    }

    // Only count blocks that exist in this course
    return (
      completedArray.filter((ref) => validBlockRefs.includes(ref)).length + 1
    );
  };

  // NEW: Get answer status for a block
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

  const getStatusText = (answerStatus) => {
    if (answerStatus.isCompleted) return "Завершен";
    if (answerStatus.isDraft) return "Есть черновик";
    if (answerStatus.hasProgress) return "В процессе";
    return currentBlockCompleted ? "Готов к продолжению" : "В процессе";
  };

  const getStatusColor = (answerStatus) => {
    if (answerStatus.isCompleted) return "bg-green-100 text-green-700";
    if (answerStatus.isDraft) return "bg-yellow-100 text-yellow-700";
    if (answerStatus.hasProgress) return "bg-blue-100 text-blue-700";
    return currentBlockCompleted
      ? "bg-blue-100 text-blue-700"
      : "bg-gray-100 text-gray-600";
  };

  // Calculate safe progress
  const completedCount = getCompletedCount();
  const totalBlocks = courseManifest?.sequence?.length || 0;

  const safeProgress =
    totalBlocks > 0
      ? Math.min(100, Math.round((completedCount / totalBlocks) * 100))
      : 0;

  return (
    <div className="bg-white rounded-xl shadow-lg border-t">
      {/* Progress bar */}
      <div className="px-6 py-4 border-b bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-2">
            {blockInfo?.icon}
            <span className="font-medium">
              {blockInfo?.label} {blockInfo?.blockNumber} из{" "}
              {blockInfo?.totalBlocks}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">
              {safeProgress}% завершено
            </span>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-xs">
                {getCompletedCount()}/{blockInfo?.totalBlocks}
              </span>
            </div>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-500 h-2.5 rounded-full transition-all duration-300 relative overflow-hidden"
            style={{ width: `${safeProgress}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>Начало</span>
          <span>Завершение</span>
        </div>
      </div>

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
            <div className="text-sm text-gray-500 mb-1">Қазіргі блок</div>
            <div className="font-bold text-gray-800 flex items-center gap-2 justify-center">
              {blockInfo?.icon}
              <span>
                {blockInfo?.label} {blockInfo?.blockNumber}
              </span>
              {blockInfo?.answerStatus &&
                getStatusIndicator(blockInfo.answerStatus)}
            </div>
            <div
              className={`text-xs mt-1 px-2 py-1 rounded-full inline-block ${
                blockInfo?.answerStatus
                  ? getStatusColor(blockInfo.answerStatus)
                  : currentBlockCompleted
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {blockInfo?.answerStatus
                ? getStatusText(blockInfo.answerStatus)
                : currentBlockCompleted
                ? "Готов к продолжению"
                : "В процессе"}
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

        {/* Hint */}
        {!currentBlockCompleted &&
          !blockInfo?.answerStatus?.isCompleted &&
          canGoNext() && (
            <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200">
              <div className="flex items-start gap-3">
                <div className="text-yellow-600 mt-0.5">💡</div>
                <div>
                  <p className="text-sm text-yellow-800 font-medium mb-1">
                    Завершите текущий блок, чтобы продолжить
                  </p>
                  <p className="text-xs text-yellow-700">
                    {blockInfo?.type === "video" &&
                      "Просмотрите видео до конца"}
                    {blockInfo?.type === "task" &&
                      "Выполните задание правильно"}
                    {blockInfo?.type === "audio" &&
                      "Прослушайте аудио и ответьте на вопрос"}
                    {blockInfo?.type === "info" && "Ознакомьтесь с информацией"}
                  </p>
                </div>
              </div>
            </div>
          )}

        {/* Completion achievement */}
        {(isBlockCompleted(currentBlock.ref) ||
          blockInfo?.answerStatus?.isCompleted) && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium">
                Блок успешно завершен!
              </span>
              {blockInfo?.answerStatus?.isDraft && (
                <span className="text-xs text-green-600">
                  (и у вас есть сохраненный ответ)
                </span>
              )}
            </div>
          </div>
        )}

        {/* Draft status */}
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

import { CheckCircle, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { useState } from "react";
import { useCourse } from "../context/CourseContext";
import { CompletionModal } from "./modals/CompetitionModal";

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
    isCourseCompleted,
    getCourseStats,
    // ДОБАВЛЯЕМ: методы для проверки завершенности блока
    isBlockCompletedByRef,
    getUserAnswer,
  } = useCourse();

  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const currentBlock = getCurrentBlock();

  // ИСПРАВЛЕНИЕ: Проверяем, завершен ли текущий блок через context
  const isCurrentBlockCompleted = () => {
    if (!currentBlock?.ref) return false;

    // Проверяем через getUserAnswer - более надежный способ
    const userAnswer = getUserAnswer(currentBlock.ref);
    const completedViaAnswer = userAnswer?.completed === true;

    // Также проверяем через isBlockCompletedByRef
    const completedViaRef = isBlockCompletedByRef(currentBlock.ref);

    // Учитываем и текущее состояние из props
    return completedViaAnswer || completedViaRef || currentBlockCompleted;
  };

  const handleCompletionClick = () => {
    setShowCompletionModal(true);
  };

  // Проверка, есть ли InfoCard после задания
  const checkForInfoCardAfterTask = async () => {
    if (!courseManifest?.sequence || !canGoNext()) return false;

    // Проверяем, является ли текущий блок заданием
    const isTask =
      currentBlock?.ref &&
      (currentBlock.ref.includes("storytask") ||
        currentBlock.ref.includes("audiotask") ||
        currentBlock.ref.includes("matchtask") ||
        currentBlock.ref.includes("imagequiz"));

    if (!isTask) return false;

    // Проверяем следующий блок
    const nextBlock = courseManifest.sequence[currentBlockIndex + 1];
    return nextBlock?.ref?.includes("inf") || false;
  };

  // Обработка кнопки "Алға"
  const handleNext = async () => {
    const blockCompleted = isCurrentBlockCompleted();

    if (!blockCompleted || !currentBlock) return;

    // Отмечаем текущий блок как завершенный (если еще не отмечен)
    const userAnswer = getUserAnswer(currentBlock.ref);
    if (!userAnswer?.completed) {
      await completeBlock(currentBlock.ref);
    }

    await goToNextBlock();
  };

  if (!courseManifest || !currentBlock) return null;

  const totalBlocks = courseManifest?.sequence?.length || 0;
  const currentNumber = currentBlockIndex + 1;

  // ИСПОЛЬЗУЕМ исправленную функцию
  const blockCompleted = isCurrentBlockCompleted();

  return (
    <div className="w-full mx-auto px-1 md:px-4 pb-4">
      <div className="w-full mx-auto bg-white rounded-2xl overflow-hidden">
        <div className="p-2 lg:p-3">
          <div className="flex items-center justify-between gap-3 md:gap-4 lg:gap-6">
            {/* Кнопка назад */}
            <div className="flex-1">
              {canGoPrevious() ? (
                <button
                  onClick={goToPreviousBlock}
                  className="flex items-center gap-2 md:gap-3 px-3 py-3 lg:px-6 lg:py-4 rounded-2xl cursor-pointer font-medium text-gray-700 hover:bg-gray-50 border-2 border-gray-200 w-full transition-all duration-200 hover:border-gray-300 hover:shadow-md group"
                >
                  <div className="p-1 bg-gray-100 rounded-xl group-hover:bg-gray-200 transition-colors">
                    <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm lg:text-base font-semibold">
                      Артқа
                    </div>
                    <div className="text-xs text-gray-500">Алдыңғы бөлім</div>
                  </div>
                </button>
              ) : (
                <div className="px-3 py-3 lg:px-6 lg:py-4 text-gray-400 text-sm flex items-center gap-2 md:gap-3 border-2 border-gray-200 rounded-2xl bg-gray-50">
                  <div className="p-1 bg-gray-200 rounded-xl">
                    <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <div>
                    <div className="font-semibold">Артқа</div>
                    <div className="text-xs">Бірінші бөлім</div>
                  </div>
                </div>
              )}
            </div>

            {/* Кнопка вперед */}
            <div className="flex-1">
              {canGoNext() ? (
                <button
                  onClick={handleNext}
                  disabled={!blockCompleted}
                  className={`
                    flex items-center gap-2 md:gap-3 px-3 py-3 lg:px-6 lg:py-4 rounded-2xl cursor-pointer
                    font-medium w-full justify-end transition-all duration-200 border-2
                    ${
                      blockCompleted
                        ? "bg-[#9C45FF] text-white hover:from-[#9C45FF] hover:to-[#9C45FF] shadow-lg hover:shadow-xl border-[#9C45FF] transform hover:scale-101"
                        : "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200"
                    }
                  `}
                >
                  <div className="text-right">
                    {blockCompleted ? (
                      <>
                        <div className="text-sm lg:text-base font-semibold">
                          Алға
                        </div>
                        <div className="text-xs opacity-90">Келесі бөлім</div>
                      </>
                    ) : (
                      <>
                        <div className="text-sm lg:text-base font-semibold flex items-center gap-2 justify-end">
                          <Play className="w-4 h-4" />
                          Келесі
                        </div>
                        <div className="text-xs">Бөлімді аяқтаңыз</div>
                      </>
                    )}
                  </div>
                  {blockCompleted && (
                    <div className="p-1 bg-white/20 rounded-xl">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleCompletionClick}
                  className="flex items-center gap-2 md:gap-3 px-3 py-3 lg:px-6 lg:py-4 rounded-2xl cursor-pointer bg-green-500 text-white font-medium justify-end shadow-lg border-2 border-green-500 hover:bg-green-600 transition-colors w-full"
                >
                  <div className="text-right">
                    <div className="text-sm lg:text-base font-semibold">
                      Деңгей анықтау
                    </div>
                    <div className="text-xs opacity-90">Курс аяқталды!</div>
                  </div>
                  <div className="p-1 bg-white/20 rounded-xl">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <CompletionModal
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        courseTitle={courseManifest?.title || "Орыс тілі"}
        courseStats={getCourseStats()}
      />
    </div>
  );
};

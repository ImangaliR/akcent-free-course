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
  } = useCourse();

  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const currentBlock = getCurrentBlock();

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
    if (!currentBlockCompleted || !currentBlock) return;

    // Отмечаем текущий блок как завершенный
    await completeBlock(currentBlock.ref);

    // Проверяем, нужно ли показать InfoCard
    const hasInfoCard = await checkForInfoCardAfterTask();

    if (hasInfoCard) {
      console.log("После задания будет показан InfoCard");
    } else {
      console.log("Обычный переход к следующему блоку");
    }

    // Переходим к следующему блоку (InfoCard или обычному)
    await goToNextBlock();
  };

  if (!courseManifest || !currentBlock) return null;

  const totalBlocks = courseManifest?.sequence?.length || 0;
  const currentNumber = currentBlockIndex + 1;

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
                  className="flex items-center gap-3 px-4 py-3 lg:px-6 lg:py-4 rounded-2xl cursor-pointer font-medium text-gray-700 hover:bg-gray-50 border-2 border-gray-200 w-full transition-all duration-200 hover:border-gray-300 hover:shadow-md group"
                >
                  <div className="p-1 bg-gray-100 rounded-xl group-hover:bg-gray-200 transition-colors">
                    <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm lg:text-base font-semibold">
                      Артқа
                    </div>
                    <div className="text-xs text-gray-500">Алдыңғы блок</div>
                  </div>
                </button>
              ) : (
                <div className="px-4 py-3 lg:px-6 lg:py-4 text-gray-400 text-sm flex items-center gap-3 border-2 border-gray-200 rounded-2xl bg-gray-50">
                  <div className="p-1 bg-gray-200 rounded-xl">
                    <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <div>
                    <div className="font-semibold">Артқа</div>
                    <div className="text-xs">Бірінші блок</div>
                  </div>
                </div>
              )}
            </div>

            {/* Текущий блок - обновленный bubble стиль */}

            {/* Кнопка вперед */}
            <div className="flex-1">
              {canGoNext() ? (
                <button
                  onClick={handleNext}
                  disabled={!currentBlockCompleted}
                  className={`
                    flex items-center gap-3 px-4 py-3 lg:px-6 lg:py-4 rounded-2xl  cursor-pointer
                     font-medium w-full justify-end transition-all duration-200 border-2
                    ${
                      currentBlockCompleted
                        ? "bg-[#9C45FF]  text-white hover:from-[#9C45FF] hover:to-[#9C45FF] shadow-lg hover:shadow-xl border-[#9C45FF] transform hover:scale-101"
                        : "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200"
                    }
                  `}
                >
                  <div className="text-right">
                    {currentBlockCompleted ? (
                      <>
                        <div className="text-sm lg:text-base font-semibold">
                          Алға
                        </div>
                        <div className="text-xs opacity-90">Келесі блок</div>
                      </>
                    ) : (
                      <>
                        <div className="text-sm lg:text-base font-semibold flex items-center gap-2 justify-end">
                          <Play className="w-4 h-4" />
                          Келесі
                        </div>
                        <div className="text-xs">Блокты аяқтаңыз</div>
                      </>
                    )}
                  </div>
                  {currentBlockCompleted && (
                    <div className="p-1 bg-white/20 rounded-xl">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleCompletionClick}
                  className="flex items-center gap-3 px-4 py-3 lg:px-6 lg:py-4 rounded-2xl cursor-pointer bg-green-500 text-white font-medium justify-end shadow-lg border-2 border-green-500"
                >
                  <div className="text-right">
                    <div className="text-sm lg:text-base font-semibold flex items-center gap-2 justify-end">
                      Аяқталды!
                    </div>
                    <div className="text-xs opacity-90">Сыйлықты алу</div>
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

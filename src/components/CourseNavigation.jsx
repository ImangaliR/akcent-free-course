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
  } = useCourse();

  const currentBlock = getCurrentBlock();

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
    <div className="bg-white rounded-xl shadow-lg">
      <div className="p-6">
        <div className="flex items-center justify-between gap-4">
          {/* Кнопка назад */}
          <div className="flex-1">
            {canGoPrevious() ? (
              <button
                onClick={goToPreviousBlock}
                className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-100 border border-gray-300 w-full"
              >
                <ChevronLeft className="w-5 h-5" />
                <div className="text-left">
                  <div className="text-sm">Артқа</div>
                </div>
              </button>
            ) : (
              <div className="px-4 py-3 text-gray-400 text-sm flex items-center gap-3 border border-gray-300 rounded-lg">
                <ChevronLeft className="w-5 h-5" />
                <div>
                  <div>Артқа</div>
                  <div className="text-xs">Бірінші блок</div>
                </div>
              </div>
            )}
          </div>

          {/* Текущий блок */}
          <div className="text-center px-1 md:px-6">
            <div className="text-sm md:text-base font-semibold md:font-bold text-gray-800">
              {currentNumber} / {totalBlocks}
            </div>
            <div className="text-xs md:text-xs text-gray-500">блок</div>
          </div>

          {/* Кнопка вперед */}
          <div className="flex-1">
            {canGoNext() ? (
              <button
                onClick={handleNext}
                disabled={!currentBlockCompleted}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg font-medium w-full justify-end transition-all
                  ${
                    currentBlockCompleted
                      ? "bg-blue-500 text-white hover:bg-blue-700 shadow-lg"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }
                `}
              >
                <div className="text-right">
                  {currentBlockCompleted ? (
                    <>
                      <div className="text-sm">Алға</div>
                    </>
                  ) : (
                    <>
                      <div className="text-sm flex items-center gap-2 justify-end">
                        <Play className="w-4 h-4" />
                        Аяқтау
                      </div>
                    </>
                  )}
                </div>
                {currentBlockCompleted && <ChevronRight className="w-5 h-5" />}
              </button>
            ) : (
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-green-500 text-white font-medium justify-end shadow-lg">
                <div className="text-right">
                  <div className="text-sm flex items-center gap-2 justify-end">
                    <CheckCircle className="w-4 h-4" />
                    Аяқталды!
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

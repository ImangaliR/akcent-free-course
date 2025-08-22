import { Trophy } from "lucide-react";
import { useEffect, useState } from "react";

export const CompletionModal = ({
  isOpen,
  onClose,
  courseTitle = "Орыс тілі",
  courseStats = {},
}) => {
  const [showConfetti, setShowConfetti] = useState(false);

  // Обработчик ESC и блокировка скролла
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", handleEscape);
        document.body.style.overflow = "unset";
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const {
    totalBlocks = 0,
    completedBlocks = 0,
    totalTime = "0 мин",
    accuracy = 0,
  } = courseStats;

  const monthsKz = [
    "қаңтар",
    "ақпан",
    "наурыз",
    "сәуір",
    "мамыр",
    "маусым",
    "шілде",
    "тамыз",
    "қыркүйек",
    "қазан",
    "қараша",
    "желтоқсан",
  ];

  const date = new Date();
  const completionDate = `${date.getDate()} ${
    monthsKz[date.getMonth()]
  } ${date.getFullYear()} ж.`;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
      {/* Modal Container */}
      <div className="relative w-full h-full sm:h-auto sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl mx-auto p-4 sm:p-0">
        <div
          className="bg-white h-full sm:h-auto rounded-2xl shadow-2xl overflow-hidden relative transform transition-all duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Scrollable Content */}
          <div className="h-full sm:h-auto overflow-y-auto">
            <div className="p-6 sm:p-8 lg:p-10 text-center min-h-full sm:min-h-0 flex flex-col justify-center">
              {/* Trophy Icon */}
              <div className="mb-6 sm:mb-8">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                </div>
              </div>

              {/* Title */}
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
                Құттықтаймыз!
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 mb-1 sm:mb-2 px-4">
                Сіз{" "}
                <span className="font-semibold text-[#9C45FF] break-words">
                  {courseTitle}
                </span>{" "}
                курсын сәтті аяқтадыңыз!
              </p>
              <p className="text-xs sm:text-sm text-gray-500 mb-6 sm:mb-8">
                {completionDate} күні
              </p>

              {/* Stats - Минималистичный дизайн */}
              <div className="flex flex-wrap justify-center gap-6 sm:gap-8 mb-6 sm:mb-8 max-w-lg mx-auto">
                {/* Completed Blocks */}
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <span className="text-2xl sm:text-3xl font-bold text-[#9C45FF]">
                      {completedBlocks}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">Блок аяқталды</div>
                </div>

                {/* Total Time */}
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <span className="text-2xl sm:text-3xl font-bold text-blue-600">
                      {totalTime}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">Оқу уақыты</div>
                </div>

                {/* Accuracy */}
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <span className="text-2xl sm:text-3xl font-bold text-green-600">
                      {accuracy > 0 ? `${accuracy}%` : "100%"}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">Дұрыс жауаптар</div>
                </div>
              </div>

              {/* Achievement Badge */}
              <div className="bg-gradient-to-r from-[#9C45FF] to-purple-600 text-white p-4 sm:p-6 rounded-xl mb-6 sm:mb-8 max-w-xl mx-auto">
                <div className="flex items-center justify-center mb-2 sm:mb-3">
                  <span className="font-semibold text-base sm:text-lg">
                    Жетістік ашылды
                  </span>
                </div>
                <p className="opacity-90 text-sm sm:text-base">
                  Курс аяқтаушы - алғашқы курсыңызды сәтті бітірдіңіз
                </p>
              </div>

              {/* Action Buttons - Стек на мобиле, ряд на десктопе */}
              <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4 max-w-2xl mx-auto">
                <button className="w-full bg-gradient-to-r from-[#9C45FF] to-purple-600 text-white py-3 sm:py-4 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] text-base sm:text-lg">
                  Сыйлықты алу
                </button>
                <button
                  onClick={onClose}
                  className="w-full bg-gray-100 text-gray-600 py-3 sm:py-4 px-6 rounded-xl font-medium hover:bg-gray-200 transition-colors text-base sm:text-lg"
                >
                  Жабу
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

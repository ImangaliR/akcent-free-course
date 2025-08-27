import Lottie from "lottie-react";
import { useEffect } from "react";
import Trophy from "../../assets/Trophy.json";

export const CompletionModal = ({
  isOpen,
  onClose,
  courseTitle = "Орыс тілі",
  courseStats = {},
}) => {
  const { playCourseCompleteSound, cleanup } = useAudioFeedback();

  // Play course completion sound when modal opens
  useEffect(() => {
    if (isOpen) {
      // Delay the sound slightly to allow modal to fully appear

      playCourseCompleteSound();
    }
  }, [isOpen, playCourseCompleteSound]);

  // Handle ESC key and block scrolling
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

  // Cleanup audio on unmount
  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

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
            <div className="p-4 sm:p-8 lg:p-10 text-center min-h-full sm:min-h-0 flex flex-col justify-center">
              {/* Trophy Icon */}
              <div className="">
                <Lottie
                  animationData={Trophy}
                  loop={false}
                  className="w-45 h-45 md:w-60 md:h-60 mx-auto"
                />
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
              <p className="text-xs sm:text-sm text-gray-500 mb-6">
                {completionDate} күні
              </p>

              {/* Stats - Minimalistic design */}
              <div className="flex flex-wrap justify-center gap-6 sm:gap-8 mb-6 sm:mb-8 mx-auto">
                {/* Completed Blocks */}
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <span className="text-2xl sm:text-3xl font-bold text-[#9C45FF]">
                      {completedBlocks}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">Бөлім аяқталды</div>
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
              <div className="bg-gradient-to-r from-[#9C45FF] to-purple-600 text-white p-4 sm:p-6 rounded-xl mb-6">
                <div className="flex items-center justify-center mb-2 sm:mb-3">
                  <span className="font-semibold text-lg md:text-xl">
                    Жетістік ашылды
                  </span>
                </div>
                <p className="opacity-90 text-sm sm:text-base">
                  Пробный сабаққа өту үшін төмендегі батырманы басыңыз
                </p>
              </div>

              {/* Action Buttons - Stack on mobile, row on desktop */}
              <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4 ">
                <a
                  href="https://wa.me/77074945051?text=%D0%9F%D1%80%D0%BE%D0%B1%D0%BD%D1%8B%D0%B9%20%D1%81%D0%B0%D0%B1%D0%B0%D2%9B%D2%9B%D0%B0%20%D2%9B%D0%B0%D1%82%D1%8B%D1%81%D2%9B%D1%8B%D0%BC%20%D0%BA%D0%B5%D0%BB%D0%B5%D0%B4%D1%96"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <button className="w-full bg-gradient-to-r from-[#9C45FF] to-purple-600 text-white py-3 sm:py-4 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] text-base sm:text-lg">
                    Пробный сабаққа өту
                  </button>
                </a>
                <button
                  onClick={onClose}
                  className="w-full bg-gray-100 text-gray-600 py-3 sm:py-4 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-colors text-base sm:text-lg"
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

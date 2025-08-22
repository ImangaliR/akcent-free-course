import { Award, BookOpen, Clock, Trophy, X } from "lucide-react";
import { useEffect, useState } from "react";

export const CompletionModal = ({
  isOpen,
  onClose,
  courseTitle = "Орыс тілі",
  courseStats = {},
}) => {
  const [showConfetti, setShowConfetti] = useState(false);

  // Анимация конфетти при открытии
  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Обработчик ESC
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const {
    totalBlocks = 0,
    completedBlocks = 0,
    totalTime = "0 мин",
    accuracy = 0,
    startDate = null,
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
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl transform transition-all duration-300 scale-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Confetti Animation */}
          {showConfetti && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
              <div className="absolute top-0 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></div>
              <div
                className="absolute top-0 right-1/4 w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <div
                className="absolute top-0 left-1/2 w-2 h-2 bg-red-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.4s" }}
              ></div>
              <div
                className="absolute top-0 left-3/4 w-2 h-2 bg-green-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.6s" }}
              ></div>
            </div>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>

          {/* Content */}
          <div className="p-8 lg:p-10 text-center">
            {/* Trophy Icon */}
            <div className="relative mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                <Trophy className="w-12 h-12 text-white" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-4xl font-bold text-gray-900 mb-3">
              Құттықтаймыз!
            </h2>
            <p className="text-xl text-gray-600 mb-2">
              Сіз{" "}
              <span className="font-semibold text-[#9C45FF]">
                {courseTitle}
              </span>{" "}
              курсын сәтті аяқтадыңыз!
            </p>
            <p className="text-sm text-gray-500 mb-8">{completionDate} күні</p>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-6 mb-8 max-w-2xl mx-auto">
              {/* Completed Blocks */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
                <div className="flex items-center justify-center mb-3">
                  <BookOpen className="w-6 h-6 text-[#9C45FF]" />
                </div>
                <div className="text-3xl font-bold text-[#9C45FF] mb-1">
                  {completedBlocks}
                </div>
                <div className="text-sm text-gray-600">Блок аяқталды</div>
              </div>

              {/* Total Time */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
                <div className="flex items-center justify-center mb-3">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {totalTime}
                </div>
                <div className="text-sm text-gray-600">Оқу уақыты</div>
              </div>

              {/* Accuracy */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
                <div className="flex items-center justify-center mb-3">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {accuracy > 0 ? `${accuracy}%` : "100%"}
                </div>
                <div className="text-sm text-gray-600">Дұрыс жауаптар</div>
              </div>
            </div>

            {/* Achievement Badge */}
            <div className="bg-gradient-to-r from-[#9C45FF] to-purple-600 text-white p-6 rounded-xl mb-8 max-w-xl mx-auto">
              <div className="flex items-center justify-center mb-3">
                <span className="font-semibold text-lg">Жетістік ашылды!</span>
              </div>
              <p className="opacity-90">
                Курс аяқтаушы - алғашқы курсыңызды сәтті бітірдіңіз!
              </p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              {/* Certificate Button */}
              <button className="bg-gradient-to-r from-[#9C45FF] to-purple-600 text-white py-4 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] text-lg">
                Сертификат
              </button>

              {/* Close */}
              <button
                onClick={onClose}
                className="bg-gray-100 text-gray-600 py-4 px-6 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Жабу
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

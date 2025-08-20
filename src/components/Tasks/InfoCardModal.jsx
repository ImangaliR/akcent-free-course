import { Info, X } from "lucide-react";
import { useEffect, useState } from "react";

export const InfoCardModal = ({
  lesson,
  isOpen,
  onClose,
  onComplete,
  autoCloseDelay = 3000,
}) => {
  const [isRead, setIsRead] = useState(false);
  const [timeLeft, setTimeLeft] = useState(autoCloseDelay / 1000);
  const [showModal, setShowModal] = useState(false);

  // Handle modal visibility
  useEffect(() => {
    if (isOpen) {
      setShowModal(true);
      setTimeLeft(autoCloseDelay / 1000);
    } else {
      setShowModal(false);
      setIsRead(false);
    }
  }, [isOpen, autoCloseDelay]);

  // Handle countdown and auto-close
  useEffect(() => {
    if (!showModal || isRead) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleClose(true); // Auto-close
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showModal, isRead]);

  const handleClose = (isAutoClose = false) => {
    setIsRead(true);
    setShowModal(false);

    // Mark as completed
    onComplete?.("infocard", {
      completed: true,
      autoCompleted: isAutoClose,
      timeSpent: autoCloseDelay / 1000 - timeLeft,
      readMethod: isAutoClose ? "auto" : "manual",
    });

    // Close with slight delay for better UX
    setTimeout(() => {
      onClose?.();
    }, 100);
  };

  // Don't render if not open
  if (!isOpen || !showModal) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300"
        onClick={() => handleClose(false)}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4">
        <div
          className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden transform transition-all duration-300 scale-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 rounded-full flex items-center justify-center mr-3">
                  <Info size={20} />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-semibold">
                    Пайдалы ақпарат
                  </h3>
                  <p className="text-blue-100 text-xs md:text-sm mt-1">
                    Қызықты факт
                  </p>
                </div>
              </div>

              {/* Close button and timer */}
              <div className="flex items-center gap-3">
                {!isRead && (
                  <div className="bg-white/20 rounded-full px-3 py-1 text-sm font-medium">
                    {timeLeft}с
                  </div>
                )}
                <button
                  onClick={() => handleClose(false)}
                  className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Progress bar */}
            {!isRead && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                <div
                  className="h-full bg-white transition-all duration-1000 ease-linear"
                  style={{
                    width: `${
                      ((autoCloseDelay / 1000 - timeLeft) /
                        (autoCloseDelay / 1000)) *
                      100
                    }%`,
                  }}
                />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6 md:p-8 overflow-y-auto max-h-[calc(90vh-140px)]">
            {/* Image if provided */}
            {lesson?.media && (
              <div className="mb-6 text-center">
                <img
                  src={lesson.media}
                  alt={lesson?.title || "Info image"}
                  className="max-w-md mx-auto rounded-lg shadow-md"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            )}

            {/* Text content */}
            <div className="text-center">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 md:p-6 mb-6 border border-blue-100">
                <p className="text-lg text-gray-800 leading-relaxed">
                  {lesson?.text || "Информационный контент"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

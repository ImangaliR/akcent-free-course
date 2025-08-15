// components/Navigation/LessonNavigation.jsx
import { CheckCircle, ChevronLeft, ChevronRight, Home } from "lucide-react";

export const LessonNavigation = ({
  currentStep,
  totalSteps,
  onPrev,
  onNext,
  canProceed,
  isLastStep,
  setCurrentLesson,
  currentLesson,
}) => {
  const handleNextLesson = () => {
    // Переход к следующему уроку
    setCurrentLesson(currentLesson + 1);
  };

  const handleBackToMenu = () => {
    // Можно добавить логику возврата к главному меню
    console.log("Возврат к меню уроков");
  };

  return (
    <div className="flex items-center justify-between">
      {/* Кнопка "Назад" */}
      <div>
        {currentStep > 0 ? (
          <button
            onClick={onPrev}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} />
            <span>Назад</span>
          </button>
        ) : (
          <button
            onClick={handleBackToMenu}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Home size={20} />
            <span>К урокам</span>
          </button>
        )}
      </div>

      {/* Центральная информация */}
      <div className="flex items-center gap-4">
        {/* Индикатор текущего шага */}
        <div className="flex items-center gap-2">
          {Array.from({ length: totalSteps }, (_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                index < currentStep
                  ? "bg-green-500"
                  : index === currentStep
                  ? "bg-blue-500"
                  : "bg-gray-300"
              }`}
            />
          ))}
        </div>

        {/* Текст прогресса */}
        <span className="text-sm text-gray-600">
          Шаг {currentStep + 1} из {totalSteps}
        </span>
      </div>

      {/* Кнопка "Далее" */}
      <div>
        {isLastStep ? (
          // Если это последний шаг
          <div className="flex items-center gap-2">
            <button
              onClick={handleNextLesson}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <CheckCircle size={20} />
              <span>Следующий урок</span>
            </button>
          </div>
        ) : (
          // Обычная кнопка "Далее"
          <button
            onClick={onNext}
            disabled={!canProceed}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-colors ${
              canProceed
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            <span>Далее</span>
            <ChevronRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

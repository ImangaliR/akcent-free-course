// Header.jsx
import { Menu, X } from "lucide-react";
import Battery from "../assets/thunder-icon.svg"; // Импортируем SVG
import { useCourse } from "../context/CourseContext"; // Импортируем хук

export const Header = ({
  isSidebarOpen,
  setIsSidebarOpen,
  currentLesson,
  lessonTitle,
}) => {
  const { getTotalBlocks, getCompletedCount, getProgressPercentage } =
    useCourse();

  return (
    <header className="lg:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
      {/* Левая часть - Бургер меню и название */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors"
          aria-label={isSidebarOpen ? "Закрыть меню" : "Открыть меню"}
        >
          {isSidebarOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>

        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold text-gray-800 truncate">
            Akcent Academy
          </h1>
        </div>
      </div>

      {/* Правая часть - Прогресс курса */}
      <div className="flex items-center gap-3">
        {/* Батарея с процентом */}
        <div className="relative flex items-center">
          <div
            className={`relative ${
              getProgressPercentage() < 30
                ? "text-red-500"
                : getProgressPercentage() < 70
                ? "text-orange-500"
                : "text-green-500"
            }`}
          >
            {/* Вариант 1: Используйте img тег для SVG */}
            <div className="relative w-15 h-10">
              <img
                src={Battery}
                alt="Battery"
                className="w-full h-full object-contain"
                style={{
                  filter:
                    getProgressPercentage() < 30
                      ? "hue-rotate(0deg) saturate(1.2)" // красный
                      : getProgressPercentage() < 70
                      ? "hue-rotate(39deg) saturate(1.2)" // оранжевый
                      : "hue-rotate(120deg) saturate(1.2)", // зеленый
                }}
              />

              {/* Процент поверх SVG */}
              <div className="absolute inset-0 flex items-center justify-center ml-1">
                <span className="text-white text-xs font-bold drop-shadow-sm">
                  {getProgressPercentage()}%
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* Счетчик блоков
        <div className="text-right">
          <div className="text-sm font-medium text-gray-700">
            <span className="text-indigo-600 font-semibold">
              {getCompletedCount()}/{getTotalBlocks()}
            </span>
          </div>
        </div> */}
      </div>
    </header>
  );
};

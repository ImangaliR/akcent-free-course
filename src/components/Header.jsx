// Header.jsx
import { BookOpen, Home, Menu, X } from "lucide-react";

export const Header = ({
  isSidebarOpen,
  setIsSidebarOpen,
  currentLesson,
  lessonTitle,
}) => {
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
          <Home className="w-5 h-5 text-indigo-600" />
          <h1 className="text-lg font-semibold text-gray-800 truncate">
            Русский язык
          </h1>
        </div>
      </div>

      {/* Правая часть - Текущий урок */}
      <div className="flex items-center gap-2 min-w-0">
        <BookOpen className="w-4 h-4 text-gray-500 flex-shrink-0" />
        <div className="flex flex-col min-w-0">
          <span className="text-sm text-gray-600 truncate">
            Урок {currentLesson}
          </span>
          {lessonTitle && (
            <span className="text-xs text-gray-500 truncate">
              {lessonTitle}
            </span>
          )}
        </div>
      </div>
    </header>
  );
};

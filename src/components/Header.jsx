// Header.jsx
import { Menu, X } from "lucide-react";

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
          <h1 className="text-lg font-semibold text-gray-800 truncate">
            Akcent Academy{" "}
          </h1>
        </div>
      </div>
    </header>
  );
};

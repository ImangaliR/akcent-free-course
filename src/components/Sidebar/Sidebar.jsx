import { BookOpen, CheckCircle, Clock, LogOut, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext"; // Добавить этот импорт

export const SidebarNav = ({
  lessons,
  currentLesson,
  setCurrentLesson,
  isSidebarOpen,
  setIsSidebarOpen,
  completedLessons = [],
}) => {
  const { logout } = useAuth(); // Добавить этот хук

  const handleLessonSelect = (lessonId) => {
    setCurrentLesson(lessonId);
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const handleLogout = () => {
    // Можно добавить подтверждение
    if (window.confirm("Вы уверены, что хотите выйти?")) {
      logout();
    }
  };

  return (
    <>
      {isSidebarOpen && (
        <div
          className="
              lg:hidden fixed inset-0 z-30 
              bg-black/10 backdrop-blur-sm transition-opacity
            "
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      {/* Сайдбар */}
      <aside
        className={`
    fixed inset-y-0 left-0 z-50
    w-64 bg-white shadow-lg flex-shrink-0 flex flex-col
    transform transition-transform duration-300 ease-in-out
    ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
    lg:translate-x-0
  `}
      >
        {/* Хедер сайдбара */}
        <div className="p-6 border-b bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-800 leading-tight">
              Русский язык
              <br />
              <span className="text-sm font-normal text-gray-600">
                для начинающих
              </span>
            </h1>

            {/* Кнопка закрытия только на мобилке */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              aria-label="Закрыть меню"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Навигация - скроллируемая область */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="px-6 py-2 border-b border-gray-100 mb-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Уроки ({lessons.length})
            </p>
          </div>

          <ul className="space-y-1 px-3">
            {lessons.map((lesson) => {
              const isActive = currentLesson === lesson.id;
              const isCompleted = completedLessons.includes(lesson.id);

              return (
                <li key={lesson.id}>
                  <button
                    onClick={() => handleLessonSelect(lesson.id)}
                    className={`
                      w-full text-left px-3 py-3 rounded-lg text-sm font-medium 
                      transition-all duration-200 flex items-center gap-3 group
                      ${
                        isActive
                          ? "bg-indigo-100 text-indigo-700 shadow-sm border border-indigo-200"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                      }
                    `}
                  >
                    {/* Иконка статуса урока */}
                    <div className="flex-shrink-0">
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : isActive ? (
                        <Clock className="w-5 h-5 text-indigo-500" />
                      ) : (
                        <BookOpen className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                      )}
                    </div>

                    {/* Содержимое урока */}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        Урок {lesson.id}
                      </div>
                      <div className="text-xs text-gray-500 truncate mt-0.5">
                        {lesson.title}
                      </div>
                    </div>

                    {/* Индикатор активного урока */}
                    {isActive && (
                      <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Прогресс обучения */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
          <div className="mb-3">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
              <span>Прогресс</span>
              <span>
                {Math.round((completedLessons.length / lessons.length) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${(completedLessons.length / lessons.length) * 100}%`,
                }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {completedLessons.length} из {lessons.length} уроков завершено
            </div>
          </div>
        </div>

        {/* Футер с кнопкой выхода */}
        <div className="p-6 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors group"
          >
            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">Выход</span>
          </button>
        </div>
      </aside>
    </>
  );
};

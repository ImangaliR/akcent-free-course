import {
  BookOpen,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  FileText,
  LogOut,
  Play,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export const SidebarNav = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const { logout } = useAuth();
  const [expandedModules, setExpandedModules] = useState({
    intro: false,
    main: false,
    conclusion: false,
  });

  const [currentItem, setCurrentItem] = useState(null);
  const [completedItems, setCompletedItems] = useState([]);

  // Мок данные курса
  const courseData = {
    intro: {
      id: "intro",
      title: "Введение в курс",
      icon: <Play className="w-4 h-4" />,
      items: [
        {
          id: "intro-video",
          title: 'Видео материал "Введение"',
          type: "video",
        },
      ],
    },
    main: {
      id: "main",
      title: "Основной блок",
      icon: <BookOpen className="w-4 h-4" />,
      items: [
        { id: "theory-1", title: "Теория 1", type: "video" },
        { id: "practice-1", title: "Практика 1", type: "task" },
        { id: "theory-2", title: "Теория 2", type: "video" },
        { id: "practice-2", title: "Практика 2", type: "task" },
        { id: "theory-3", title: "Теория 3", type: "video" },
        { id: "practice-3", title: "Практика 3", type: "task" },
        { id: "theory-4", title: "Теория 4", type: "video" },
        { id: "practice-4", title: "Практика 4", type: "task" },
      ],
    },
    conclusion: {
      id: "conclusion",
      title: "Заключение курса",
      icon: <Users className="w-4 h-4" />,
      items: [
        {
          id: "conclusion-video",
          title: "Заключительное видео",
          type: "video",
        },
      ],
    },
  };

  const handleModuleToggle = (moduleId) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  const handleItemSelect = (itemId) => {
    setCurrentItem(itemId);
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Вы уверены, что хотите выйти?")) {
      logout();
    }
  };

  const getItemIcon = (type) => {
    switch (type) {
      case "video":
        return <Play className="w-4 h-4" />;
      case "task":
        return <FileText className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  const getTotalItems = () => {
    return Object.values(courseData).reduce(
      (total, module) => total + module.items.length,
      0
    );
  };

  return (
    <>
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/10 backdrop-blur-xs transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

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
              Модули курса
            </p>
          </div>

          <div className="px-3 space-y-2">
            {Object.values(courseData).map((module) => (
              <div
                key={module.id}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                {/* Заголовок модуля */}
                <button
                  onClick={() => handleModuleToggle(module.id)}
                  className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-3">
                    {module.icon}
                    <span className="font-medium text-gray-800">
                      {module.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {expandedModules[module.id] ? (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    )}
                  </div>
                </button>

                {/* Содержимое модуля */}
                {expandedModules[module.id] && (
                  <div className="bg-white">
                    {module.items.map((item, index) => {
                      const isActive = currentItem === item.id;
                      const isCompleted = completedItems.includes(item.id);

                      return (
                        <button
                          key={item.id}
                          onClick={() => handleItemSelect(item.id)}
                          className={`
                            w-full text-left px-4 py-3 text-sm transition-all duration-200 
                            flex items-center gap-3 group border-l-4
                            ${
                              index !== module.items.length - 1
                                ? "border-b border-gray-100"
                                : ""
                            }
                            ${
                              isActive
                                ? "bg-indigo-50 text-indigo-700 border-l-indigo-500"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-800 border-l-transparent"
                            }
                          `}
                        >
                          {/* Иконка статуса */}
                          <div className="flex-shrink-0">
                            {isCompleted ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : isActive ? (
                              <Clock className="w-4 h-4 text-indigo-500" />
                            ) : (
                              <div className="text-gray-400 group-hover:text-gray-600">
                                {getItemIcon(item.type)}
                              </div>
                            )}
                          </div>

                          {/* Содержимое */}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">
                              {item.title}
                            </div>
                            <div className="text-xs text-gray-500 truncate mt-0.5 capitalize">
                              {item.type === "video"
                                ? "Видеоурок"
                                : "Практическое задание"}
                            </div>
                          </div>

                          {/* Индикатор активного элемента */}
                          {isActive && (
                            <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </nav>

        {/* Прогресс обучения */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
          <div className="mb-3">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
              <span>Прогресс</span>
              <span>
                {Math.round((completedItems.length / getTotalItems()) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${(completedItems.length / getTotalItems()) * 100}%`,
                }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {completedItems.length} из {getTotalItems()} элементов завершено
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

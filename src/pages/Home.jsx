import { useEffect, useState } from "react";
import { Lesson } from "../components/Lesson/Lesson";
import { Header } from "../components/Sidebar/Header";
import { SidebarNav } from "../components/Sidebar/Sidebar";
import lessonData from "../data/lessonData";

export const Home = () => {
  const [currentLessonId, setCurrentLessonId] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [completedLessons, setCompletedLessons] = useState([]);

  const activeLesson = lessonData.find((l) => l.id === currentLessonId);

  // Закрытие сайдбара при изменении размера экрана
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Закрытие сайдбара при клике Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isSidebarOpen]);

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
      {/* Мобильный хедер */}
      <Header
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        currentLesson={currentLessonId}
        lessonTitle={activeLesson?.title}
      />

      <div className="flex">
        {/* Сайдбар */}
        <SidebarNav
          lessons={lessonData}
          currentLesson={currentLessonId}
          setCurrentLesson={setCurrentLessonId}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          completedLessons={completedLessons}
        />

        {/* Основной контент */}
        <main className="flex-1 lg:ml-64">
          <div className="p-4 sm:p-6 lg:p-8">
            {/* Заголовок урока - скрыт на мобилке, так как есть в хедере */}
            <div className="mb-8 hidden lg:block">
              <h2 className="text-3xl font-bold text-gray-800">
                Lesson {activeLesson?.id}: {activeLesson?.title}
              </h2>
              <p className="text-gray-600 mt-1 text-lg">
                {activeLesson?.description}
              </p>
            </div>

            {/* Мобильный заголовок урока */}
            <div className="mb-6 lg:hidden">
              <h2 className="text-2xl font-bold text-gray-800">
                {activeLesson?.title}
              </h2>
              <p className="text-gray-600 mt-1">{activeLesson?.description}</p>
            </div>

            {/* Компонент урока */}
            {activeLesson ? (
              <Lesson
                key={currentLessonId}
                lesson={activeLesson}
                currentLesson={currentLessonId}
                setCurrentLesson={setCurrentLessonId}
                onLessonComplete={(lessonId) => {
                  if (!completedLessons.includes(lessonId)) {
                    setCompletedLessons((prev) => [...prev, lessonId]);
                  }
                }}
              />
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  Урок не найден. Пожалуйста, выберите урок из меню.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

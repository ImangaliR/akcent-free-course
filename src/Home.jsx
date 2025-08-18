import { useEffect, useState } from "react";
import { CourseNavigation } from "./components/CourseNavigation";
import { Header } from "./components/Header";
import { Lesson } from "./components/Lesson/Lesson";
import { WelcomeModal } from "./components/modals/WelcomeModal";
import { SidebarNav } from "./components/Sidebar";
import { useAuth } from "./context/AuthContext";
import { CourseProvider, useCourse } from "./context/CourseContext";

const HomeContent = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentBlockCompleted, setCurrentBlockCompleted] = useState(false);

  const { showWelcomeModal } = useAuth();
  const { getCurrentBlock, loading, error } = useCourse();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isSidebarOpen && !showWelcomeModal) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isSidebarOpen, showWelcomeModal]);

  // Обработка завершения блока
  const handleBlockComplete = (blockId, completionData) => {
    console.log(`Блок ${blockId} завершен:`, completionData);
    setCurrentBlockCompleted(true);
  };

  // Сброс состояния завершения при смене блока
  useEffect(() => {
    setCurrentBlockCompleted(false);
  }, [getCurrentBlock()?.ref]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Загружаем курс...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Ошибка загрузки курса
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  const currentBlock = getCurrentBlock();

  return (
    <>
      {showWelcomeModal && <WelcomeModal />}

      <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
        <Header
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />

        <div className="flex">
          <SidebarNav
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
          />

          <main className="flex-1 lg:ml-64">
            <div className="p-4 sm:p-6 lg:p-8">
              {/* Основной контент */}
              <div className="mb-6">
                <Lesson
                  currentBlockRef={currentBlock?.ref}
                  onBlockComplete={handleBlockComplete}
                />
              </div>

              {/* Навигация курса */}
              <CourseNavigation currentBlockCompleted={currentBlockCompleted} />
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

// Главный компонент с провайдером
export const Home = () => {
  return (
    <CourseProvider>
      <HomeContent />
    </CourseProvider>
  );
};

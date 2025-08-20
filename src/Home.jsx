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
  const { getCurrentBlock, loading, error, goToNextBlock, canGoNext } =
    useCourse();

  // Обработка завершения блока
  const handleBlockComplete = async (blockId, completionData) => {
    console.log(`Блок завершен:`, blockId, completionData);
    setCurrentBlockCompleted(true);

    // Автопереход только для InfoCard
    if (completionData.autoAdvance && canGoNext()) {
      setTimeout(async () => {
        await goToNextBlock();
        setCurrentBlockCompleted(false);
      }, 500);
    }
  };

  // Сброс при смене блока
  useEffect(() => {
    setCurrentBlockCompleted(false);
  }, [getCurrentBlock()?.ref]);

  // Обработчики
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsSidebarOpen(false);
    };
    const handleEscape = (e) => {
      if (e.key === "Escape" && isSidebarOpen && !showWelcomeModal) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    document.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isSidebarOpen, showWelcomeModal]);

  // Loading
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

  // Error
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-red-600 mb-2">
            Ошибка загрузки
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Перезагрузить
          </button>
        </div>
      </div>
    );
  }

  const currentBlock = getCurrentBlock();

  return (
    <>
      {showWelcomeModal && <WelcomeModal />}

      <div className="font-['FuturaPT'] min-h-screen bg-gray-100 text-gray-900">
        <Header
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />

        <div className="md:flex">
          <SidebarNav
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
          />

          <main className="flex-1 lg:ml-64">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="mb-2 md:mb-6">
                <Lesson
                  currentBlockRef={currentBlock?.ref}
                  onBlockComplete={handleBlockComplete}
                />
              </div>

              <CourseNavigation currentBlockCompleted={currentBlockCompleted} />
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export const Home = () => {
  return (
    <CourseProvider>
      <HomeContent />
    </CourseProvider>
  );
};

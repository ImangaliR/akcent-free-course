import {
  BookOpen,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  FileText,
  Info,
  Lock,
  LogOut,
  PenTool,
  Play,
  Volume2,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useCourse } from "../context/CourseContext";

export const SidebarNav = ({
  isSidebarOpen,
  setIsSidebarOpen,
  onLogoutRequest,
}) => {
  const { logout } = useAuth();
  const {
    courseManifest,
    currentBlockIndex,
    completedBlocks,
    goToBlock,
    getCurrentBlock,
    getProgressPercentage,
    // Добавляем новые методы
    isBlockCompletedByRef,
    getTotalBlocks,
    getCompletedCount,
  } = useCourse();
  const [expandedModules, setExpandedModules] = useState({
    intro: true,
    main: true,
    conclusion: true,
  });

  const isVideoRef = (lowerRef) =>
    lowerRef.includes("video") ||
    lowerRef.includes(".mp4") ||
    /(?:^|\/)v\d/.test(lowerRef) ||
    lowerRef.includes("/v");

  const findFirstVideoOriginalIndex = (blocks) => {
    for (let i = 0; i < blocks.length; i++) {
      const lr = blocks[i].ref.toLowerCase();
      if (!lr.includes("inf") && isVideoRef(lr)) return i;
    }
    return null; // если в курсе нет видео
  };

  const organizeBlocks = () => {
    if (!courseManifest?.sequence) return { intro: [], main: [] };

    const blocks = courseManifest.sequence;
    const organized = { intro: [], main: [] };

    // навигируемые (без инфо-карточек)
    const navigableBlocks = blocks.filter(
      (b) => !b.ref.toLowerCase().includes("inf")
    );

    // находим оригинальный индекс ПЕРВОГО видео
    const firstVideoOriginalIndex = findFirstVideoOriginalIndex(blocks);

    // если видео нет — в intro кладём только первый навигируемый
    const firstNavigableOriginalIndex =
      navigableBlocks.length > 0 ? blocks.indexOf(navigableBlocks[0]) : null;

    navigableBlocks.forEach((block) => {
      const originalIndex = blocks.indexOf(block);
      const blockInfo = {
        ...block,
        index: originalIndex,
        id: block.ref.split("/")[1].split(".")[0],
      };

      const toIntro =
        firstVideoOriginalIndex !== null
          ? originalIndex <= firstVideoOriginalIndex // всё ДО и само первое видео
          : originalIndex === firstNavigableOriginalIndex; // fallback: только самый первый блок

      if (toIntro) {
        organized.intro.push(blockInfo);
      } else {
        organized.main.push(blockInfo);
      }
    });

    return organized;
  };

  const isBlockAccessible = (blockIndex) => {
    // Первый блок всегда доступен
    if (blockIndex === 0) return true;

    // Получаем все навигируемые блоки (исключая InfoCards)
    const navigableBlocks = courseManifest.sequence
      .map((block, index) => ({ ...block, originalIndex: index }))
      .filter((block) => {
        const lowerRef = block.ref.toLowerCase();
        return !lowerRef.includes("inf");
      });

    // Находим текущий блок среди навигируемых
    const currentNavigableIndex = navigableBlocks.findIndex(
      (block) => block.originalIndex === blockIndex
    );

    if (currentNavigableIndex === -1) return false;
    if (currentNavigableIndex === 0) return true;

    // Проверяем, завершен ли предыдущий навигируемый блок
    const previousBlock = navigableBlocks[currentNavigableIndex - 1];
    return isBlockCompleted(previousBlock.ref);
  };

  // const isBlockAccessible = () => true;

  const organizedBlocks = organizeBlocks();

  const handleModuleToggle = (moduleId) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  const handleItemSelect = (blockIndex, isAccessible) => {
    // Блокируем переход, если блок недоступен
    if (!isAccessible) {
      return;
    }

    goToBlock(blockIndex);
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const handleLogout = () => {
    onLogoutRequest(); // Вызываем функцию из пропсов
  };

  const getBlockTypeInfo = (ref) => {
    const lowerRef = ref.toLowerCase();
    if (lowerRef.includes("warmup")) {
      return {
        type: "warmup",
        label: "Прогрев",
        icon: <Play className="w-4 h-4" />,
      };
    }

    if (
      lowerRef.includes("video") ||
      lowerRef.includes(".mp4") ||
      lowerRef.match(/v\d/) ||
      lowerRef.includes("/v")
    ) {
      return {
        type: "video",
        label: "Бейне сабақ",
        icon: <Play className="w-4 h-4" />,
      };
    }
    if (lowerRef.includes("task") || lowerRef.includes("t")) {
      return {
        type: "task",
        label: "Практикалық тапсырма",
        icon: <PenTool className="w-4 h-4" />,
      };
    }
    if (lowerRef.includes("audio")) {
      return {
        type: "audio",
        label: "Тыңдау",
        icon: <Volume2 className="w-4 h-4" />,
      };
    }
    if (lowerRef.includes("inf")) {
      return {
        type: "info",
        label: "Инфокарточка",
        icon: <Info className="w-4 h-4" />,
      };
    }
    if (
      lowerRef.includes("welcome") ||
      lowerRef.includes("intro") ||
      lowerRef.includes("приветств")
    ) {
      return {
        type: "welcome",
        label: "Сәлем",
        icon: <Play className="w-4 h-4" />,
      };
    }
    return {
      type: "unknown",
      label: "Блок",
      icon: <FileText className="w-4 h-4" />,
    };
  };

  const getBlockTitle = (ref, index) => {
    const typeInfo = getBlockTypeInfo(ref);

    // Get all navigable blocks
    const navigableBlocks = courseManifest.sequence.filter((block) => {
      const lowerRef = block.ref.toLowerCase();
      return !lowerRef.includes("inf");
    });

    // Get all video blocks to determine video numbering
    const videoBlocks = navigableBlocks
      .map((block, idx) => ({
        block,
        index: courseManifest.sequence.indexOf(block),
      }))
      .filter(({ block }) => {
        const lowerRef = block.ref.toLowerCase();
        return (
          lowerRef.includes("video") ||
          lowerRef.includes(".mp4") ||
          lowerRef.match(/v\d/) ||
          lowerRef.includes("/v")
        );
      });

    // Проверяем, является ли блок последним видео
    const isLastVideo =
      typeInfo.type === "video" &&
      videoBlocks.length > 0 &&
      videoBlocks[videoBlocks.length - 1].index === index;

    // Специальное название для последнего видео
    if (isLastVideo) {
      return "Қорытынды және кері байланыс"; // "Заключение и обратная связь"
    }
    if (typeInfo.type === "warmup") {
      return "Миға шабуыл";
    }

    // определить первое видео
    const firstVideoOriginalIndex = findFirstVideoOriginalIndex(
      courseManifest.sequence
    );
    const isFirstVideo =
      typeInfo.type === "video" &&
      firstVideoOriginalIndex !== null &&
      index === firstVideoOriginalIndex;

    if (isFirstVideo) {
      return "Кіріспе сабақ";
    }

    // Для всех остальных видео - обычная нумерация
    if (typeInfo.type === "video") {
      const videoCount = videoBlocks.findIndex(
        ({ index: vIndex }) => vIndex === index
      );
      return `${videoCount === 0 ? "" : `${videoCount} `}сабақ: Бейне жазба`;
    }

    // Остальная логика без изменений
    if (typeInfo.type === "task") {
      const taskCount =
        courseManifest.sequence.slice(0, index).filter((block) => {
          const lowerRef = block.ref.toLowerCase();
          return (
            !lowerRef.includes("inf") &&
            (lowerRef.includes("task") || lowerRef.includes("t"))
          );
        }).length + 1;
      return ` ${taskCount} тапсырма `;
    }
    if (typeInfo.type === "audio") {
      const audioCount =
        courseManifest.sequence.slice(0, index).filter((block) => {
          const lowerRef = block.ref.toLowerCase();
          return !lowerRef.includes("inf") && lowerRef.includes("audio");
        }).length + 1;
      return `Аудирование ${audioCount}`;
    }

    return `${typeInfo.label}`;
  };

  // const getTotalBlocks = () => {
  //   return (
  //     courseManifest?.sequence?.filter((block) => {
  //       const lowerRef = block.ref.toLowerCase();
  //       return !lowerRef.includes("inf");
  //     }).length || 0
  //   );
  // };

  const isBlockCompleted = (blockRef) => {
    return isBlockCompletedByRef(blockRef);
  };

  // const getCompletedCount = () => {
  //   if (!completedBlocks || !courseManifest?.sequence) return 0;

  //   // Get all valid block references from the current course (excluding InfoCards)
  //   const validBlockRefs = courseManifest.sequence
  //     .filter((block) => {
  //       const lowerRef = block.ref.toLowerCase();
  //       return !lowerRef.includes("inf");
  //     })
  //     .map((block) => block.ref);

  //   let completedCount = 0;

  //   if (completedBlocks.has && typeof completedBlocks.has === "function") {
  //     // Set - only count completed blocks that exist in current course
  //     validBlockRefs.forEach((ref) => {
  //       if (completedBlocks.has(ref)) {
  //         completedCount++;
  //       }
  //     });
  //   } else if (
  //     completedBlocks.includes &&
  //     typeof completedBlocks.includes === "function"
  //   ) {
  //     // Array - only count completed blocks that exist in current course
  //     validBlockRefs.forEach((ref) => {
  //       if (completedBlocks.includes(ref)) {
  //         completedCount++;
  //       }
  //     });
  //   } else {
  //     // Object - only count completed blocks that exist in current course
  //     validBlockRefs.forEach((ref) => {
  //       const blockData = completedBlocks[ref];
  //       if (!blockData) return;

  //       if (typeof blockData === "object") {
  //         const lowerRef = ref.toLowerCase();
  //         const isVideoBlock =
  //           lowerRef.includes("video") ||
  //           lowerRef.includes(".mp4") ||
  //           lowerRef.match(/v\d/) ||
  //           lowerRef.includes("/v");

  //         // Универсальная проверка
  //         if (
  //           blockData.watched === true ||
  //           blockData.completed === true ||
  //           (blockData.blockType === "video" && blockData.watched === true) ||
  //           (isVideoBlock && blockData.watched === true)
  //         ) {
  //           completedCount++;
  //         }
  //       } else if (blockData) {
  //         completedCount++;
  //       }
  //     });
  //   }

  //   return completedCount;
  // };

  const moduleData = {
    intro: {
      id: "intro",
      title: "Курсқа кіріспе",
      icon: <Play className="w-4 h-4" />,
      blocks: organizedBlocks.intro,
      color: "blue",
    },
    main: {
      id: "main",
      title: "Негізгі сабақтар",
      icon: <BookOpen className="w-4 h-4" />,
      blocks: organizedBlocks.main,
      color: "indigo",
    },
  };

  // Always show intro and main modules, only hide conclusion if empty
  const visibleModules = Object.values(moduleData).filter(
    (module) => module.id === "intro" || module.id === "main"
  );

  if (!courseManifest) {
    return (
      <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-gray-50 p-4 flex-shrink-0 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-lg p-6 text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Курс жүктелуде...</p>
        </div>
      </aside>
    );
  }

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
          w-65 md:w-74 bg-[#f1f2f7] md:p-4 flex-shrink-0 flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        <div className="md:rounded-2xl shadow-lg flex flex-col h-full overflow-hidden">
          {/* Хедер сайдбара */}
          <div className="p-4 md:p-6 bg-[#27232d]">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-white leading-tight">
                  {courseManifest.title || "Русский язык"}
                </h1>
                {/* <span className="text-sm font-normal text-white">
                  бастауыш курс
                </span> */}
              </div>

              <button
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden p-2 rounded-xl text-gray-500 hover:bg-white/50 hover:text-gray-700 transition-colors"
                aria-label="Закрыть меню"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Навигация - скроллируемая область */}
          <nav className="flex-1 overflow-y-auto py-4 bg-white">
            <div className="px-4 md:px-6 md:py-2 mb-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Курс мазмұны
              </p>
            </div>

            <div className="px-2 md:px-4 space-y-3">
              {visibleModules.map((module) => (
                <div
                  key={module.id}
                  className="bg-gray-50 rounded-2xl overflow-hidden "
                >
                  {/* Заголовок модуля */}
                  <button
                    onClick={() => handleModuleToggle(module.id)}
                    className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-50 transition-colors flex items-center justify-between text-left rounded-2xl shadow-sm border border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-xl">
                        {module.icon}
                      </div>
                      <div>
                        <span className="font-medium text-gray-800 block">
                          {module.title}
                        </span>
                        <span className="text-xs text-gray-500 hidden  md:block">
                          {module.blocks.length === 0
                            ? module.id === "intro"
                              ? "Скоро..."
                              : "0 бөлім"
                            : `${module.blocks.length} бөлім`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {expandedModules[module.id] ? (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      )}
                    </div>
                  </button>

                  {expandedModules[module.id] && (
                    <div className="mt-2 px-2 pb-2">
                      {module.blocks.length === 0 ? (
                        // Show placeholder for empty intro section
                        <div className="px-3 md:px-4 py-3 md:py-6 text-center text-gray-500 bg-white rounded-xl">
                          <div className="mb-2">
                            {module.id === "intro" ? (
                              <Play className="w-6 h-6 md:w-8 md:h-8 mx-auto text-gray-300" />
                            ) : (
                              <BookOpen className="w-6 h-6 md:w-8 md:h-8 mx-auto text-gray-300" />
                            )}
                          </div>
                          <p className="text-sm">
                            {module.id === "intro"
                              ? "Приветственное видео скоро появится"
                              : "Содержимое будет добавлено"}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {module.blocks.map((block, itemIndex) => {
                            const isActive = currentBlockIndex === block.index;
                            const isCompleted = isBlockCompleted(block.ref);
                            const isAccessible = isBlockAccessible(block.index);
                            const typeInfo = getBlockTypeInfo(block.ref);

                            return (
                              <button
                                key={block.ref}
                                onClick={() =>
                                  handleItemSelect(block.index, isAccessible)
                                }
                                disabled={!isAccessible}
                                className={`
                                  w-full text-left px-4 py-3 text-sm transition-all duration-200 
                                  flex items-center gap-3 group rounded-xl
                                  ${
                                    isActive
                                      ? "bg-[#9C45FF] text-white shadow-md "
                                      : isAccessible
                                      ? "bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-800 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200"
                                      : "bg-gray-100 text-gray-400 cursor-not-allowed opacity-50 border border-gray-200"
                                  }
                                `}
                              >
                                <div className="flex-shrink-0 rounded-md">
                                  {isCompleted ? (
                                    isActive ? (
                                      <div className="p-1 rounded-lg bg-white/20">
                                        <CheckCircle className="w-4 h-4 text-white" />
                                      </div>
                                    ) : (
                                      <div className="p-1 rounded-lg bg-green-10">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                      </div>
                                    )
                                  ) : isActive ? (
                                    <div className="p-1 rounded-lg bg-white/20">
                                      <Clock className="w-4 h-4 text-white" />
                                    </div>
                                  ) : !isAccessible ? (
                                    <div className="p-1 rounded-lg">
                                      <Lock className="w-4 h-4 text-gray-400" />
                                    </div>
                                  ) : (
                                    <div className="p-1 rounded-lg group-hover:bg-gray-200 transition-colors">
                                      <div className="text-gray-400 group-hover:text-gray-600">
                                        {typeInfo.icon}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="font-medium truncate">
                                    {getBlockTitle(block.ref, block.index)}
                                  </div>
                                  <div
                                    className={`text-xs truncate mt-0.5 ${
                                      isActive ? "text-white" : "text-gray-500"
                                    }`}
                                  >
                                    {typeInfo.label}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </nav>

          {/* Прогресс обучения */}
          <div className="hidden md:block p-2 md:p-4 bg-gradient-to-r from-white to-blue-50">
            <div className="bg-white rounded-2xl p-3 md:p-4 shadow-sm">
              <div className="mb-3">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span className="font-medium">Прогресс</span>
                  <span className="font-bold text-[#9C45FF]">
                    {getProgressPercentage()}%
                  </span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#bc92ed] to-[#9C45FF] h-3 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${getProgressPercentage()}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Футер с кнопкой выхода */}
          <div className="p-2 md:p-4 bg-white">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full  bg-red-500 px-4 py-3 cursor-pointer text-white hover:bg-red-600 hover:text-white rounded-xl transition-all duration-200 group bg-red-00 shadow-sm border border-red-500 hover:shadow-md"
            >
              <div className="p-1 bg-red-50 rounded-lg text-red-500 group-hover:bg-red-100 transition-colors">
                <LogOut className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">Шығу</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

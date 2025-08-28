import { ChevronDown, ChevronUp, Eye, EyeOff, Volume2 } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

// Мемоизированный компонент для отдельного субтитра
const SubtitleItem = memo(({ subtitle, formatTime, onClick }) => {
  return (
    <div
      className="bg-gray-100 hover:bg-gray-200 border border-gray-100 rounded-2xl px-4 py-2 transition-all duration-200 cursor-pointer"
      onClick={() => onClick?.(subtitle)}
    >
      {/* Время и индикатор */}
      <div className="flex items-center justify-between mb-1 md:mb-3">
        <span className="text-xs text-gray-400 font-mono">
          {formatTime(subtitle.start)}
        </span>
        <div className="w-2 h-2 bg-[#9C45FF] rounded-full flex-shrink-0 opacity-80" />
      </div>

      {/* Русский текст */}
      <div
        className="text-xs sm:text-sm font-medium text-gray-800 leading-relaxed break-words hyphens-auto"
        dangerouslySetInnerHTML={{ __html: subtitle.russian }}
      />
    </div>
  );
});

SubtitleItem.displayName = "SubtitleItem";

export const SubtitlePanel = memo(
  ({ subtitles = [], currentTime = 0, onSeekToTime, className = "" }) => {
    const [showPanel, setShowPanel] = useState(true);
    const [showTranslations, setShowTranslations] = useState(true);
    const [activeSubtitle, setActiveSubtitle] = useState(null);
    const [selectedWord, setSelectedWord] = useState(null);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const listRef = useRef(null);
    const lastActiveId = useRef(null);

    // Дебаунсированное время для уменьшения пересчетов
    const debouncedCurrentTime = useMemo(() => {
      return Math.floor(currentTime * 4) / 4; // Обновление каждые 250мс
    }, [currentTime]);

    // Мемоизация форматирования времени
    const formatTime = useCallback((time) => {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    }, []);

    // Оптимизированный поиск активного субтитра
    const activeSubtitleMemo = useMemo(() => {
      if (subtitles.length === 0) return null;

      return (
        subtitles.find(
          (sub) =>
            debouncedCurrentTime >= sub.start && debouncedCurrentTime <= sub.end
        ) || null
      );
    }, [subtitles, debouncedCurrentTime]);

    // Оптимизированный список прошедших субтитров с ограничением количества
    const pastSubtitles = useMemo(() => {
      if (subtitles.length === 0) return [];

      const past = subtitles
        .filter((s) => debouncedCurrentTime > s.end)
        .reverse()
        .slice(0, 50); // Показываем только последние 50 субтитров для производительности

      return past;
    }, [subtitles, debouncedCurrentTime]);

    // Обновление активного субтитра только при изменении
    useEffect(() => {
      if (activeSubtitleMemo?.id !== lastActiveId.current) {
        setActiveSubtitle(activeSubtitleMemo);
        lastActiveId.current = activeSubtitleMemo?.id || null;
      }
    }, [activeSubtitleMemo]);

    // Автоскролл только при появлении нового субтитра
    useEffect(() => {
      if (listRef.current && pastSubtitles.length > 0) {
        // Плавный скролл к началу при появлении нового элемента
        const shouldScroll = pastSubtitles[0]?.id !== lastActiveId.current;
        if (shouldScroll) {
          listRef.current.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        }
      }
    }, [pastSubtitles.length]);

    // Обработчик клика по субтитру
    const handleSubtitleClick = useCallback(
      (subtitle) => {
        if (onSeekToTime) {
          onSeekToTime(subtitle.start);
        }
      },
      [onSeekToTime]
    );

    // Установка панели по умолчанию для мобильных
    useEffect(() => {
      const checkMobile = () => {
        if (window.innerWidth < 1024) {
          setShowPanel(false);
        }
      };

      checkMobile();
      window.addEventListener("resize", checkMobile);
      return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // Скрытая панель
    if (!showPanel) {
      return (
        <div
          className={`w-full bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 ${className}`}
        >
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-800 text-sm sm:text-xl">
              Субтитрлер
            </h4>
            <button
              onClick={() => setShowPanel(true)}
              className="flex-shrink-0 p-2.5 hover:bg-gray-50 rounded-xl text-gray-500 hover:text-gray-700 transition-all duration-200"
              aria-label="Показать субтитры"
            >
              <Eye size={18} className="sm:w-5 sm:h-5" />
            </button>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-3">
            Субтитрлер өшірілген
          </p>
        </div>
      );
    }

    return (
      <div
        className={`w-full max-h-120 md:max-h-155 bg-white rounded-2xl border border-gray-100 flex flex-col ${className}`}
      >
        {/* Фиксированная шапка */}
        <div className="flex-shrink-0 p-5 sm:p-5 border-b border-gray-50">
          <div className="flex items-center justify-between gap-3">
            <h4 className="font-medium text-gray-800 text-sm sm:text-xl min-w-0">
              Субтитрлер
            </h4>

            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Кнопка сворачивания для мобильных */}
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="lg:hidden p-2.5 hover:bg-gray-50 rounded-xl text-gray-500 hover:text-gray-700 transition-all duration-200"
                aria-label={isCollapsed ? "Развернуть" : "Свернуть"}
              >
                {isCollapsed ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronUp size={16} />
                )}
              </button>

              {/* Кнопка скрытия панели */}
              <button
                onClick={() => setShowPanel(false)}
                className="p-2.5 hover:bg-gray-50 rounded-xl text-gray-500 hover:text-gray-700 transition-all duration-200"
                aria-label="Скрыть субтитры"
              >
                <EyeOff size={16} className="sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Основной контент */}
        <div
          className={`flex flex-col flex-1 min-h-0 ${
            isCollapsed ? "hidden" : ""
          }`}
        >
          {/* Активный субтитр */}
          {activeSubtitle && (
            <div className="flex-shrink-0 px-5 md:px-5">
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                <div
                  className="font-medium text-gray-800 text-xs sm:text-sm leading-relaxed break-words hyphens-auto"
                  dangerouslySetInnerHTML={{ __html: activeSubtitle.russian }}
                />
              </div>
            </div>
          )}

          {/* Скроллируемый список завершённых субтитров */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <div
              ref={listRef}
              className="h-full overflow-y-auto px-4 py-2 sm:px-5 pb-4 sm:pb-5"
              style={{ scrollBehavior: "smooth" }}
            >
              {pastSubtitles.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-xs sm:text-sm text-gray-400 text-center">
                  Мұнда субтитрлердің тарихы көрсетіледі
                </div>
              ) : (
                <div className="space-y-2">
                  {pastSubtitles.map((subtitle) => (
                    <SubtitleItem
                      key={`${subtitle.id}-${subtitle.start}`}
                      subtitle={subtitle}
                      formatTime={formatTime}
                      onClick={handleSubtitleClick}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Детали выбранного слова */}
        {selectedWord && (
          <div className="flex-shrink-0 p-4 sm:p-5 border-t border-yellow-100 bg-yellow-50">
            <div className="flex items-center gap-2.5 mb-3">
              <Volume2
                size={14}
                className="text-gray-500 sm:w-4 sm:h-4 flex-shrink-0"
              />
              <h5 className="font-medium text-gray-800 text-sm sm:text-base">
                Таңдалған сөз
              </h5>
            </div>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="font-medium text-blue-800 text-base sm:text-lg break-words">
                  {selectedWord.word}
                </span>
                <span className="text-gray-400 flex-shrink-0">—</span>
                <span className="text-gray-700 text-sm sm:text-base break-words">
                  {selectedWord.translation}
                </span>
              </div>
              <div className="text-xs sm:text-sm text-gray-500">
                Уақыт: {formatTime(selectedWord.start)} –{" "}
                {formatTime(selectedWord.end)}
              </div>
            </div>
            <button
              onClick={() => setSelectedWord(null)}
              className="mt-3 text-xs text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              Жабу
            </button>
          </div>
        )}
      </div>
    );
  }
);

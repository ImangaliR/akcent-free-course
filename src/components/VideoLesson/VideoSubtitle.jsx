// components/Subtitles/SubtitlePanel.jsx
import {
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Languages,
  Volume2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

export const SubtitlePanel = ({
  subtitles = [],
  currentTime = 0,
  onSeekToTime,
  className = "",
}) => {
  const [showPanel, setShowPanel] = useState(true);
  const [showTranslations, setShowTranslations] = useState(true);
  const [activeSubtitle, setActiveSubtitle] = useState(null);
  const [selectedWord, setSelectedWord] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false); // Для мобильных

  // автоскролл к последнему завершённому
  const listRef = useRef(null);

  // текущий активный субтитр (идёт прямо сейчас)
  useEffect(() => {
    const current = subtitles.find(
      (sub) => currentTime >= sub.start && currentTime <= sub.end
    );
    setActiveSubtitle(current || null);
  }, [currentTime, subtitles]);

  // только завершённые субтитры (end < now)
  const pastSubtitles = useMemo(
    () => subtitles.filter((s) => currentTime > s.end),
    [subtitles, currentTime]
  );

  // докручиваем список вниз, когда появляется новый завершённый элемент
  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [pastSubtitles.length]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleSubtitleClick = (subtitle) => {
    onSeekToTime?.(subtitle.start);
  };

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
            className="p-2.5 hover:bg-gray-50 rounded-xl text-gray-500 hover:text-gray-700 touch-manipulation transition-all duration-200"
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
      className={`w-full bg-white rounded-2xl border border-gray-100 overflow-hidden ${className}`}
    >
      {/* Заголовок */}
      <div className="p-4 sm:p-5 border-b border-gray-50">
        <div className="flex items-center justify-between gap-3">
          <h4 className="font-medium text-gray-800 text-sm sm:text-xl">
            Субтитрлер
          </h4>

          <div className="flex items-center gap-2">
            {/* Collapse/Expand для мобильных */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="lg:hidden p-2.5 hover:bg-gray-50 rounded-xl text-gray-500 hover:text-gray-700 touch-manipulation transition-all duration-200"
              aria-label={isCollapsed ? "Развернуть" : "Свернуть"}
            >
              {isCollapsed ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronUp size={16} />
              )}
            </button>

            {/* Перевод вкл/выкл */}
            <button
              onClick={() => setShowTranslations((v) => !v)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm touch-manipulation transition-all duration-200
                ${
                  showTranslations
                    ? "bg-[#ED8A2E] text-white shadow-sm"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }
              `}
              aria-pressed={showTranslations}
              aria-label="Переключить перевод"
              title="Переключить перевод"
            >
              <Languages size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">
                {showTranslations ? "Аударма: қосулы" : "Аударма: сөндірулі"}
              </span>

              <span className="sm:hidden">
                {showTranslations ? "KZ" : "RU"}
              </span>
            </button>

            {/* Скрыть панель */}
            <button
              onClick={() => setShowPanel(false)}
              className="p-2.5 hover:bg-gray-50 rounded-xl text-gray-500 hover:text-gray-700 touch-manipulation transition-all duration-200"
              aria-label="Скрыть субтитры"
              title="Скрыть субтитры"
            >
              <EyeOff size={16} className="sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Контент (сворачивается на мобильных) */}
      <div className={`${isCollapsed ? "hidden lg:block" : "block"}`}>
        {/* Текущий активный субтитр */}
        {activeSubtitle && (
          <div className="p-4 sm:p-5 bg-blue-50 border-b border-blue-100/50">
            <div className="font-medium text-gray-800 text-sm sm:text-base leading-relaxed">
              {activeSubtitle.russian}
            </div>
            {showTranslations && (
              <div className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
                {activeSubtitle.english}
              </div>
            )}
          </div>
        )}

        {/* Список ТОЛЬКО завершённых субтитров */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto h-48 sm:h-64 lg:h-96"
        >
          {pastSubtitles.length === 0 ? (
            <div className="p-4 sm:p-5 text-xs sm:text-sm text-gray-400 text-center">
              Мұнда субтитрлердің тарихы көрсетіледі{" "}
            </div>
          ) : (
            pastSubtitles.map((subtitle) => (
              <div
                key={subtitle.id}
                className="p-4 border-b border-gray-50 cursor-pointer transition-all duration-300 bg-green-50/70 hover:bg-green-100/80 active:bg-green-200/60 touch-manipulation"
                onClick={() => handleSubtitleClick(subtitle)}
                title="Перейти к этому моменту"
              >
                {/* Время */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-gray-400 font-mono">
                    {formatTime(subtitle.start)}
                  </span>
                  <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 opacity-80" />
                </div>

                {/* Русский текст */}
                <div className="text-sm font-medium text-gray-800 mb-2 leading-relaxed">
                  {subtitle.russian}
                </div>

                {/* Английский перевод — по переключателю */}
                {showTranslations && (
                  <div className="text-xs text-gray-600 leading-relaxed opacity-90">
                    {subtitle.english}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Детали выбранного слова */}
      {selectedWord && (
        <div className="p-4 sm:p-5 border-t border-yellow-100/70 bg-yellow-50/80">
          <div className="flex items-center gap-2.5 mb-3">
            <Volume2 size={14} className="text-gray-500 sm:w-4 sm:h-4" />
            <h5 className="font-medium text-gray-800 text-sm sm:text-base">
              Выбранное слово
            </h5>
          </div>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-medium text-blue-800 text-base sm:text-lg">
                {selectedWord.word}
              </span>
              <span className="text-gray-400">—</span>
              <span className="text-gray-700 text-sm sm:text-base">
                {selectedWord.translation}
              </span>
            </div>
            <div className="text-xs sm:text-sm text-gray-500">
              Время: {formatTime(selectedWord.start)} –{" "}
              {formatTime(selectedWord.end)}
            </div>
          </div>
          <button
            onClick={() => setSelectedWord(null)}
            className="mt-3 text-xs text-gray-400 hover:text-gray-600 touch-manipulation transition-colors duration-200"
          >
            Закрыть
          </button>
        </div>
      )}
    </div>
  );
};

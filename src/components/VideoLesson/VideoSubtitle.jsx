// components/Subtitles/SubtitlePanel.jsx
import { Eye, EyeOff, Languages, Volume2 } from "lucide-react";
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
      <div className={`w-80 bg-white rounded-lg shadow-lg p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-gray-800">Субтитры</h4>
          <button
            onClick={() => setShowPanel(true)}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
            aria-label="Показать субтитры"
          >
            <Eye size={20} />
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-2">Субтитры скрыты</p>
      </div>
    );
  }

  return (
    <div className={`w-80 bg-white rounded-lg shadow-lg ${className}`}>
      {/* Заголовок */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between gap-2">
          <h4 className="font-semibold text-gray-800">Субтитры</h4>
          <div className="flex items-center gap-1">
            {/* Перевод вкл/выкл */}
            <button
              onClick={() => setShowTranslations((v) => !v)}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm
                ${
                  showTranslations
                    ? "bg-green-50 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }
              `}
              aria-pressed={showTranslations}
              aria-label="Переключить перевод"
              title="Переключить перевод"
            >
              <Languages size={16} />
              {showTranslations ? "Перевод: вкл" : "Перевод: выкл"}
            </button>

            {/* Скрыть панель */}
            <button
              onClick={() => setShowPanel(false)}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
              aria-label="Скрыть субтитры"
              title="Скрыть субтитры"
            >
              <EyeOff size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Текущий активный субтитр */}
      {activeSubtitle && (
        <div className="p-4 bg-blue-50 border-b">
          <div className="font-medium text-gray-800">
            {activeSubtitle.russian}
          </div>
          {showTranslations && (
            <div className="text-sm text-gray-600 mt-1">
              {activeSubtitle.english}
            </div>
          )}
        </div>
      )}

      {/* Список ТОЛЬКО завершённых субтитров */}
      <div ref={listRef} className="flex-1 overflow-y-auto max-h-96">
        {pastSubtitles.length === 0 ? (
          <div className="p-4 text-sm text-gray-500">
            Пока ничего не сказано 🙊
          </div>
        ) : (
          pastSubtitles.map((subtitle) => (
            <div
              key={subtitle.id}
              className="p-3 border-b cursor-pointer transition-colors duration-200 bg-green-50 hover:bg-green-100"
              onClick={() => handleSubtitleClick(subtitle)}
              title="Перейти к этому моменту"
            >
              {/* Время */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500 font-mono">
                  {formatTime(subtitle.start)}
                </span>
                <div className="w-2 h-2 bg-green-500 rounded-full" />
              </div>

              {/* Русский текст */}
              <div className="text-sm font-medium text-gray-800 mb-1">
                {subtitle.russian}
              </div>

              {/* Английский перевод — по переключателю */}
              {showTranslations && (
                <div className="text-xs text-gray-600">{subtitle.english}</div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Детали выбранного слова (как было) */}
      {selectedWord && (
        <div className="p-4 border-t bg-yellow-50">
          <div className="flex items-center gap-2 mb-2">
            <Volume2 size={16} className="text-gray-600" />
            <h5 className="font-semibold text-gray-800">Выбранное слово</h5>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-blue-800 text-lg">
                {selectedWord.word}
              </span>
              <span className="text-gray-600">—</span>
              <span className="text-gray-700">{selectedWord.translation}</span>
            </div>
            <div className="text-sm text-gray-600">
              Время: {formatTime(selectedWord.start)} –{" "}
              {formatTime(selectedWord.end)}
            </div>
          </div>
          <button
            onClick={() => setSelectedWord(null)}
            className="mt-2 text-xs text-gray-500 hover:text-gray-700"
          >
            Закрыть
          </button>
        </div>
      )}
    </div>
  );
};

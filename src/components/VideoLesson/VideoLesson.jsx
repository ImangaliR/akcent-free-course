import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import "react-loading-skeleton/dist/skeleton.css";
import "./skeleton.css";
import { SubtitlePanel } from "./VideoSubtitle";

/**
 * YouTube IFrame версия с подавлением рекомендаций (rel=0) +
 * дополнительной защитой от endscreen (собственный оверлей до окончания ролика).
 * Обновлено с расширенными параметрами для максимальной защиты.
 */

// ---------------------------
// Utilities
// ---------------------------
function extractYouTubeId(input) {
  if (!input) return null;
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input; // уже ID
  try {
    const url = new URL(input, window.location.origin);
    const v = url.searchParams.get("v");
    if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;
    const last = url.pathname.split("/").filter(Boolean).pop();
    if (last && /^[a-zA-Z0-9_-]{11}$/.test(last)) return last; // youtu.be/ID или /embed/ID
    if (url.pathname.includes("/embed/")) {
      const id = url.pathname.split("/embed/")[1]?.split("/")[0];
      if (id && /^[a-zA-Z0-9_-]{11}$/.test(id)) return id;
    }
  } catch (_) {}
  return null;
}

function pad2(n) {
  return n < 10 ? `0${n}` : `${n}`;
}
function formatTime(sec) {
  if (!Number.isFinite(sec)) return "0:00";
  const s = Math.floor(sec);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return h > 0 ? `${h}:${pad2(m)}:${pad2(ss)}` : `${m}:${pad2(ss)}`;
}

// Загрузка IFrame API (singleton)
function ensureYouTubeIframeAPI() {
  if (typeof window === "undefined")
    return Promise.reject(new Error("No window"));
  if (window.YT && window.YT.Player) return Promise.resolve(window.YT);
  if (window.__ytIframePromise) return window.__ytIframePromise;
  window.__ytIframePromise = new Promise((resolve, reject) => {
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    tag.async = true;
    document.head.appendChild(tag);
    const timeout = setTimeout(
      () => reject(new Error("YouTube IFrame API load timeout")),
      15000
    );
    window.onYouTubeIframeAPIReady = () => {
      clearTimeout(timeout);
      resolve(window.YT);
    };
    tag.onerror = () => {
      clearTimeout(timeout);
      reject(new Error("Failed to load YouTube IFrame API"));
    };
  });
  return window.__ytIframePromise;
}

// ---------------------------
// YouTube Player Component
// ---------------------------
const YouTubeFramePlayer = forwardRef(function YouTubeFramePlayer(
  {
    videoId,
    autoPlay = true,
    start = 0,
    controls = 0, // изменено с 1 на 0 по умолчанию
    suppressRelated = true,
    useLoop = false,
    disableKeyboard = true, // новый параметр
    playsinline = false, // новый параметр
    closedCaptions = false, // новый параметр
    onReady,
    onError,
    onTimeUpdate,
    onDuration,
    onLoadStart,
    onStateChange,
  },
  ref
) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const pollRef = useRef(null);

  useImperativeHandle(ref, () => ({
    seekTo: (sec) => playerRef.current?.seekTo(sec, true),
    getCurrentTime: () => playerRef.current?.getCurrentTime?.() ?? 0,
    getDuration: () => playerRef.current?.getDuration?.() ?? 0,
    play: () => playerRef.current?.playVideo?.(),
    pause: () => playerRef.current?.pauseVideo?.(),
  }));

  useEffect(() => {
    let destroyed = false;
    if (!videoId) return;

    onLoadStart?.();

    ensureYouTubeIframeAPI()
      .then((YT) => {
        if (destroyed) return;
        playerRef.current = new YT.Player(containerRef.current, {
          width: "100%",
          height: "100%",
          videoId,
          playerVars: {
            // Основные параметры воспроизведения
            autoplay: autoPlay ? 1 : 0,
            controls,
            playsinline: playsinline ? 1 : 0,
            start: Math.max(0, Math.floor(start || 0)),

            // Защита от рекомендаций и брендинга
            rel: suppressRelated ? 0 : 1,
            modestbranding: 1,
            showinfo: 0,
            iv_load_policy: 3, // отключить аннотации
            autohide: 1, // автоскрытие контролов

            // Клавиатура и взаимодействие
            disablekb: disableKeyboard ? 1 : 0,

            // Субтитры
            cc_load_policy: closedCaptions ? 1 : 0,
            cc_lang_pref: "auto",

            // API и происхождение
            enablejsapi: 1,
            origin: window.location.origin,

            // Loop настройки (трюк для loop: нужен playlist=videoId)
            loop: useLoop ? 1 : 0,
            playlist: useLoop ? videoId : undefined,

            // Дополнительные параметры безопасности
            widget_referrer: window.location.href,
          },
          events: {
            onReady: (e) => {
              const d = e?.target?.getDuration?.() ?? 0;
              if (d && onDuration) onDuration(d);
              onReady?.(e);
              if (!pollRef.current) {
                pollRef.current = setInterval(() => {
                  const t = e?.target?.getCurrentTime?.() ?? 0;
                  onTimeUpdate?.(t);
                }, 250);
              }
            },
            onError: (e) => onError?.(e),
            onStateChange: (e) => onStateChange?.(e),
          },
        });
      })
      .catch((err) => onError?.(err));

    return () => {
      destroyed = true;
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      try {
        playerRef.current?.destroy?.();
      } catch (_) {}
      playerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId, suppressRelated, useLoop, disableKeyboard, playsinline, closedCaptions]);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full aspect-video" />
    </div>
  );
});

// ---------------------------
// Subtitles Skeleton (unchanged)
// ---------------------------
const SubtitlesSkeleton = () => {
  return (
    <div className="w-full max-h-120 md:max-h-155 bg-white rounded-2xl border border-gray-100 flex flex-col h-full">
      <div className="flex-shrink-0 p-5 border-b border-gray-50">
        <div className="flex items-center justify-between gap-3">
          <div
            className="skeleton text-skeleton"
            style={{ width: "120px", height: "20px" }}
          />
          <div className="flex items-center gap-2">
            <div className="skeleton w-8 h-8 rounded-xl" />
            <div className="skeleton w-8 h-8 rounded-xl" />
          </div>
        </div>
      </div>
      <div className="flex-shrink-0 px-5 py-4">
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
          <div className="space-y-2">
            <div
              className="skeleton text-skeleton"
              style={{ width: "90%", height: "16px" }}
            />
            <div
              className="skeleton text-skeleton"
              style={{ width: "75%", height: "16px" }}
            />
          </div>
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full px-4 py-2 sm:px-5 pb-4 space-y-3">
          {[...Array(8)].map((_, index) => (
            <div
              key={index}
              className="bg-gray-100 border border-gray-100 rounded-2xl px-4 py-3"
              style={{
                animationDelay: `${index * 0.1}s`,
                opacity: Math.max(0.3, 1 - index * 0.1),
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className="skeleton text-skeleton"
                  style={{ width: "40px", height: "12px" }}
                />
                <div className="skeleton w-2 h-2 rounded-full bg-[#9C45FF] opacity-60" />
              </div>
              <div className="space-y-1">
                <div
                  className="skeleton text-skeleton"
                  style={{
                    width: `${85 + Math.random() * 15}%`,
                    height: "14px",
                  }}
                />
                {Math.random() > 0.4 && (
                  <div
                    className="skeleton text-skeleton"
                    style={{
                      width: `${60 + Math.random() * 25}%`,
                      height: "14px",
                    }}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ---------------------------
// End Overlay (наш экран вместо рекомендаций)
// ---------------------------
function EndOverlay({ onRestart, onClose }) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div
        className="
          bg-white/95 rounded-2xl shadow-xl
          w-[75%] max-w-md
          p-4 sm:p-6     /* меньше паддинги на мобилке */
          text-center
        "
      >
        <h3 className="text-base sm:text-lg font-semibold mb-2">
          Сабақ аяқталды
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 mb-4">
          Келесі қадамға өтіңіз немесе қайтадан қараңыз
        </p>
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          <button
            onClick={onRestart}
            className="
              px-3 py-2 sm:px-4 sm:py-2
              rounded-xl
              bg-[#9C45FF] text-white
              hover:bg-[#6028a0]
              transition cursor-pointer
              text-sm sm:text-base
            "
          >
            Қайтадан көру
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------
// Main Component (обновленная версия)
// ---------------------------
export const VideoLessonWithSubtitles = ({
  lesson,
  onStepComplete,
  isWelcomeModalOpen,
}) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [videoWatched, setVideoWatched] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const [subtitles, setSubtitles] = useState([]);
  const [subtitlesLoading, setSubtitlesLoading] = useState(true);

  const playerRef = useRef(null); // YouTubeFramePlayer control surface
  const timeoutRef = useRef(null);
  const lastUpdateTime = useRef(0);
  const [isDesktop, setIsDesktop] = useState(false);

  const [controlsVisible, setControlsVisible] = useState(true);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const hideTimerRef = useRef(null);
  const INACTIVITY_MS = 2000; // через сколько мс прятать (поменяй при желании)

  // Anti-endscreen
  const [showEndOverlay, setShowEndOverlay] = useState(false);
  const overlayShownRef = useRef(false);
  const SUPPRESS_THRESHOLD = 0; // сек до конца, когда перехватываем

  const videoId = useMemo(() => {
    return (
      lesson?.youtubeId ||
      extractYouTubeId(lesson?.youtubeUrl) ||
      extractYouTubeId(lesson?.mediaUrl) ||
      null
    );
  }, [lesson]);

  useEffect(() => {
    const handleResize = () =>
      setIsDesktop(window.matchMedia("(min-width: 1024px)").matches);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const loadSubtitles = useCallback(async () => {
    if (!lesson?.id) return;
    try {
      setSubtitlesLoading(true);
      const response = await fetch(
        `/content/subtitles/${lesson.id}.subtitles.json`
      );
      if (response.ok) {
        const data = await response.json();
        setSubtitles(data.subtitles || []);
      } else {
        console.warn(`Субтитры для ${lesson.id} не найдены`);
        setSubtitles([]);
      }
    } catch (error) {
      console.error("Ошибка загрузки субтитров:", error);
      setSubtitles([]);
    } finally {
      setSubtitlesLoading(false);
    }
  }, [lesson?.id]);

  const handleTimeUpdate = useCallback(
    (time) => {
      const now = Date.now();
      if (now - lastUpdateTime.current < 250) return;
      lastUpdateTime.current = now;
      setCurrentTime(time);

      const minWatchPct = lesson?.minWatchPct || 0.8;
      const dur = playerRef.current?.getDuration?.() || duration;
      if (dur && time / dur > minWatchPct && !videoWatched) {
        setVideoWatched(true);
        onStepComplete?.("video", {
          watched: true,
          timeSpent: time,
          videoId: lesson.id,
        });
      }
    },
    [videoWatched, onStepComplete, lesson, duration]
  );

  const handleDuration = useCallback((d) => {
    if (d) setDuration(d);
  }, []);

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const scheduleHide = useCallback(() => {
    clearHideTimer();
    // не скрываем, если пауза или сейчас скрабим/держим палец на бегунке
    const paused = !isPlaying;
    if (paused || isScrubbing) return;
    hideTimerRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, INACTIVITY_MS);
  }, [clearHideTimer, isPlaying, isScrubbing]);

  const revealControls = useCallback(() => {
    setControlsVisible(true);
    scheduleHide();
  }, [scheduleHide]);

  const handlePlayerReady = useCallback(() => {
    setIsVideoLoading(false);
    setVideoError(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    loadSubtitles();
    setControlsVisible(true);
    scheduleHide(); // <- добавь это
    if (isWelcomeModalOpen) {
      try {
        playerRef.current?.pause?.();
      } catch (_) {}
    }
  }, [loadSubtitles, isWelcomeModalOpen, scheduleHide]);

  const handlePlayerError = useCallback((e) => {
    console.error("Ошибка загрузки видео:", e);
    setIsVideoLoading(false);
    setVideoError(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  const handlePlayerLoadStart = useCallback(() => {
    setIsVideoLoading(true);
    setVideoError(false);
  }, []);

  const handleStateChange = useCallback((e) => {
    const YTSTATE = window.YT?.PlayerState || {};
    const state = e?.data;

    if (state === YTSTATE.PLAYING) setIsPlaying(true);
    if (state === YTSTATE.PAUSED) setIsPlaying(false);

    if (state === YTSTATE.PLAYING) {
      revealControls(); // покажем и запланируем скрытие
    }
    if (state === YTSTATE.PAUSED) {
      setControlsVisible(true); // при паузе всегда показываем
      clearHideTimer();
    }

    // Оверлей ПОСЛЕ окончания
    const ended = state === 0 || state === YTSTATE.ENDED;
    if (ended && !overlayShownRef.current) {
      overlayShownRef.current = true;
      setShowEndOverlay(true);
      try {
        const d = playerRef.current?.getDuration?.();
        if (d) {
          playerRef.current?.seekTo?.(Math.max(0, d - 0.05), true);
          playerRef.current?.pause?.();
        }
      } catch (_) {}
    }
  }, []);

  const seekToTime = useCallback(
    (time) => {
      if (playerRef.current && !isVideoLoading) playerRef.current.seekTo(time);
    },
    [isVideoLoading]
  );

  const play = useCallback(() => playerRef.current?.play?.(), []);
  const pause = useCallback(() => playerRef.current?.pause?.(), []);
  const togglePlay = useCallback(() => {
    if (isPlaying) pause();
    else play();
  }, [isPlaying, play, pause]);

  const onProgressInput = useCallback(
    (e) => {
      const value = Number(e.target.value || 0);
      seekToTime(value);
    },
    [seekToTime]
  );

  useEffect(() => () => clearHideTimer(), [clearHideTimer]);

  const restartFromBeginning = useCallback(() => {
    overlayShownRef.current = false;
    setShowEndOverlay(false);
    playerRef.current?.seekTo?.(0, true);
    if (!isWelcomeModalOpen) {
      playerRef.current?.play?.();
    }
  }, [isWelcomeModalOpen]);

  if (!videoId) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg mx-4">
        <p className="text-gray-500">YouTube видео не найдено</p>
      </div>
    );
  }

  if (videoError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-gray-100 rounded-lg mx-4 space-y-3">
        <p className="text-red-500">Ошибка загрузки видео</p>
        <button
          onClick={() => {
            setVideoError(false);
            setIsVideoLoading(true);
            overlayShownRef.current = false;
            setShowEndOverlay(false);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto pt-8 pb-3 md:py-0">
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 h-full">
        {/* Video area */}
        <div className="w-full lg:flex-1">
          <div className="bg-white rounded-2xl overflow-hidden">
            <div className="relative bg-black">
              {/* Player */}
              <div
                className={`relative w-full h-auto max-h-[70vh] sm:max-h-[60vh] lg:max-h-none object-contain transition-opacity duration-300 ${
                  isVideoLoading
                    ? "opacity-0 absolute inset-0 pointer-events-none"
                    : "opacity-100"
                }`}
                onMouseMove={revealControls}
                onMouseLeave={() => setControlsVisible(false)}
                onTouchStart={revealControls}
                onKeyDown={revealControls}
              >
                <YouTubeFramePlayer
                  ref={playerRef}
                  videoId={videoId}
                  autoPlay={!isWelcomeModalOpen}
                  controls={0} // полностью отключить YouTube контролы
                  suppressRelated={true}
                  useLoop={false}
                  disableKeyboard={true} // отключить клавиши
                  playsinline={true} // для мобильных
                  closedCaptions={false} // отключить встроенные субтитры
                  onReady={handlePlayerReady}
                  onError={handlePlayerError}
                  onTimeUpdate={handleTimeUpdate}
                  onDuration={handleDuration}
                  onLoadStart={handlePlayerLoadStart}
                  onStateChange={handleStateChange}
                />

                {/* 1) Прозрачный слой-блокер — перехватывает клики по логотипу YT, Share, Watch later и т.д. */}
                <div
                  className="absolute inset-0 z-10"
                  onClick={togglePlay}
                  onContextMenu={(e) => e.preventDefault()}
                />

                {/* 2) Наши кастомные контролы поверх */}
                <div
                  className={`absolute left-0 right-0 bottom-0 z-20 p-3 sm:p-4
              bg-gradient-to-t from-black/60 to-transparent
              transition-opacity duration-300
              ${
                controlsVisible
                  ? "opacity-100 pointer-events-auto"
                  : "opacity-0 pointer-events-none"
              }`}
                >
                  <div
                    className="max-w-4xl mx-auto flex items-center gap-3 sm:gap-4"
                    style={{
                      "--color-primary": "#9C45FF",
                      "--color-primary-hover": "#ffffff",
                    }}
                  >
                    {/* Play/Pause */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePlay();
                      }}
                      className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 
               rounded-full bg-[var(--color-primary)] 
               hover:bg-[var(--color-primary-hover)] 
               text-white hover:text-[var(--color-primary)] 
               shadow cursor-pointer"
                      aria-label={isPlaying ? "Пауза" : "Воспроизвести"}
                    >
                      {isPlaying ? (
                        <svg
                          viewBox="0 0 24 24"
                          width="20"
                          height="20"
                          fill="currentColor"
                          className="text-inherit"
                        >
                          <path d="M6 5h4v14H6zm8 0h4v14h-4z" />
                        </svg>
                      ) : (
                        <svg
                          viewBox="0 0 24 24"
                          width="20"
                          height="20"
                          fill="currentColor"
                          className="text-inherit"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </button>

                    {/* Прогресс */}
                    <input
                      type="range"
                      min={0}
                      max={duration || 0}
                      step={0.1}
                      value={currentTime}
                      onChange={(e) => {
                        e.stopPropagation();
                        onProgressInput(e);
                      }}
                      onMouseDown={() => {
                        setIsScrubbing(true);
                        clearHideTimer();
                      }}
                      onMouseUp={() => {
                        setIsScrubbing(false);
                        scheduleHide();
                      }}
                      onTouchStart={() => {
                        setIsScrubbing(true);
                        clearHideTimer();
                      }}
                      onTouchEnd={() => {
                        setIsScrubbing(false);
                        scheduleHide();
                      }}
                      className="flex-1 accent-white/95 h-2 rounded-full cursor-pointer"
                    />

                    {/* Время */}
                    <div className="hidden sm:block text-xs text-white/90 tabular-nums min-w-[90px] text-right">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </div>
                  </div>
                </div>

                {showEndOverlay && (
                  <EndOverlay
                    onRestart={restartFromBeginning}
                    onClose={() => setShowEndOverlay(false)}
                  />
                )}
              </div>
            </div>

            {/* Title and Transcript */}
            <div className="p-4 lg:p-6">
              {isVideoLoading ? (
                <div className="space-y-4">
                  <div
                    className="skeleton text-skeleton text-skeleton-title"
                    style={{ width: "75%" }}
                  />
                  <div
                    className="skeleton text-skeleton text-skeleton-line"
                    style={{ width: "40%" }}
                  />
                  <div className="space-y-2">
                    <div
                      className="skeleton text-skeleton text-skeleton-line"
                      style={{ width: "90%" }}
                    />
                    <div
                      className="skeleton text-skeleton text-skeleton-line"
                      style={{ width: "85%" }}
                    />
                    <div
                      className="skeleton text-skeleton text-skeleton-line"
                      style={{ width: "70%" }}
                    />
                  </div>
                </div>
              ) : (
                <>
                  {lesson.title && (
                    <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3">
                      {lesson.title}
                    </h2>
                  )}
                  {lesson.transcript && (
                    <div className="text-gray-700 leading-relaxed">
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Сабақ мазмұны
                      </h3>
                      <p className="text-sm">{lesson.transcript}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Subtitles Panel with Skeleton */}
        <div className="w-full lg:w-80 xl:w-96">
          {(subtitlesLoading || isVideoLoading) && isDesktop ? (
            <SubtitlesSkeleton />
          ) : subtitles.length > 0 ? (
            <SubtitlePanel
              subtitles={subtitles}
              currentTime={currentTime}
              onSeekToTime={seekToTime}
              className="h-full"
            />
          ) : null}
        </div>
      </div>
    </div>
  );
};

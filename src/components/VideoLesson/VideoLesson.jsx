import { useCallback, useEffect, useRef, useState } from "react";
import "react-loading-skeleton/dist/skeleton.css";
import "./skeleton.css";
import { SubtitlePanel } from "./VideoSubtitle";

// Скелетон для панели субтитров
const SubtitlesSkeleton = () => {
  return (
    <div className="w-full max-h-120 md:max-h-155 bg-white rounded-2xl border border-gray-100 flex flex-col h-full">
      {/* Шапка скелетона */}
      <div className="flex-shrink-0 p-5 border-b border-gray-50">
        <div className="flex items-center justify-between gap-3">
          <div
            className="skeleton text-skeleton"
            style={{ width: "120px", height: "20px" }}
          ></div>
          <div className="flex items-center gap-2">
            <div className="skeleton w-8 h-8 rounded-xl"></div>
            <div className="skeleton w-8 h-8 rounded-xl"></div>
          </div>
        </div>
      </div>

      {/* Активный субтитр скелетон */}
      <div className="flex-shrink-0 px-5 py-4">
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
          <div className="space-y-2">
            <div
              className="skeleton text-skeleton"
              style={{ width: "90%", height: "16px" }}
            ></div>
            <div
              className="skeleton text-skeleton"
              style={{ width: "75%", height: "16px" }}
            ></div>
          </div>
        </div>
      </div>

      {/* Список субтитров скелетон */}
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
                ></div>
                <div className="skeleton w-2 h-2 rounded-full bg-[#9C45FF] opacity-60"></div>
              </div>
              <div className="space-y-1">
                <div
                  className="skeleton text-skeleton"
                  style={{
                    width: `${85 + Math.random() * 15}%`,
                    height: "14px",
                  }}
                ></div>
                {Math.random() > 0.4 && (
                  <div
                    className="skeleton text-skeleton"
                    style={{
                      width: `${60 + Math.random() * 25}%`,
                      height: "14px",
                    }}
                  ></div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

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

  const [subtitles, setSubtitles] = useState([]);
  const [subtitlesLoading, setSubtitlesLoading] = useState(true);

  const videoRef = useRef(null);
  const timeoutRef = useRef(null);
  const lastUpdateTime = useRef(0);
  const [isDesktop, setIsDesktop] = useState(false);

  // Принудительное скрытие скелетона через таймаут
  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      if (isVideoLoading) {
        console.warn("Видео загружается слишком долго, скрываем скелетон");
        setIsVideoLoading(false);
      }
    }, 4000); // 4 секунды максимум

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isVideoLoading]);

  useEffect(() => {
    const handleResize = () => {
      // Используем медиа-запрос, чтобы определить, является ли экран десктопным
      const isLargeScreen = window.matchMedia("(min-width: 1024px)").matches;
      setIsDesktop(isLargeScreen);
    };

    // Устанавливаем начальное значение
    handleResize();

    // Добавляем слушатель событий
    window.addEventListener("resize", handleResize);

    // Очищаем слушатель событий
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Загрузка субтитров после успешной загрузки видео
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

  // Оптимизированное обновление времени с дебаунсом
  const updateTime = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const time = video.currentTime;
    const now = Date.now();

    // Обновляем не чаще чем каждые 250мс
    if (now - lastUpdateTime.current < 250) return;
    lastUpdateTime.current = now;

    setCurrentTime(time);

    const minWatchPct = lesson?.minWatchPct || 0.8;
    if (video.duration && time / video.duration > minWatchPct) {
      if (!videoWatched) {
        setVideoWatched(true);
        onStepComplete?.("video", {
          watched: true,
          timeSpent: time,
          videoId: lesson.id,
        });
      }
    }
  }, [videoWatched, onStepComplete, lesson]);

  const updateDuration = useCallback(() => {
    const video = videoRef.current;
    if (video?.duration) {
      setDuration(video.duration);
    }
  }, []);

  // Обработчики видео
  const handleVideoCanPlay = useCallback(() => {
    setIsVideoLoading(false);
    setVideoError(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    // Загружаем субтитры только после готовности видео
    loadSubtitles();
  }, [loadSubtitles]);

  const handleVideoError = useCallback((e) => {
    console.error("Ошибка загрузки видео:", e);
    setIsVideoLoading(false);
    setVideoError(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const handleVideoLoadStart = useCallback(() => {
    setIsVideoLoading(true);
    setVideoError(false);
  }, []);

  // Настройка слушателей видео
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.addEventListener("timeupdate", updateTime);
    video.addEventListener("loadedmetadata", updateDuration);
    video.addEventListener("canplay", handleVideoCanPlay);
    video.addEventListener("error", handleVideoError);
    video.addEventListener("loadstart", handleVideoLoadStart);

    return () => {
      video.removeEventListener("timeupdate", updateTime);
      video.removeEventListener("loadedmetadata", updateDuration);
      video.removeEventListener("canplay", handleVideoCanPlay);
      video.removeEventListener("error", handleVideoError);
      video.removeEventListener("loadstart", handleVideoLoadStart);
    };
  }, [
    updateTime,
    updateDuration,
    handleVideoCanPlay,
    handleVideoError,
    handleVideoLoadStart,
  ]);

  const seekToTime = useCallback(
    (time) => {
      const video = videoRef.current;
      if (video && !isVideoLoading) {
        video.currentTime = time;
      }
    },
    [isVideoLoading]
  );

  // Проверка наличия необходимых данных
  if (!lesson?.mediaUrl) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg mx-4">
        <p className="text-gray-500">Видео не найдено</p>
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
            if (videoRef.current) {
              videoRef.current.load();
            }
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
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
              {/* Video Skeleton - совпадает с размерами видео */}
              {isVideoLoading && (
                <div className="w-full max-h-[70vh] sm:max-h-[60vh] lg:max-h-none aspect-video relative video-skeleton overflow-hidden">
                  <div className="absolute inset-0">
                    <div className="play-button-skeleton"></div>
                    <div className="controls-skeleton">
                      <div className="control-button-skeleton"></div>
                      <div className="progress-bar-skeleton"></div>
                      <div className="control-button-skeleton"></div>
                      <div className="control-button-skeleton"></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Video */}
              <video
                ref={videoRef}
                className={`w-full h-auto max-h-[70vh] sm:max-h-[60vh] lg:max-h-none object-contain transition-opacity duration-300 ${
                  isVideoLoading
                    ? "opacity-0 absolute inset-0 pointer-events-none"
                    : "opacity-100"
                }`}
                controls
                autoPlay={!isWelcomeModalOpen}
                preload="auto"
                controlsList="nodownload"
                onContextMenu={(e) => e.preventDefault()}
                disablePictureInPicture
                disableRemotePlayback
                playsInline
                poster={lesson.posterUrl} // Если есть постер
              >
                <source src={lesson.mediaUrl} type="video/mp4" />
                Ваш браузер не поддерживает видео HTML5.
              </video>
            </div>

            {/* Title and Transcript */}
            <div className="p-4 lg:p-6">
              {isVideoLoading ? (
                <div className="space-y-4">
                  <div
                    className="skeleton text-skeleton text-skeleton-title"
                    style={{ width: "75%" }}
                  ></div>
                  <div
                    className="skeleton text-skeleton text-skeleton-line"
                    style={{ width: "40%" }}
                  ></div>
                  <div className="space-y-2">
                    <div
                      className="skeleton text-skeleton text-skeleton-line"
                      style={{ width: "90%" }}
                    ></div>
                    <div
                      className="skeleton text-skeleton text-skeleton-line"
                      style={{ width: "85%" }}
                    ></div>
                    <div
                      className="skeleton text-skeleton text-skeleton-line"
                      style={{ width: "70%" }}
                    ></div>
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
        <div className="  w-full lg:w-80 xl:w-96">
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

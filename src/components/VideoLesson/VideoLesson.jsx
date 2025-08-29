import { useCallback, useEffect, useRef, useState } from "react";
import "react-loading-skeleton/dist/skeleton.css";
import "./skeleton.css";
import { SubtitlePanel } from "./VideoSubtitle";

// Скелетон для панели субтитров (оставил ваш компонент без изменений)
const SubtitlesSkeleton = () => {
  return (
    <div className="w-full max-h-120 md:max-h-155 bg-white rounded-2xl border border-gray-100 flex flex-col h-full">
      {/* ... ваш код скелетона (как у вас выше) ... */}
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

// ---- Хелперы для YouTube ----
const isYouTubeUrl = (url = "") => {
  if (!url) return false;
  return /(?:youtube\.com|youtu\.be)/i.test(url);
};

const getYouTubeId = (url = "") => {
  if (!url) return null;
  // Поддерживаем разные форматы: youtu.be/ID, v=ID, embed/ID
  const regex =
    /(?:youtube\.com\/(?:watch\?.*v=|embed\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/;
  const m = url.match(regex);
  return m ? m[1] : null;
};

// Загружает YT Iframe API один раз и возвращает Promise, который резолвится, когда YT готов
const loadYouTubeIframeAPI = (() => {
  let promise = null;
  return () => {
    if (typeof window === "undefined") return Promise.reject();
    if (window.YT && window.YT.Player) return Promise.resolve(window.YT);
    if (promise) return promise;

    promise = new Promise((resolve, reject) => {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      tag.onerror = () => reject(new Error("YT script load error"));
      document.head.appendChild(tag);

      // YT вызовет window.onYouTubeIframeAPIReady
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (typeof prev === "function") prev();
        resolve(window.YT);
      };
      // Safety: если скрипт уже был загружен и YT доступен
      setTimeout(() => {
        if (window.YT && window.YT.Player) resolve(window.YT);
      }, 1000);
    });

    return promise;
  };
})();

// ---- Компонент ----
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

  const videoRef = useRef(null); // для <video>
  const ytContainerRef = useRef(null); // контейнер для iframe
  const ytPlayerRef = useRef(null); // YT player instance
  const pollingRef = useRef(null); // интервал опроса времени для YT
  const timeoutRef = useRef(null);
  const lastUpdateTime = useRef(0);
  const [isDesktop, setIsDesktop] = useState(false);

  // Определяем, является ли mediaUrl YouTube
  const mediaUrl = lesson?.mediaUrl;
  const isYouTube = isYouTubeUrl(mediaUrl);
  const youTubeId = isYouTube ? getYouTubeId(mediaUrl) : null;

  // Принудительное скрытие скелетона через таймаут
  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      if (isVideoLoading) {
        console.warn("Видео загружается слишком долго, скрываем скелетон");
        setIsVideoLoading(false);
      }
    }, 4000); // 4 секунды максимум

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isVideoLoading]);

  useEffect(() => {
    const handleResize = () => {
      const isLargeScreen = window.matchMedia("(min-width: 1024px)").matches;
      setIsDesktop(isLargeScreen);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Загрузка субтитров
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

  // Общая логика обновления времени (дебаунс: не чаще 250мс)
  const setCurrentTimeDebounced = useCallback(
    (time) => {
      const now = Date.now();
      if (now - lastUpdateTime.current < 250) return;
      lastUpdateTime.current = now;
      setCurrentTime(time);

      const minWatchPct = lesson?.minWatchPct || 0.8;
      if (duration && time / duration > minWatchPct) {
        if (!videoWatched) {
          setVideoWatched(true);
          onStepComplete?.("video", {
            watched: true,
            timeSpent: time,
            videoId: lesson.id,
          });
        }
      }
    },
    [videoWatched, onStepComplete, lesson, duration]
  );

  // ---- YouTube: создание/уничтожение плеера ----
  useEffect(() => {
    // если не YouTube — ничего не делаем
    if (!isYouTube || !youTubeId) return;

    let cancelled = false;
    setIsVideoLoading(true);
    setVideoError(false);

    loadYouTubeIframeAPI()
      .then((YT) => {
        if (cancelled) return;
        // Создаём контейнер в DOM, инициализируем player
        ytPlayerRef.current = new YT.Player(ytContainerRef.current, {
          videoId: youTubeId,
          playerVars: {
            controls: 1,
            modestbranding: 1,
            rel: 0,
            playsinline: 1,
            autoplay: isWelcomeModalOpen ? 0 : 1,
            disablekb: 1,
          },
          events: {
            onReady: (event) => {
              const player = event.target;
              try {
                const dur = player.getDuration();
                if (dur) setDuration(dur);
              } catch (e) {}
              setIsVideoLoading(false);
              setVideoError(false);
              loadSubtitles();

              // ---- NEW: force iframe to fill container and be visible ----
              try {
                const iframe = player.getIframe();
                if (iframe) {
                  // Если хотите "cover" — используйте absolute внутри родителя с position:relative
                  iframe.style.width = "100%";
                  iframe.style.height = "100%";
                  iframe.style.display = "block";
                  // вариант: сделать абсолютным и натянуть по всем сторонам
                  // iframe.style.position = "absolute";
                  // iframe.style.top = "0";
                  // iframe.style.left = "0";
                }
              } catch (e) {
                // ничего страшного, просто лог
                console.warn("Не удалось применить стили к iframe", e);
              }

              // Начинаем опрос
              startYTPolling();
            },

            onStateChange: (event) => {
              // YT states: -1 unstarted, 0 ended, 1 playing, 2 paused, 3 buffering, 5 cued
              const state = event.data;
              if (state === 1) {
                // playing
                startYTPolling();
              } else {
                stopYTPolling();
                // обновим текущее время разово
                try {
                  const t = ytPlayerRef.current.getCurrentTime();
                  setCurrentTimeDebounced(t);
                } catch (e) {}
              }
              // при окончании (0) можно пометить watched
              if (state === 0) {
                try {
                  const t = ytPlayerRef.current.getCurrentTime();
                  setCurrentTimeDebounced(t);
                } catch (e) {}
              }
            },
            onError: (e) => {
              console.error("YT player error", e);
              setVideoError(true);
              setIsVideoLoading(false);
            },
          },
        });
      })
      .catch((err) => {
        console.error("Не удалось загрузить YouTube API:", err);
        setVideoError(true);
        setIsVideoLoading(false);
      });

    // Polling: опрашиваем текущее время каждую 250ms когда видео играет
    const startYTPolling = () => {
      stopYTPolling();
      pollingRef.current = setInterval(() => {
        try {
          if (ytPlayerRef.current && ytPlayerRef.current.getCurrentTime) {
            const t = ytPlayerRef.current.getCurrentTime();
            setCurrentTimeDebounced(t);
          }
        } catch (e) {}
      }, 250);
    };

    const stopYTPolling = () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };

    // Когда делаем cleanup
    return () => {
      cancelled = true;
      if (ytPlayerRef.current && ytPlayerRef.current.destroy) {
        ytPlayerRef.current.destroy();
        ytPlayerRef.current = null;
      }
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isYouTube, youTubeId, isWelcomeModalOpen, loadSubtitles]);

  // ---- Нативное <video> слушатели (как у вас были) ----
  useEffect(() => {
    if (isYouTube) return; // для YT мы не трогаем нативное video
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => {
      const time = video.currentTime;
      setCurrentTimeDebounced(time);
    };

    const updateDuration = () => {
      if (video.duration) setDuration(video.duration);
    };

    const handleVideoCanPlay = () => {
      setIsVideoLoading(false);
      setVideoError(false);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      loadSubtitles();
    };

    const handleVideoError = (e) => {
      console.error("Ошибка загрузки видео:", e);
      setIsVideoLoading(false);
      setVideoError(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };

    const handleVideoLoadStart = () => {
      setIsVideoLoading(true);
      setVideoError(false);
    };

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
  }, [isYouTube, setCurrentTimeDebounced, loadSubtitles]);

  // Seek: универсальная функция
  const seekToTime = useCallback(
    (time) => {
      if (isYouTube) {
        try {
          if (ytPlayerRef.current && ytPlayerRef.current.seekTo) {
            // second param true -> allowSeekAhead
            ytPlayerRef.current.seekTo(time, true);
          }
        } catch (e) {
          console.error("YT seek error", e);
        }
      } else {
        const video = videoRef.current;
        if (video && !isVideoLoading) {
          video.currentTime = time;
        }
      }
    },
    [isYouTube, isVideoLoading]
  );

  // Простейшая логика загрузки: если нет mediaUrl show placeholder
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
            // для YT: пересоздадим плеер (удалить и нарисовать заново) — здесь просто попробуем reload
            if (isYouTube) {
              try {
                if (ytPlayerRef.current && ytPlayerRef.current.loadVideoById) {
                  ytPlayerRef.current.loadVideoById(youTubeId);
                }
              } catch (e) {}
            } else if (videoRef.current) {
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

  // Разметка: условно рендерим либо <video>, либо YT iframe-контейнер
  return (
    <div className="w-full mx-auto pt-8 pb-3 md:py-0">
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 h-full">
        {/* Video area */}
        <div className="w-full lg:flex-1">
          <div className="bg-white rounded-2xl overflow-hidden">
            <div className="relative bg-black">
              {/* Skeleton для обоих типов */}
              {/* {isVideoLoading && (
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
              )} */}

              {/* Если YouTube — контейнер для iframe */}
              {isYouTube ? (
                <div
                  ref={ytContainerRef}
                  className={`w-full h-auto max-h-[70vh] sm:max-h-[60vh] lg:max-h-none object-contain transition-opacity duration-300 ${
                    isVideoLoading
                      ? "opacity-0 pointer-events-none"
                      : "opacity-100"
                  }`}
                  style={{ minHeight: "400px" }}
                />
              ) : (
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
                  poster={lesson.posterUrl}
                >
                  <source src={lesson.mediaUrl} type="video/mp4" />
                  Ваш браузер не поддерживает видео HTML5.
                </video>
              )}
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

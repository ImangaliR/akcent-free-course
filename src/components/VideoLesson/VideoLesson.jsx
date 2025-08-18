import { useEffect, useRef, useState } from "react";
import { SubtitlePanel } from "./VideoSubtitle";

export const VideoLessonWithSubtitles = ({ lesson, onStepComplete }) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [videoWatched, setVideoWatched] = useState(false);

  // Состояние для субтитров
  const [subtitles, setSubtitles] = useState([]);
  const [subtitlesLoading, setSubtitlesLoading] = useState(true);

  const videoRef = useRef(null);

  // Загрузка субтитров
  useEffect(() => {
    const loadSubtitles = async () => {
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
    };

    loadSubtitles();
  }, [lesson?.id]);

  // Обновление времени видео
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => {
      const time = video.currentTime;
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
    };

    const updateDuration = () => setDuration(video.duration);

    video.addEventListener("timeupdate", updateTime);
    video.addEventListener("loadedmetadata", updateDuration);

    return () => {
      video.removeEventListener("timeupdate", updateTime);
      video.removeEventListener("loadedmetadata", updateDuration);
    };
  }, [videoWatched, onStepComplete, lesson]);

  const seekToTime = (time) => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = time;
    }
  };

  // Проверка наличия обязательных данных
  if (!lesson?.mediaUrl) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg mx-4">
        <p className="text-gray-500">Видео не найдено</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      {/* Mobile: Вертикальная компоновка, Desktop: Горизонтальная */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 h-full">
        {/* Видео область */}
        <div className="w-full lg:flex-1">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Заголовок */}
            <div className="p-3 sm:p-4 border-b">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 leading-tight">
                {lesson.title}
              </h3>
              {lesson.description && (
                <p className="text-gray-600 text-sm mt-1 line-clamp-2 sm:line-clamp-none">
                  {lesson.description}
                </p>
              )}

              {/* Статусы */}
              <div className="flex flex-wrap items-center gap-3 mt-2">
                {videoWatched && (
                  <div className="flex items-center gap-2 text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm">Видео просмотрено</span>
                  </div>
                )}
                {subtitlesLoading && (
                  <div className="flex items-center gap-2 text-blue-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    <span className="text-sm">Загрузка субтитров...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Видео плеер с нативными контролами */}
            <div className="relative bg-black">
              <video
                ref={videoRef}
                className="w-full h-auto max-h-[50vh] sm:max-h-[60vh] lg:max-h-none object-contain"
                controls
                autoPlay
                preload="metadata"
                controlsList="nodownload"
                onContextMenu={(e) => e.preventDefault()}
                disablePictureInPicture
                disableRemotePlayback
                playsInline
              >
                <source src={lesson.mediaUrl} type="video/mp4" />
                Ваш браузер не поддерживает видео HTML5.
              </video>
            </div>
          </div>
        </div>

        {/* Панель субтитров */}
        {!subtitlesLoading && subtitles.length > 0 && (
          <div className="w-full lg:w-80 xl:w-96">
            <SubtitlePanel
              subtitles={subtitles}
              currentTime={currentTime}
              onSeekToTime={seekToTime}
              className="h-full"
            />
          </div>
        )}
      </div>
    </div>
  );
};

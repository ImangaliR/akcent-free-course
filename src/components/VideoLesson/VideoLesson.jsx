import { useEffect, useRef, useState } from "react";
import { SubtitlePanel } from "./VideoSubtitle";

export const VideoLessonWithSubtitles = ({ lesson, onStepComplete }) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [videoWatched, setVideoWatched] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(true); // Add state for video loading

  const [subtitles, setSubtitles] = useState([]);
  const [subtitlesLoading, setSubtitlesLoading] = useState(true);

  const videoRef = useRef(null);

  // Load subtitles
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

  // Update video time
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

  // Handle video loading state
  const handleVideoLoaded = () => {
    setIsVideoLoading(false);
  };

  const seekToTime = (time) => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = time;
    }
  };

  // Check if required data is present
  if (!lesson?.mediaUrl) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg mx-4">
        <p className="text-gray-500">Видео не найдено</p>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto pt-8 pb-3 md:py-0">
      {/* Mobile: Вертикальная компоновка, Desktop: Горизонтальная */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 h-full">
        {/* Video area */}
        <div className="w-full lg:flex-1">
          <div className="bg-white rounded-2xl overflow-hidden">
            <div className="relative bg-black">
              {/* Video Placeholder */}
              {isVideoLoading && (
                <div className="w-full bg-gray-300 pb-[56.25%]">
                  {/* You can add a loading animation here if needed */}
                </div>
              )}

              {/* Video */}
              <video
                ref={videoRef}
                className={`w-full h-auto max-h-[70vh] sm:max-h-[60vh] lg:max-h-none object-contain ${
                  isVideoLoading ? "hidden" : "block"
                }`}
                controls
                autoPlay
                preload="metadata"
                controlsList="nodownload"
                onContextMenu={(e) => e.preventDefault()}
                disablePictureInPicture
                disableRemotePlayback
                playsInline
                onLoadedData={handleVideoLoaded} // Trigger loading state change
              >
                <source src={lesson.mediaUrl} type="video/mp4" />
                Ваш браузер не поддерживает видео HTML5.
              </video>
            </div>

            {/* Title and Transcript */}
            <div className="p-4 lg:p-6">
              {lesson.title && (
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3">
                  {lesson.title}
                </h2>
              )}
              {lesson.transcript && (
                <div className="text-gray-700 leading-relaxed">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Описание урока
                  </h3>
                  <p className="text-base">{lesson.transcript}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Subtitles Panel */}
        {!subtitlesLoading && subtitles.length > 0 && (
          <div className="md:block w-full lg:w-80 xl:w-96">
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

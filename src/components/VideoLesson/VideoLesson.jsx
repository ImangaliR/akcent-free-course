import {
  Maximize,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume1,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { SubtitlePanel } from "./VideoSubtitle";

export const VideoLessonWithSubtitles = ({ lesson, onStepComplete }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
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
  }, [videoWatched, onStepComplete, lesson, subtitles]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    videoRef.current.volume = newVolume;
  };

  const handleSeek = (e) => {
    const video = videoRef.current;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    video.currentTime = pos * duration;
  };

  const skipTime = (seconds) => {
    const video = videoRef.current;
    video.currentTime = Math.max(
      0,
      Math.min(duration, video.currentTime + seconds)
    );
  };

  const seekToTime = (time) => {
    const video = videoRef.current;
    video.currentTime = time;
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Проверка наличия обязательных данных
  if (!lesson?.mediaUrl) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
        <p className="text-gray-500">Видео не найдено</p>
      </div>
    );
  }

  return (
    <div className="flex gap-6 h-full">
      {/* Видео область */}
      <div className="flex-1">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Заголовок */}
          <div className="p-4 border-b">
            <h3 className="text-xl font-bold text-gray-800">{lesson.title}</h3>
            {lesson.description && (
              <p className="text-gray-600 text-sm mt-1">{lesson.description}</p>
            )}
            {videoWatched && (
              <div className="flex items-center gap-2 mt-2 text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm">Видео просмотрено</span>
              </div>
            )}
            {subtitlesLoading && (
              <div className="flex items-center gap-2 mt-2 text-blue-600">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-sm">Загрузка субтитров...</span>
              </div>
            )}
          </div>

          {/* Видео плеер */}
          <div className="relative bg-black">
            <video
              ref={videoRef}
              className="w-full h-100 object-cover"
              onClick={togglePlay}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            >
              <source src={lesson.mediaUrl} type="video/mp4" />
              Ваш браузер не поддерживает видео HTML5.
            </video>

            {/* Кнопка воспроизведения */}
            {!isPlaying && (
              <button
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-50 transition-opacity"
              >
                <div className="bg-white bg-opacity-90 rounded-full p-4">
                  <Play size={32} className="text-gray-800 ml-1" />
                </div>
              </button>
            )}
          </div>

          {/* Элементы управления */}
          <div className="p-4 bg-gray-50">
            {/* Прогресс бар */}
            <div
              className="w-full h-2 bg-gray-300 rounded-full cursor-pointer mb-4 relative"
              onClick={handleSeek}
            >
              <div
                className="h-full bg-blue-600 rounded-full"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => skipTime(-10)}
                  className="p-2 hover:bg-gray-200 rounded-full"
                  title="Назад на 10 секунд"
                >
                  <SkipBack size={18} />
                </button>

                <button
                  onClick={togglePlay}
                  className="p-2 hover:bg-gray-200 rounded-full"
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </button>

                <button
                  onClick={() => skipTime(10)}
                  className="p-2 hover:bg-gray-200 rounded-full"
                  title="Вперед на 10 секунд"
                >
                  <SkipForward size={18} />
                </button>

                <button
                  onClick={toggleMute}
                  className="p-2 hover:bg-gray-200 rounded-full"
                >
                  {isMuted ? (
                    <VolumeX size={20} />
                  ) : volume > 0.5 ? (
                    <Volume2 size={20} />
                  ) : (
                    <Volume1 size={20} />
                  )}
                </button>

                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-20"
                />

                <div className="text-sm text-gray-600 font-mono">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* Скорость воспроизведения */}

                <button className="p-2 hover:bg-gray-200 rounded-full">
                  <Maximize size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Панель субтитров */}
      {!subtitlesLoading && subtitles.length > 0 && (
        <SubtitlePanel
          subtitles={subtitles}
          currentTime={currentTime}
          onSeekToTime={seekToTime}
        />
      )}
    </div>
  );
};

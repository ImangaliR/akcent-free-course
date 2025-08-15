// components/VideoLesson/VideoLessonWithSubtitles.jsx
import {
  Maximize,
  Pause,
  Play,
  Settings,
  SkipBack,
  SkipForward,
  Volume1,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { SubtitlePanel } from "./VideoSubtitle";

// Тестовые данные субтитров
const testSubtitles = [
  {
    id: 1,
    start: 0,
    end: 3.5,
    russian: "Привет! Меня зовут Анна.",
    english: "Hi! My name is Anna.",
    words: [
      { word: "Привет", translation: "Hi/Hello", start: 0, end: 1 },
      { word: "Меня", translation: "me (accusative)", start: 1.2, end: 1.8 },
      { word: "зовут", translation: "call/name", start: 2, end: 2.8 },
      { word: "Анна", translation: "Anna", start: 3, end: 3.5 },
    ],
  },
  {
    id: 2,
    start: 4,
    end: 8,
    russian: "Добро пожаловать на урок русского языка.",
    english: "Welcome to the Russian language lesson.",
    words: [
      { word: "Добро пожаловать", translation: "Welcome", start: 4, end: 5.5 },
      { word: "на", translation: "to/on", start: 5.6, end: 5.8 },
      { word: "урок", translation: "lesson", start: 6, end: 6.5 },
      {
        word: "русского",
        translation: "Russian (genitive)",
        start: 6.8,
        end: 7.3,
      },
      { word: "языка", translation: "language", start: 7.4, end: 8 },
    ],
  },
  {
    id: 3,
    start: 9,
    end: 13,
    russian: "Сегодня мы изучаем приветствие и знакомство.",
    english: "Today we learn greetings and introductions.",
    words: [
      { word: "Сегодня", translation: "Today", start: 9, end: 9.8 },
      { word: "мы", translation: "we", start: 10, end: 10.3 },
      { word: "изучаем", translation: "we learn", start: 10.5, end: 11.2 },
      { word: "приветствие", translation: "greeting", start: 11.5, end: 12.2 },
      { word: "знакомство", translation: "introduction", start: 12.4, end: 13 },
    ],
  },
  {
    id: 4,
    start: 14,
    end: 18,
    russian: "Давайте начнем с простых фраз.",
    english: "Let's start with simple phrases.",
    words: [
      { word: "Давайте", translation: "Let's", start: 14, end: 14.8 },
      { word: "начнем", translation: "start", start: 15, end: 15.8 },
      { word: "с", translation: "with", start: 16, end: 16.2 },
      { word: "простых", translation: "simple", start: 16.4, end: 17.2 },
      { word: "фраз", translation: "phrases", start: 17.4, end: 18 },
    ],
  },
];

export const VideoLessonWithSubtitles = ({ lesson, onStepComplete }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [videoWatched, setVideoWatched] = useState(false);

  const videoRef = useRef(null);

  // Обновление времени видео
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => {
      const time = video.currentTime;
      setCurrentTime(time);

      // Отмечаем как просмотренное, если досмотрели 80%
      if (video.duration && time / video.duration > 0.8) {
        if (!videoWatched) {
          setVideoWatched(true);
          onStepComplete?.("video", { watched: true, timeSpent: time });
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
  }, [videoWatched, onStepComplete]);

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

  const handleSpeedChange = (speed) => {
    videoRef.current.playbackRate = speed;
    setPlaybackRate(speed);
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

  return (
    <div className="flex gap-6 h-full">
      {/* Видео область */}
      <div className="flex-1">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Заголовок */}
          <div className="p-4 border-b">
            <h3 className="text-xl font-bold text-gray-800">{lesson.title}</h3>
            <p className="text-gray-600 text-sm mt-1">{lesson.description}</p>
            {videoWatched && (
              <div className="flex items-center gap-2 mt-2 text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm">Видео просмотрено</span>
              </div>
            )}
          </div>

          {/* Видео плеер */}
          <div className="relative bg-black">
            <video
              ref={videoRef}
              className="w-full h-80 object-cover"
              onClick={togglePlay}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            >
              <source
                src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                type="video/mp4"
              />
            </video>

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

            {/* Основные элементы управления */}
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
                <select
                  value={playbackRate}
                  onChange={(e) =>
                    handleSpeedChange(parseFloat(e.target.value))
                  }
                  className="text-xs border rounded px-2 py-1 bg-white"
                >
                  <option value={0.5}>0.5x</option>
                  <option value={0.75}>0.75x</option>
                  <option value={1}>1x</option>
                  <option value={1.25}>1.25x</option>
                  <option value={1.5}>1.5x</option>
                </select>

                <button className="p-2 hover:bg-gray-200 rounded-full">
                  <Settings size={18} />
                </button>

                <button className="p-2 hover:bg-gray-200 rounded-full">
                  <Maximize size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Панель субтитров */}
      <SubtitlePanel
        subtitles={testSubtitles}
        currentTime={currentTime}
        onSeekToTime={seekToTime}
      />
    </div>
  );
};

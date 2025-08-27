import Lottie from "lottie-react";
import { CheckCircle, Zap } from "lucide-react";
import { useEffect, useRef } from "react";
import { useCourse } from "../../context/CourseContext";

export const FeedbackRenderer = ({ lesson, onComplete, onAdvance }) => {
  const { getCourseStats } = useCourse();
  const stats = getCourseStats();
  const videoRef = useRef(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
      const handleEnded = () => onComplete({ watched: true });
      videoElement.addEventListener("ended", handleEnded);
      return () => videoElement.removeEventListener("ended", handleEnded);
    }
  }, [onComplete]);

  const benefits = [
    "деңгей анықтау",
    "жеке мұғалім",
    "жеке оқу методикасы",
    "білмей жүрген тақырыптарды түсіндіріп береді",
    "бонустар аласыз",
  ];

  return (
    <div className="w-full max-w-8xl mx-auto p-6 md:p-8 pt-8 md:pt-6 bg-gradient-to-br from-purple-50 via-white to-blue-50 rounded-2xl border border-purple-100 relative overflow-hidden">
      <div className="text-center mb-6 relative">
        <h2 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-[#9C45FF] [#9C45FF] to-[#9C45FF] bg-clip-text text-transparent mb-2">
          Курс аяқталды!
        </h2>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Видео блок */}
        <div className="w-full max-w-xs mx-auto md:mx-0 md:w-48 lg:w-66 flex-shrink-0">
          <div className="relative w-full overflow-hidden rounded-2xl bg-black shadow-2xl border-4 border-gradient-to-r from-purple-400 to-blue-400">
            <div className="absolute inset-0 z-10 pointer-events-none">
              <Lottie loop={false} autoplay className="w-full h-full" />
            </div>
            <div className="w-full pb-[165.77%] relative">
              <video
                ref={videoRef}
                src={lesson.videoUrl}
                className="absolute top-0 left-0 w-full h-full object-cover"
                controls
                playsInline
                autoPlay
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
          </div>
        </div>

        {/* Блок преимуществ */}
        <div className="flex-1 w-full space-y-4">
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-2xl border border-emerald-200 shadow-lg">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Сен үшін артықшылықтар
              </span>
            </h3>
            <ul className="space-y-3">
              {benefits.map((benefit, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/50 transition-colors"
                >
                  <div className="p-1 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm text-gray-800 font-medium leading-relaxed">
                    {benefit}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Кнопка */}
          <a
            href="https://wa.me/77074945051?text=%D0%94%D0%B5%D2%A3%D0%B3%D0%B5%D0%B9%D1%96%D0%BC%D0%B4%D1%96%20%D0%B0%D0%BD%D1%8B%D2%9B%D1%82%D0%B0%D2%93%D1%8B%D0%BC%20%D0%BA%D0%B5%D0%BB%D0%B5%D0%B4%D1%96"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full"
          >
            <button className="w-full px-8 py-4 rounded-2xl text-lg font-bold text-white bg-[#9C45FF] hover:bg-[#7f43c4] transition-all duration-300 transform hover:scale-[1.01] relative overflow-hidden cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
              <span className="relative flex items-center justify-center gap-2">
                Деңгей анықтауға өту
              </span>
            </button>
          </a>
        </div>
      </div>
    </div>
  );
};

import { CheckCircle, Pause, Play, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export const AudioTask = ({ lesson, onStepComplete }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayedAudio, setHasPlayedAudio] = useState(false);

  const audioRef = useRef(null);

  const handlePlayAudio = () => {
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
      setHasPlayedAudio(true);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => setIsPlaying(false);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("pause", handlePause);

    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("pause", handlePause);
    };
  }, []);

  const handleOptionSelect = (index) => {
    if (isSubmitted) return;
    setSelectedOption(index);
  };

  const handleSubmit = () => {
    if (selectedOption === null) return;

    setIsSubmitted(true);

    const isCorrect = selectedOption === lesson.answer;

    setTimeout(() => {
      setIsCompleted(true);
      onStepComplete?.("audiotask", {
        completed: true,
        correct: isCorrect,
        selectedAnswer: selectedOption,
        correctAnswer: lesson.answer,
        hasPlayedAudio,
      });
    }, 1000);
  };

  const handleTryAgain = () => {
    setSelectedOption(null);
    setIsSubmitted(false);
  };

  const getOptionStyle = (index) => {
    if (!isSubmitted) {
      return selectedOption === index
        ? "border-blue-500 bg-blue-50"
        : "border-gray-300 hover:border-gray-400 hover:bg-gray-50";
    }

    if (index === lesson.answer) {
      return "border-green-500 bg-green-50";
    }

    if (index === selectedOption && selectedOption !== lesson.answer) {
      return "border-red-500 bg-red-50";
    }

    return "border-gray-300 bg-gray-100";
  };

  return (
    <div className="mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Audio Player */}
        <div className="mb-8">
          <div className="bg-purple-50 rounded-lg p-6 text-center">
            <div className="mb-4">
              <Volume2 className="mx-auto text-purple-600 mb-2" size={32} />
              <h3 className="text-lg font-semibold text-purple-900">
                Аудионы тыңдаңыз
              </h3>
            </div>

            <button
              onClick={handlePlayAudio}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium inline-flex items-center"
            >
              {isPlaying ? (
                <>
                  <Pause size={20} className="mr-2" />
                  Пауза
                </>
              ) : (
                <>
                  <Play size={20} className="mr-2" />
                  {hasPlayedAudio ? "Прослушать еще раз" : "Прослушать"}
                </>
              )}
            </button>

            <audio ref={audioRef} src={lesson.audio} />
          </div>
        </div>

        {/* Question */}
        <div className="mb-6">
          <h4 className="text-xl font-semibold text-gray-800 mb-4">
            {lesson.question}
          </h4>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {lesson.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleOptionSelect(index)}
              disabled={isSubmitted}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${getOptionStyle(
                index
              )} ${isSubmitted ? "cursor-not-allowed" : "cursor-pointer"}`}
            >
              <div className="flex items-center">
                <div
                  className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${
                    selectedOption === index
                      ? "border-current"
                      : "border-gray-400"
                  }`}
                >
                  {selectedOption === index && (
                    <div className="w-3 h-3 rounded-full bg-current" />
                  )}
                </div>
                <span className="text-lg">{option}</span>
                {isSubmitted && index === lesson.answer && (
                  <CheckCircle className="ml-auto text-green-600" size={20} />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Result Message */}
        {isSubmitted && (
          <div
            className={`p-4 rounded-lg mb-6 ${
              selectedOption === lesson.answer
                ? "bg-green-50 border border-green-200 text-green-800"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}
          >
            <p className="font-medium">
              {selectedOption === lesson.answer
                ? "Правильно! Отличная работа!"
                : "Неправильно. Попробуйте еще раз!"}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          {!isSubmitted ? (
            <button
              onClick={handleSubmit}
              disabled={selectedOption === null || !hasPlayedAudio}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                selectedOption !== null && hasPlayedAudio
                  ? "bg-purple-600 text-white hover:bg-purple-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Жауапты тексеру
            </button>
          ) : !isCompleted ? (
            <div className="flex items-center text-purple-600">
              <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mr-2"></div>
              Тексерілуде...
            </div>
          ) : selectedOption !== lesson.answer ? (
            <button
              onClick={handleTryAgain}
              className="px-6 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors"
            >
              Қайтадан көру
            </button>
          ) : (
            <div className="flex items-center text-green-600 font-medium">
              <CheckCircle size={20} className="mr-2" />
              Керемет!
            </div>
          )}
        </div>

        {!hasPlayedAudio && (
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              💡 Алдымен аудионы тыңдап, сұраққа жауап беріңіз
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

import { useEffect, useState } from "react";
import { WarmupQuestionRenderer } from "./Tasks/WarmupQuestionRenderer";

export const WarmupQuiz = ({ lesson, onStepComplete }) => {
  const [mode, setMode] = useState("intro"); // intro | quiz | meme | outro
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [memeIndex, setMemeIndex] = useState({ pos: 0, neg: 0 });
  const [lastCorrect, setLastCorrect] = useState(null);
  
  // Animation states
  const [isExiting, setIsExiting] = useState(false);
  const [isEntering, setIsEntering] = useState(true);

  const questions = lesson.questions || [];
  const totalQuestions = questions.length;
  const memeDurMs = lesson.memeDurMs || 3000;

  // Reset entering animation when mode changes
  useEffect(() => {
    setIsEntering(true);
    const timer = setTimeout(() => setIsEntering(false), 100);
    return () => clearTimeout(timer);
  }, [mode, currentIndex]);

  // Проверка ответа
  const handleAnswer = (idx) => {
    setSelectedIndex(idx);
    setIsSubmitted(true);

    const correct = idx === questions[currentIndex].correctIndex;
    setLastCorrect(correct);

    setAnswers((prev) => [
      ...prev,
      { qid: questions[currentIndex].id, selected: idx, correct },
    ]);

    // Start exit animation, then transition to meme
    setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        setIsExiting(false);
        setMode("meme");
      }, 300); // Animation duration
    }, 500);
  };

  // Автопереход с мема
  useEffect(() => {
    if (mode === "meme") {
      const timer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => {
          setIsExiting(false);
          if (currentIndex < totalQuestions - 1) {
            setCurrentIndex((i) => i + 1);
            setSelectedIndex(null);
            setIsSubmitted(false);
            setMode("quiz");
          } else {
            setMode("outro");
          }
        }, 300); // Animation duration
      }, memeDurMs);
      return () => clearTimeout(timer);
    }
  }, [mode, currentIndex, totalQuestions, memeDurMs]);

  // Завершение
  const handleFinish = () => {
    const score = answers.filter((a) => a.correct).length;
    onStepComplete("warmupquiz", {
      completed: true,
      autoAdvance: true,
      score,
      totalQuestions,
    });
  };

  // Animation classes
  const getAnimationClasses = () => {
    const baseClasses = "transition-all duration-300 ease-in-out";
    
    if (isExiting) {
      return `${baseClasses} opacity-0 scale-95 translate-y-4`;
    }
    
    if (isEntering) {
      return `${baseClasses} opacity-0 scale-95 translate-y-4`;
    }
    
    return `${baseClasses} opacity-100 scale-100 translate-y-0`;
  };

  // ============================
  // Рендер режимов
  // ============================

  if (mode === "intro") {
    return (
      <div className={`flex-1 flex flex-col justify-center bg-white rounded-2xl p-6 text-center shadow-md ${getAnimationClasses()}`}>
        <img
          src={lesson.intro?.image}
          alt="intro"
          className="mx-auto mb-4 max-h-64 object-contain rounded-2xl"
        />
        <h2 className="text-2xl font-bold mb-2">{lesson.intro?.title}</h2>
        <p className="text-gray-600 mb-4">{lesson.intro?.text}</p>
        <button
          onClick={() => {
            setIsExiting(true);
            setTimeout(() => {
              setIsExiting(false);
              setMode("quiz");
            }, 300);
          }}
          className="px-6 py-3 bg-[#9C45FF] text-white rounded-lg hover:bg-[#7E2AD9] transition-colors cursor-pointer"
        >
          {lesson.intro?.buttonText || "Начать"}
        </button>
      </div>
    );
  }

  if (mode === "quiz") {
    return (
      <div className={`flex-1 flex flex-col ${getAnimationClasses()}`}>
        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">
              Вопрос {currentIndex + 1} из {totalQuestions}
            </span>
            <span className="text-sm text-gray-600">
              {Math.round(((currentIndex + 1) / totalQuestions) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-[#9C45FF] h-2 rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${((currentIndex + 1) / totalQuestions) * 100}%`,
              }}
            ></div>
          </div>
        </div>

        <WarmupQuestionRenderer
          question={questions[currentIndex]}
          selectedIndex={selectedIndex}
          isSubmitted={isSubmitted}
          onAnswer={handleAnswer}
        />
      </div>
    );
  }

  if (mode === "meme") {
    let memeData;
    if (lastCorrect) {
      memeData =
        lesson.positiveMemes[memeIndex.pos % lesson.positiveMemes.length];
      if (memeIndex.pos < lesson.positiveMemes.length) {
        setMemeIndex((prev) => ({ ...prev, pos: prev.pos + 1 }));
      }
    } else {
      memeData =
        lesson.negativeMemes[memeIndex.neg % lesson.negativeMemes.length];
      if (memeIndex.neg < lesson.negativeMemes.length) {
        setMemeIndex((prev) => ({ ...prev, neg: prev.neg + 1 }));
      }
    }

    return (
      <div className={`flex-1 flex flex-col justify-center bg-white rounded-2xl p-6 text-center shadow-md ${getAnimationClasses()}`}>
        <div className="mb-4">
          <div
            className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl mb-4 transition-all duration-500 ${
              lastCorrect 
                ? "bg-green-100 text-green-600 animate-bounce" 
                : "bg-red-100 text-red-600 animate-pulse"
            }`}
          >
            {lastCorrect ? "✓" : "✗"}
          </div>
        </div>
        
        <img
          src={memeData?.src}
          alt="meme"
          className="mx-auto mb-4 max-h-64 object-contain transform transition-transform duration-300 hover:scale-105"
        />
        <h3
          className={`text-xl font-bold transition-colors duration-500 ${
            lastCorrect ? "text-green-600 animate-pulse" : "text-red-600 animate-pulse"
          }`}
        >
          {memeData?.text}
        </h3>
        
        {/* Visual progress indicator */}
        <div className="mt-6">
          <div className="text-sm text-gray-500 mb-2">Следующий вопрос через...</div>
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-[#9C45FF] rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-[#9C45FF] rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-[#9C45FF] rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    );
  }

  if (mode === "outro") {
    const score = answers.filter((a) => a.correct).length;
    const percentage = Math.round((score / totalQuestions) * 100);
    
    return (
      <div className={`flex-1 flex flex-col justify-center bg-white rounded-2xl p-6 text-center shadow-md ${getAnimationClasses()}`}>
        <div className="mb-6">
          <div className="w-24 h-24 mx-auto rounded-full bg-[#9C45FF] flex items-center justify-center text-white text-3xl font-bold mb-4 transform transition-all duration-500 animate-pulse">
            {percentage}%
          </div>
          <div className="text-lg text-gray-600 mb-2">
            Правильных ответов: {score} из {totalQuestions}
          </div>
        </div>
        
        <img
          src={lesson.outro?.image}
          alt="outro"
          className="mx-auto mb-4 max-h-64 object-contain transform transition-transform duration-300 hover:scale-105"
        />
        <h2 className="text-2xl font-bold mb-2">{lesson.outro?.title}</h2>
        <p className="text-gray-600 mb-4">{lesson.outro?.text}</p>
        <button
          onClick={handleFinish}
          className="px-6 py-3 bg-[#9C45FF] text-white rounded-lg hover:bg-[#7E2AD9] transition-all duration-300 hover:scale-105 transform"
        >
          {lesson.outro?.buttonText || "Перейти дальше"}
        </button>
      </div>
    );
  }

  return null;
};
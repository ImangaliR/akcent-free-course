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

  const questions = lesson.questions || [];
  const totalQuestions = questions.length;
  const memeDurMs = lesson.memeDurMs || 3000;

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

    // через 0.5 сек → мем
    setTimeout(() => {
      setMode("meme");
    }, 500);
  };

  // Автопереход с мема
  useEffect(() => {
    if (mode === "meme") {
      const timer = setTimeout(() => {
        if (currentIndex < totalQuestions - 1) {
          setCurrentIndex((i) => i + 1);
          setSelectedIndex(null);
          setIsSubmitted(false);
          setMode("quiz");
        } else {
          setMode("outro");
        }
      }, memeDurMs);
      return () => clearTimeout(timer);
    }
  }, [mode]);

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

  // ============================
  // Рендер режимов
  // ============================

  if (mode === "intro") {
    return (
      <div className="bg-white rounded-2xl p-6 text-center">
        <img
          src={lesson.intro?.image}
          alt="intro"
          className="mx-auto mb-4 max-h-64 object-contain"
        />
        <h2 className="text-2xl font-bold mb-2">{lesson.intro?.title}</h2>
        <p className="text-gray-600 mb-4">{lesson.intro?.text}</p>
        <button
          onClick={() => setMode("quiz")}
          className="px-6 py-3 bg-[#9C45FF] text-white rounded-lg hover:bg-[#7E2AD9] transition-colors"
        >
          {lesson.intro?.buttonText || "Начать"}
        </button>
      </div>
    );
  }

  if (mode === "quiz") {
    return (
      <WarmupQuestionRenderer
        question={questions[currentIndex]}
        selectedIndex={selectedIndex}
        isSubmitted={isSubmitted}
        onAnswer={handleAnswer}
      />
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
      <div className="bg-white rounded-2xl p-6 text-center">
        <img
          src={memeData?.src}
          alt="meme"
          className="mx-auto mb-4 max-h-64 object-contain"
        />
        <h3
          className={`text-xl font-bold ${
            lastCorrect ? "text-green-600" : "text-red-600"
          }`}
        >
          {memeData?.text}
        </h3>
      </div>
    );
  }

  if (mode === "outro") {
    return (
      <div className="bg-white rounded-2xl p-6 text-center">
        <img
          src={lesson.outro?.image}
          alt="outro"
          className="mx-auto mb-4 max-h-64 object-contain"
        />
        <h2 className="text-2xl font-bold mb-2">{lesson.outro?.title}</h2>
        <p className="text-gray-600 mb-4">{lesson.outro?.text}</p>
        <button
          onClick={handleFinish}
          className="px-6 py-3 bg-[#9C45FF] text-white rounded-lg hover:bg-[#7E2AD9] transition-colors"
        >
          {lesson.outro?.buttonText || "Перейти дальше"}
        </button>
      </div>
    );
  }

  return null;
};

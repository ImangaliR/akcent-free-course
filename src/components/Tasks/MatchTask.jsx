import { useState, useEffect, useRef } from "react";
import { CheckCircle, RotateCcw, Check, X } from "lucide-react";

export const MatchTask = ({ lesson, onStepComplete, previousAnswer }) => {
  const [matches, setMatches] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedType, setSelectedType] = useState(null); // 'sentence' or 'translation'
  const containerRef = useRef(null);

  // Load previous answer if exists
  useEffect(() => {
    if (previousAnswer?.matches) {
      setMatches(previousAnswer.matches);
      setShowResults(previousAnswer.isCompleted || false);
      setIsCompleted(previousAnswer.isCompleted || false);
      setScore(previousAnswer.score || 0);
    }
  }, [previousAnswer]);

  // Create shuffled lists for display - now with state to allow reordering
  const [shuffledSentences, setShuffledSentences] = useState(() => {
    return [...lesson.pairs].sort(() => Math.random() - 0.5);
  });

  const [shuffledTranslations, setShuffledTranslations] = useState(() => {
    return [...lesson.pairs].sort(() => Math.random() - 0.5);
  });

  const handleItemClick = (item, type) => {
    if (isCompleted) return;

    // If clicking the same item, deselect
    if (selectedItem === item && selectedType === type) {
      setSelectedItem(null);
      setSelectedType(null);
      return;
    }

    // If no item selected, select this one
    if (!selectedItem) {
      setSelectedItem(item);
      setSelectedType(type);
      return;
    }

    // If selecting same type, switch selection
    if (selectedType === type) {
      setSelectedItem(item);
      setSelectedType(type);
      return;
    }

    // Different types selected - create/update match
    const newMatches = { ...matches };

    let sentence, translation;
    if (selectedType === "sentence") {
      sentence = selectedItem;
      translation = item;
    } else {
      sentence = item;
      translation = selectedItem;
    }

    // Remove any existing matches for both items
    Object.keys(newMatches).forEach((s) => {
      if (newMatches[s] === translation || s === sentence) {
        delete newMatches[s];
      }
    });

    // Create new match
    newMatches[sentence] = translation;
    setMatches(newMatches);

    // Clear selection
    setSelectedItem(null);
    setSelectedType(null);

    // NEW: Check if correct and move to top
    if (isMatchCorrect(sentence, translation)) {
      setTimeout(() => {
        // Move sentence to top
        setShuffledSentences((prev) => {
          const index = prev.findIndex((pair) => pair.sentence === sentence);
          if (index > 0) {
            const newArray = [...prev];
            const item = newArray.splice(index, 1)[0];
            newArray.unshift(item);
            return newArray;
          }
          return prev;
        });

        // Move translation to top
        setShuffledTranslations((prev) => {
          const index = prev.findIndex(
            (pair) => pair.translation === translation
          );
          if (index > 0) {
            const newArray = [...prev];
            const item = newArray.splice(index, 1)[0];
            newArray.unshift(item);
            return newArray;
          }
          return prev;
        });

        // Force line re-render by updating matches state
        setTimeout(() => {
          setMatches((current) => ({ ...current }));
        }, 100);
      }, 500);
    }
  };

  const removeMatch = (sentence) => {
    if (isCompleted) return;
    const newMatches = { ...matches };
    delete newMatches[sentence];
    setMatches(newMatches);
  };

  // Auto-complete when all pairs are matched
  useEffect(() => {
    if (Object.keys(matches).length === lesson.pairs.length && !isCompleted) {
      let correctCount = 0;
      const totalQuestions = lesson.pairs.length;

      lesson.pairs.forEach((pair) => {
        if (matches[pair.sentence] === pair.translation) {
          correctCount++;
        }
      });

      const finalScore = Math.round((correctCount / totalQuestions) * 100);
      setScore(finalScore);
      setShowResults(true);
      setIsCompleted(true);

      const completionData = {
        matches,
        score: finalScore,
        correctCount,
        totalQuestions,
        isCompleted: true,
        completedAt: new Date().toISOString(),
      };

      onStepComplete?.("matchtask", completionData);
    }
  }, [matches, lesson.pairs, isCompleted, onStepComplete]);

  const resetTask = () => {
    setMatches({});
    setIsCompleted(false);
    setShowResults(false);
    setScore(0);
    setSelectedItem(null);
    setSelectedType(null);

    // Re-shuffle arrays
    setShuffledSentences([...lesson.pairs].sort(() => Math.random() - 0.5));
    setShuffledTranslations([...lesson.pairs].sort(() => Math.random() - 0.5));
  };

  const isMatchCorrect = (sentence, translation) => {
    const correctPair = lesson.pairs.find((pair) => pair.sentence === sentence);
    return correctPair?.translation === translation;
  };

  const getMatchedTranslation = (sentence) => {
    return matches[sentence] || null;
  };

  // NEW: Helper function to get the sentence that a translation is matched with
  const getMatchedSentence = (translation) => {
    return (
      Object.keys(matches).find(
        (sentence) => matches[sentence] === translation
      ) || null
    );
  };

  const isTranslationMatched = (translation) => {
    return Object.values(matches).includes(translation);
  };

  const isItemSelected = (item, type) => {
    return selectedItem === item && selectedType === type;
  };

  const isItemMatched = (item, type) => {
    if (type === "sentence") {
      return !!matches[item];
    } else {
      return isTranslationMatched(item);
    }
  };

  // SVG Lines Component - NEW: immediate color feedback
  const ConnectionLines = () => {
    if (!containerRef.current) return null;

    const lines = [];
    const containerRect = containerRef.current.getBoundingClientRect();

    Object.entries(matches).forEach(([sentence, translation]) => {
      const sentenceElement = containerRef.current.querySelector(
        `[data-sentence="${sentence}"]`
      );
      const translationElement = containerRef.current.querySelector(
        `[data-translation="${translation}"]`
      );

      if (sentenceElement && translationElement) {
        const sentenceRect = sentenceElement.getBoundingClientRect();
        const translationRect = translationElement.getBoundingClientRect();

        const startX = sentenceRect.right - containerRect.left;
        const startY =
          sentenceRect.top + sentenceRect.height / 2 - containerRect.top;
        const endX = translationRect.left - containerRect.left;
        const endY =
          translationRect.top + translationRect.height / 2 - containerRect.top;

        // NEW: immediate feedback - check if correct right away
        const isCorrect = isMatchCorrect(sentence, translation);

        lines.push(
          <line
            key={`${sentence}-${translation}`}
            x1={startX}
            y1={startY}
            x2={endX}
            y2={endY}
            stroke={isCorrect ? "#10b981" : "#ef4444"}
            strokeWidth="3"
            strokeLinecap="round"
            className="transition-all duration-300"
          />
        );
      }
    });

    return (
      <svg
        className="absolute inset-0 pointer-events-none z-10"
        style={{ width: "100%", height: "100%" }}
      >
        {lines}
      </svg>
    );
  };

  return (
    <div className="mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-3">
          {lesson.title}
        </h2>
        <p className="text-gray-600 text-lg">{lesson.question}</p>
        <p className="text-sm text-gray-500 mt-2">
          Сәйкес жұптарды қосу үшін сөздерді түртіңіз
        </p>
      </div>

      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">
            Прогресс: {Object.keys(matches).length} / {lesson.pairs.length}
          </span>
          {showResults && (
            <span
              className={`text-sm font-medium ${
                score >= 80
                  ? "text-green-600"
                  : score >= 60
                  ? "text-yellow-600"
                  : "text-red-600"
              }`}
            >
              Нәтиже: {score}%
            </span>
          )}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-500 h-3 rounded-full transition-all duration-500"
            style={{
              width: `${
                (Object.keys(matches).length / lesson.pairs.length) * 100
              }%`,
            }}
          />
        </div>
      </div>

      {/* Main content with connection lines */}
      <div className="relative" ref={containerRef}>
        <ConnectionLines />

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Sentences column */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center justify-center font-bold">
                KZ
              </span>
              Сөйлемдер
            </h3>
            <div className="space-y-3">
              {shuffledSentences.map((pair, index) => {
                const isMatched = isItemMatched(pair.sentence, "sentence");
                const isSelected = isItemSelected(pair.sentence, "sentence");
                const matchedTranslation = getMatchedTranslation(pair.sentence);
                // NEW: immediate feedback
                const isCorrectMatch = isMatched
                  ? isMatchCorrect(pair.sentence, matchedTranslation)
                  : null;

                return (
                  <div
                    key={index}
                    data-sentence={pair.sentence}
                    className={`relative p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer select-none ${
                      isSelected
                        ? "border-blue-500 bg-blue-100 shadow-lg transform scale-102"
                        : isMatched
                        ? isCorrectMatch
                          ? "border-green-400 bg-green-50"
                          : "border-red-400 bg-red-50"
                        : "border-gray-300 bg-white hover:border-blue-300 hover:bg-blue-50 hover:shadow-md"
                    } ${isCompleted ? "cursor-default" : ""}`}
                    onClick={() => handleItemClick(pair.sentence, "sentence")}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-800 pr-4">
                        {pair.sentence}
                      </span>
                    </div>

                    {/* Remove connection button */}
                    {isMatched && !isCompleted && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeMatch(pair.sentence);
                        }}
                        className="absolute top-1 right-1 w-4 h-4 bg-gray-200 hover:bg-red-100 rounded-full flex items-center justify-center text-gray-500 hover:text-red-500 text-xs"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Translations column */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-green-100 text-green-800 rounded-full text-sm flex items-center justify-center font-bold">
                RU
              </span>
              Аудармасы
            </h3>
            <div className="space-y-3">
              {shuffledTranslations.map((pair, index) => {
                const isMatched = isTranslationMatched(pair.translation);
                const isSelected = isItemSelected(
                  pair.translation,
                  "translation"
                );
                // NEW: Add immediate feedback for translations too
                const matchedSentence = getMatchedSentence(pair.translation);
                const isCorrectMatch = isMatched
                  ? isMatchCorrect(matchedSentence, pair.translation)
                  : null;

                return (
                  <div
                    key={index}
                    data-translation={pair.translation}
                    className={`relative p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer select-none ${
                      isSelected
                        ? "border-green-500 bg-green-100 shadow-lg transform scale-102"
                        : isMatched
                        ? isCorrectMatch
                          ? "border-green-400 bg-green-50"
                          : "border-red-400 bg-red-50"
                        : "border-gray-300 bg-white hover:border-green-300 hover:bg-green-50 hover:shadow-md"
                    } ${isCompleted ? "cursor-default" : ""}`}
                    onClick={() =>
                      handleItemClick(pair.translation, "translation")
                    }
                  >
                    <div className="flex items-center justify-between">
                      {/* Connection point */}
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mr-4 ${
                          isSelected
                            ? "bg-green-500 border-green-500"
                            : isMatched
                            ? isCorrectMatch
                              ? "bg-green-500 border-green-500"
                              : "bg-red-500 border-red-500"
                            : "bg-white border-gray-300"
                        }`}
                      />

                      <span className="font-medium text-gray-800 flex-1">
                        {pair.translation}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-center gap-4 mt-12">
        <button
          onClick={resetTask}
          disabled={Object.keys(matches).length === 0}
          className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RotateCcw className="w-4 h-4" />
          {isCompleted ? "Қайтадан көру" : "Тапсырманы қайта бастау"}
        </button>
      </div>
    </div>
  );
};

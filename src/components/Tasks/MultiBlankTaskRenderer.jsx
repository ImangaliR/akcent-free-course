import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

// ========================================
// HELPER HOOKS
// ========================================
function useClickOutside(ref, onOutside) {
  useEffect(() => {
    function handler(e) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) onOutside?.();
    }
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [ref, onOutside]);
}

// ========================================
// FLOATING MENU COMPONENT
// ========================================
function FloatingMenu({ anchorRect, children, onClose }) {
  const menuRef = useRef(null);
  useClickOutside(menuRef, onClose);

  if (!anchorRect) return null;

  const margin = 8;
  const left = Math.max(
    8,
    Math.min(anchorRect.left + anchorRect.width / 2, window.innerWidth - 8)
  );

  return createPortal(
    <>
      <div className="fixed inset-0 z-[60]" onClick={onClose} />
      <div
        ref={menuRef}
        className="fixed z-[61] translate-x-[-50%] rounded-2xl border-0 shadow-2xl bg-white overflow-hidden backdrop-blur-sm"
        style={{
          top: Math.min(anchorRect.bottom + margin, window.innerHeight - 8),
          left,
          minWidth: Math.max(160, anchorRect.width + 24),
          boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        }}
      >
        {children}
      </div>
    </>,
    document.body
  );
}

// ========================================
// MULTI BLANK TASK RENDERER
// ========================================
export const MultiBlankTaskRenderer = ({
  question,
  currentAnswer,
  onAnswerChange,
  isSubmitted,
  showFeedback,
  isCorrect,
}) => {
  // Popover state
  const [openIdx, setOpenIdx] = useState(null);
  const [anchorRect, setAnchorRect] = useState(null);
  const anchorsRef = useRef({});

  // Создаем мапу для быстрого поиска индекса по ID
  const blankIndexById = useMemo(() => {
    const map = new Map();
    question.blanks?.forEach((blank, index) => {
      map.set(blank.id, index);
    });
    return map;
  }, [question.blanks]);

  // Парсим story и разбиваем на токены
  const storyTokens = useMemo(() => {
    if (!question.story) return [];

    const regex = /(\{\{(.*?)\}\})/g;
    const tokens = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(question.story)) !== null) {
      // Добавляем текст перед найденным бланком
      if (match.index > lastIndex) {
        tokens.push({
          type: "text",
          value: question.story.slice(lastIndex, match.index),
        });
      }

      // Добавляем токен бланка
      tokens.push({
        type: "blank",
        id: match[2].trim(),
      });

      lastIndex = regex.lastIndex;
    }

    // Добавляем оставшийся текст
    if (lastIndex < question.story.length) {
      tokens.push({
        type: "text",
        value: question.story.slice(lastIndex),
      });
    }

    return tokens;
  }, [question.story]);

  // Инициализируем currentAnswer если его нет или неправильной длины
  const choices = useMemo(() => {
    if (!question.blanks) return [];

    // Если currentAnswer существует и имеет правильную длину, используем его
    if (
      Array.isArray(currentAnswer) &&
      currentAnswer.length === question.blanks.length
    ) {
      return currentAnswer;
    }

    // Иначе создаем новый массив с null значениями
    const newChoices = question.blanks.map(() => null);

    // Инициализируем в родительском компоненте, если еще не инициализировано
    if (!currentAnswer || currentAnswer.length !== question.blanks.length) {
      setTimeout(() => onAnswerChange(newChoices), 0);
    }

    return newChoices;
  }, [currentAnswer, question.blanks, onAnswerChange]);

  // Открыть меню для выбора опции
  const openMenuFor = (blankIndex) => {
    if (isSubmitted) return;

    setOpenIdx(blankIndex);
    const element = anchorsRef.current[blankIndex];
    if (element) {
      setAnchorRect(element.getBoundingClientRect());
    }
  };

  // Выбрать опцию
  const selectOption = (blankIndex, optionIndex) => {
    const newChoices = [...choices];
    newChoices[blankIndex] = optionIndex;
    onAnswerChange(newChoices);

    setOpenIdx(null);
    setAnchorRect(null);
  };

  // Обновляем позицию меню при скролле/ресайзе
  useEffect(() => {
    function updatePosition() {
      if (openIdx === null) return;
      const element = anchorsRef.current[openIdx];
      if (element) {
        setAnchorRect(element.getBoundingClientRect());
      }
    }

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [openIdx]);

  // Закрыть меню при смене вопроса
  useEffect(() => {
    setOpenIdx(null);
    setAnchorRect(null);
  }, [question.id]);

  return (
    <div>
      {/* Вопрос */}
      <div className="mb-6">
        <h4 className="text-xl md:text-2xl font-semibold text-gray-800">
          {question.question}
        </h4>
      </div>

      {/* История с пропусками */}
      {question.story && (
        <div className="mb-6">
          <div className="bg-gray-50 rounded-lg p-3 md:p-6 mb-6">
            {/* Медиа */}
            {question.media && (
              <div>
                <img
                  src={question.media}
                  alt="story illustration"
                  className="w-40 h-40 md:w-55 md:h-55 object-cover rounded-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            )}

            <div className="text-black md:text-lg leading-relaxed whitespace-pre-wrap">
              {question.story.split("\n").map((line, lineIndex) => {
                // Парсим line в токены (чтобы бланки всё ещё работали)
                const regex = /(\{\{(.*?)\}\})/g;
                const tokens = [];
                let lastIndex = 0;
                let match;

                while ((match = regex.exec(line)) !== null) {
                  if (match.index > lastIndex) {
                    tokens.push({
                      type: "text",
                      value: line.slice(lastIndex, match.index),
                    });
                  }
                  tokens.push({ type: "blank", id: match[2].trim() });
                  lastIndex = regex.lastIndex;
                }
                if (lastIndex < line.length) {
                  tokens.push({ type: "text", value: line.slice(lastIndex) });
                }

                return (
                  <p key={lineIndex} className="mb-2">
                    {tokens.map((token, tokenIndex) => {
                      if (token.type === "text") {
                        return <span key={tokenIndex}>{token.value}</span>;
                      }

                      const blankIndex = blankIndexById.get(token.id);
                      if (blankIndex === undefined) {
                        return (
                          <span key={tokenIndex} className="text-red-500">
                            [ERROR: {token.id}]
                          </span>
                        );
                      }

                      const blank = question.blanks[blankIndex];
                      const selectedOption = choices[blankIndex];

                      if (!blank) {
                        return (
                          <span key={tokenIndex} className="text-red-500">
                            [ERROR: blank not found for {token.id}]
                          </span>
                        );
                      }

                      const isAnswered =
                        selectedOption !== null && selectedOption !== undefined;
                      const isCorrectAnswer =
                        isSubmitted &&
                        isAnswered &&
                        selectedOption === blank.answer;
                      const isWrongAnswer =
                        isSubmitted &&
                        isAnswered &&
                        selectedOption !== blank.answer;

                      return (
                        <button
                          key={tokenIndex}
                          type="button"
                          ref={(el) => (anchorsRef.current[blankIndex] = el)}
                          onClick={() => openMenuFor(blankIndex)}
                          disabled={isSubmitted}
                          className={`
                      mx-1 px-2 py-1 md:px-3 md:py-1.5 rounded-2xl border-2 align-middle transition-all shadow-sm
                      ${
                        !isAnswered && !isSubmitted
                          ? "border-gray-300 text-gray-500 bg-white hover:border-gray-300 hover:bg-gray-50"
                          : ""
                      }
                      ${
                        isAnswered && !isSubmitted
                          ? "border-gray-300 bg-gray-50 text-gray-900 font-bold"
                          : ""
                      }
                      ${
                        isCorrectAnswer
                          ? "border-green-500 bg-green-500 text-white font-bold"
                          : ""
                      }
                      ${
                        isWrongAnswer
                          ? "border-red-500 bg-red-500 texwhite font-bold"
                          : ""
                      }
                      ${isSubmitted ? "cursor-default" : "cursor-pointer"}
                    `}
                        >
                          {isAnswered ? blank.options[selectedOption] : "____"}
                        </button>
                      );
                    })}
                  </p>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Обратная связь */}
      {showFeedback && (
        <div
          className={`p-4 rounded-lg mb-6 ${
            !isCorrect && "bg-red-50 border border-red-200"
          }`}
        >
          <div
            className={`flex items-center gap-2 font-medium mb-2 ${
              isCorrect ? "text-green-800" : "text-red-800"
            }`}
          >
            {!isCorrect && <span>Қате</span>}
          </div>

          {!isCorrect &&
            question.blanks?.map((blank, index) => {
              const userChoice = choices[index];
              if (userChoice !== blank.answer && userChoice !== null) {
                return (
                  <div key={index} className="text-red-700 text-sm mt-2">
                    <strong>"{blank.options[userChoice]}":</strong>{" "}
                    {blank.feedback?.[userChoice]}
                  </div>
                );
              }
              return null;
            })}
        </div>
      )}

      {/* Плавающее меню опций */}
      {openIdx !== null && (
        <FloatingMenu
          anchorRect={anchorRect}
          onClose={() => {
            setOpenIdx(null);
            setAnchorRect(null);
          }}
        >
          <div className="py-2">
            {question.blanks[openIdx]?.options.map((option, optionIndex) => (
              <div key={optionIndex}>
                <button
                  className="w-full text-left px-3 py-2.5 hover:bg-gray-50 focus:outline-none focus:bg-gray-50 active:bg-gray-100 transition-all duration-200 group"
                  onClick={() => selectOption(openIdx, optionIndex)}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex w-6 h-6 items-center justify-center text-xs font-bold rounded-full bg-[#bcbcbc] text-white group-hover:from-gray-200 transition-all duration-200 flex-shrink-0">
                      {optionIndex + 1}
                    </span>
                    <span className="font-bold text-xs md:text-sm text-gray-700 group-hover:text-gray-900 transition-colors duration-200">
                      {option}
                    </span>
                  </div>
                </button>
                {/* Тонкая линия между элементами (кроме последнего) */}
                {optionIndex < question.blanks[openIdx]?.options.length - 1 && (
                  <div className="border-b border-gray-100 mx-3"></div>
                )}
              </div>
            ))}
          </div>
        </FloatingMenu>
      )}
    </div>
  );
};

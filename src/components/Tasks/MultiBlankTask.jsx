// src/components/MultiBlankStoryTask.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { createPortal } from "react-dom";

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

function FloatingMenu({ anchorRect, children, onClose }) {
  const menuRef = useRef(null);
  useClickOutside(menuRef, onClose);

  if (!anchorRect) return null;

  // Position: below the anchor, centered (with viewport clamping)
  const margin = 8;
  const left = Math.max(
    8,
    Math.min(anchorRect.left + anchorRect.width / 2, window.innerWidth - 8)
  );

  return createPortal(
    <>
      {/* backdrop for clicks */}
      <div className="fixed inset-0 z-[60]" onClick={onClose} />
      <div
        ref={menuRef}
        className="fixed z-[61] translate-x-[-50%] rounded-2xl border shadow-xl bg-white overflow-hidden"
        style={{
          top: Math.min(anchorRect.bottom + margin, window.innerHeight - 8),
          left,
          minWidth: Math.max(160, anchorRect.width + 24),
        }}
      >
        {children}
      </div>
    </>,
    document.body
  );
}

export default function MultiBlankStoryTask({ lesson, onStepComplete }) {
  const [choices, setChoices] = useState(lesson.blanks.map(() => null));
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // popover state
  const [openIdx, setOpenIdx] = useState(null);
  const [anchorRect, setAnchorRect] = useState(null);
  const anchorsRef = useRef({}); // { idx: HTMLElement }

  const blankIndexById = useMemo(() => {
    const m = new Map();
    lesson.blanks.forEach((b, i) => m.set(b.id, i));
    return m;
  }, [lesson.blanks]);

  const storyTokens = useMemo(() => {
    const re = /(\{\{(.*?)\}\})/g;
    const tokens = [];
    let last = 0;
    let match;
    while ((match = re.exec(lesson.story)) !== null) {
      if (match.index > last) {
        tokens.push({
          type: "text",
          value: lesson.story.slice(last, match.index),
        });
      }
      tokens.push({ type: "blank", id: match[2].trim() });
      last = re.lastIndex;
    }
    if (last < lesson.story.length) {
      tokens.push({ type: "text", value: lesson.story.slice(last) });
    }
    return tokens;
  }, [lesson.story]);

  const allChosen = choices.every((c) => c !== null);
  const allCorrect = choices.every(
    (c, i) => c !== null && c === lesson.blanks[i].answer
  );

  function openMenuFor(idx) {
    if (isSubmitted) return;
    setOpenIdx(idx);
    const el = anchorsRef.current[idx];
    if (el) setAnchorRect(el.getBoundingClientRect());
  }

  function selectOption(idx, optIndex) {
    const next = [...choices];
    next[idx] = optIndex;
    setChoices(next);
    setOpenIdx(null);
    setAnchorRect(null);
  }

  const handleSubmit = () => {
    if (!allChosen) return;
    setIsSubmitted(true);

    const payload = {
      completed: true,
      correct: allCorrect,
      selectedAnswers: choices,
      correctAnswers: lesson.blanks.map((b) => b.answer),
      attempts: 1,
    };

    if (allCorrect) {
      setTimeout(() => {
        setIsCompleted(true);
        onStepComplete?.("storytask-blanks", payload);
      }, 1500);
    } else {
      setTimeout(() => setIsCompleted(true), 1000);
    }
  };

  const handleTryAgain = () => {
    setChoices(lesson.blanks.map(() => null));
    setIsSubmitted(false);
    setIsCompleted(false);
    setOpenIdx(null);
    setAnchorRect(null);
  };

  // Keep popover aligned on resize/scroll
  useEffect(() => {
    function update() {
      if (openIdx === null) return;
      const el = anchorsRef.current[openIdx];
      if (el) setAnchorRect(el.getBoundingClientRect());
    }
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [openIdx]);

  return (
    <div className="mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Story */}
        <div className="mb-8">
          <div className="rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-3">Оқиға</h3>
            <p className="text-lg leading-relaxed whitespace-pre-wrap">
              {storyTokens.map((t, i) => {
                if (t.type === "text") return <span key={i}>{t.value}</span>;
                const idx = blankIndexById.get(t.id);
                const selected = choices[idx];
                const isCorrect =
                  isSubmitted && selected === lesson.blanks[idx].answer;
                const isWrong =
                  isSubmitted &&
                  selected !== null &&
                  selected !== lesson.blanks[idx].answer;

                return (
                  <button
                    key={i}
                    type="button"
                    ref={(el) => (anchorsRef.current[idx] = el)}
                    onClick={() => openMenuFor(idx)}
                    className={[
                      "mx-1 px-3 py-1.5 rounded-2xl border-2 align-middle",
                      "transition shadow-sm",
                      selected === null && !isSubmitted
                        ? "border-gray-300 text-gray-500 bg-white"
                        : "",
                      selected !== null && !isSubmitted
                        ? "border-blue-300 bg-blue-50 text-blue-500"
                        : "",
                      isCorrect
                        ? "border-green-300 bg-green-50 text-green-500"
                        : "",
                      isWrong ? "border-red-300 bg-red-50 text-red-500" : "",
                    ].join(" ")}
                  >
                    {selected === null
                      ? "____"
                      : lesson.blanks[idx].options[selected]}
                  </button>
                );
              })}
            </p>
          </div>
        </div>

        {/* Question */}
        <div className="mb-6">
          <h4 className="text-xl font-semibold text-gray-800 mb-4">
            {lesson.question}
          </h4>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          {!isSubmitted ? (
            <button
              onClick={handleSubmit}
              disabled={!allChosen}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                allChosen
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Проверить ответ
            </button>
          ) : !isCompleted ? (
            <div className="flex items-center text-blue-600">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
              Проверяем...
            </div>
          ) : !allCorrect ? (
            <button
              onClick={handleTryAgain}
              className="px-6 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors"
            >
              Попробовать снова
            </button>
          ) : (
            <div className="flex items-center text-green-600 font-medium">
              <CheckCircle size={20} className="mr-2" />
              Отлично!
            </div>
          )}
        </div>
      </div>

      {/* Floating options menu */}
      {openIdx !== null && (
        <FloatingMenu
          anchorRect={anchorRect}
          onClose={() => {
            setOpenIdx(null);
            setAnchorRect(null);
          }}
        >
          <ul className="divide-y">
            {lesson.blanks[openIdx].options.map((opt, oIdx) => (
              <li key={oIdx}>
                <button
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 focus:outline-none"
                  onClick={() => selectOption(openIdx, oIdx)}
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex w-6 h-6 items-center justify-center text-xs rounded-full bg-gray-100">
                      {oIdx + 1}
                    </span>
                    <span className="text-base">{opt}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </FloatingMenu>
      )}
    </div>
  );
}

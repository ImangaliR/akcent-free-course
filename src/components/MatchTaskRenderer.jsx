// Импортируем необходимые библиотеки
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

// Вспомогательная функция для перемешивания массива (для начального случайного порядка)
const shuffleArray = (array) => [...array].sort(() => Math.random() - 0.5);

export const MatchTaskRenderer = ({
  question,
  onAnswerChange,
  isSubmitted,
}) => {
  // --- СОСТОЯНИЕ КОМПОНЕНТА (State) ---
  const [matches, setMatches] = useState({});
  const [selectedId, setSelectedId] = useState(null);
  const [selectedItem, setSelectedItem] = useState({ id: null, type: null });
  const [rightColumnOrder, setRightColumnOrder] = useState([]);

  useEffect(() => {
    setMatches({});
    setSelectedItem({ id: null, type: null }); // Сбрасываем новый state
    if (question.rightItems) {
      setRightColumnOrder(shuffleArray(question.rightItems));
    }
  }, [question]);

  // --- ЛОГИКА ОБРАБОТКИ КЛИКОВ ---
  const handleItemClick = (id, type) => {
    if (isSubmitted || isPartOfCorrectMatch(id, type)) {
      return;
    }

    const { id: currentId, type: currentType } = selectedItem;

    if (id === currentId) {
      setSelectedItem({ id: null, type: null });
      return;
    }

    if (!currentType || type === currentType) {
      setSelectedItem({ id, type });
      return;
    }

    if (type !== currentType) {
      const leftId = currentType === "left" ? currentId : id;
      const rightId = currentType === "right" ? currentId : id;

      // Remove any existing matches for both items before creating new match
      const newMatches = { ...matches };

      // Remove existing match for the left item if it exists
      if (newMatches[leftId]) {
        delete newMatches[leftId];
      }

      // Remove existing match where this right item was previously matched
      const previousLeftId = Object.keys(newMatches).find(
        (key) => newMatches[key] === rightId
      );
      if (previousLeftId) {
        delete newMatches[previousLeftId];
      }

      // Create the new match
      newMatches[leftId] = rightId;
      setMatches(newMatches);
      onAnswerChange(newMatches);

      if (question.answer[leftId] === rightId) {
        const targetIndex = question.leftItems.findIndex(
          (item) => item.id === leftId
        );
        setRightColumnOrder((currentOrder) => {
          const itemToMove = currentOrder.find((item) => item.id === rightId);
          const remainingItems = currentOrder.filter(
            (item) => item.id !== rightId
          );
          const newOrder = [...remainingItems];
          newOrder.splice(targetIndex, 0, itemToMove);
          return newOrder;
        });
      }

      setSelectedItem({ id: null, type: null });
    }
  };

  const removeMatch = (leftId) => {
    if (isSubmitted) return;
    const newMatches = { ...matches };
    delete newMatches[leftId];
    setMatches(newMatches);
    onAnswerChange(newMatches);
  };

  const isCorrectlyMatched = (leftId) =>
    matches[leftId] && question.answer[leftId] === matches[leftId];

  const isPartOfCorrectMatch = (id, type) => {
    if (type === "left") return isCorrectlyMatched(id);
    if (type === "right") {
      const leftPartnerId = Object.keys(matches).find(
        (key) => matches[key] === id
      );
      return leftPartnerId && isCorrectlyMatched(leftPartnerId);
    }
    return false;
  };

  const getItemStatus = (id, type) => {
    const isSelected = selectedItem.id === id && selectedItem.type === type;
    if (isSelected) return "selected";

    if (type === "left") {
      if (!matches[id]) return "idle";
      return isCorrectlyMatched(id) ? "correct" : "incorrect";
    }
    if (type === "right") {
      const leftPartnerId = Object.keys(matches).find(
        (key) => matches[key] === id
      );
      if (!leftPartnerId) return "idle";
      return isCorrectlyMatched(leftPartnerId) ? "correct" : "incorrect";
    }
  };

  // --- СТИЛИЗАЦИЯ ---
  const getPieceClasses = (status) => {
    switch (status) {
      case "selected":
        return "bg-sky-100 ring-2 ring-sky-500 text-sky-900";
      case "correct":
        return "bg-green-100 ring-1 ring-green-500 text-green-900 cursor-default";
      case "incorrect":
        return "bg-red-100 ring-1 ring-red-500 text-red-900";
      default: // idle
        return "bg-white hover:bg-gray-50 ring-1 ring-gray-200";
    }
  };

  const pieceBg = (status) => {
    switch (status) {
      case "selected":
        return "bg-sky-100";
      case "correct":
        return "bg-green-100";
      case "incorrect":
        return "bg-red-100";
      default: // idle
        return "bg-blue-50 hover:bg-blue-100";
    }
  };

  const pieceBorder = (status) => {
    switch (status) {
      case "selected":
        return "border-2 border-sky-500";
      case "correct":
        return "border border-green-500";
      case "incorrect":
        return "border border-red-500";
      default: // idle
        return "border border-gray-200";
    }
  };

  // --- RENDER (Отрисовка компонента) ---
  return (
    <div className="max-w-4xl mx-auto p-4 font-sans">
      <h3 className="text-2xl font-bold text-center text-gray-800 mb-8">
        {question.question}
      </h3>

      <div className="grid grid-cols-2 gap-x-8 md:gap-x-16">
        {/* === ЛЕВАЯ КОЛОНКА (Статичная) === */}
        <div className="space-y-4">
          {question.leftItems?.map((item) => {
            const status = getItemStatus(item.id, "left");
            return (
              <div
                key={item.id}
                onClick={() => handleItemClick(item.id, "left")}
                className={`w-fit md:w-full h-10 md:h-15 relative transform transition-all duration-200 cursor-pointer 
                  
                `}
              >
                <div
                  className={[
                    "relative w-full text-left rounded-md px-3 py-2 pr-9 md:px-8 md:pr-12 md:py-4 overflow-visible text-lg",
                    pieceBg(status),
                    "after:content-[''] after:absolute after:-right-3 after:top-1/2 after:-translate-y-1/2",
                    "after:w-7 after:h-7 after:rounded-full",
                    status === "correct"
                      ? "after:bg-green-100 after:border-r-1 after:border-green-500 after:border-t-0 after:border-b-0 after:border-l-0"
                      : status === "incorrect"
                      ? "after:bg-red-100 after:border-r-1 after:border-red-500 after:border-t-0 after:border-b-0 after:border-l-0"
                      : status === "selected"
                      ? "after:bg-sky-100 after:border-r-1 after:border-sky-500 after:border-t-0 after:border-b-0 after:border-l-0"
                      : "after:bg-blue-50 hover:after:bg-blue-100 after:border-r-1 after:border-gray-300 after:border-t-0 after:border-b-0 after:border-l-0",
                    pieceBorder(status),
                  ].join(" ")}
                >
                  <span className="font-semibold text-gray-700 text-sm md:text-base">
                    {item.text}
                  </span>
                  {status === "incorrect" && !isSubmitted && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeMatch(item.id);
                      }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg z-30"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* === ПРАВАЯ КОЛОНКА (Анимированная) === */}
        <div className="space-y-4">
          {rightColumnOrder.map((item) => {
            const status = getItemStatus(item.id, "right");
            const isLocked = status === "correct";

            return (
              <motion.div
                layout="position"
                key={item.id}
                onClick={() => handleItemClick(item.id, "right")}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className={`w-fit md:w-full h-10 md:h-15 relative transform transition-colors duration-200 cursor-pointer ${
                  !isLocked && selectedId && !isSubmitted
                    ? "hover:scale-105"
                    : "cursor-default"
                }`}
              >
                <div
                  className={[
                    "relative w-full text-left rounded-md px-3 py-2 pl-9 md:pl-12 md:px-8 md:py-4 transition-colors overflow-visible text-lg",
                    pieceBg(status),
                    "before:content-[''] before:absolute before:-left-3 before:top-1/2 before:-translate-y-1/2",
                    "before:w-6 before:h-6 before:rounded-full before:bg-white",
                    status === "correct"
                      ? "before:border-r-1 before:border-green-500 before:border-t-0 before:border-b-0 before:border-l-0"
                      : status === "incorrect"
                      ? "before:border-r-1 before:border-red-500 before:border-t-0 before:border-b-0 before:border-l-0"
                      : status === "selected"
                      ? "before:border-r-1 before:border-sky-500 before:border-t-0 before:border-b-0 before:border-l-0"
                      : "before:border-r-1 before:border-gray-300 before:border-t-0 before:border-b-0 before:border-l-0",
                    pieceBorder(status),
                  ].join(" ")}
                >
                  <span className="font-semibold text-gray-700 text-sm md:text-base ml-2">
                    {item.text}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

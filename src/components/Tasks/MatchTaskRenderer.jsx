import { motion } from "framer-motion";
import { CheckCircle, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";

export const MatchTaskRenderer = ({
  question,
  currentAnswer,
  onAnswerChange,
  isSubmitted,
}) => {
  const [matches, setMatches] = useState(currentAnswer || {});
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [rightItemsOrder, setRightItemsOrder] = useState(() => {
    return question.rightItems
      ? [...question.rightItems].sort(() => Math.random() - 0.5)
      : [];
  });
  const containerRef = useRef(null);

  const pieceBg = (isMatched, isCorrectMatch, isSelected) => {
    if (isMatched) {
      return isCorrectMatch
        ? "bg-green-100 text-green-900"
        : "bg-red-100 text-red-900";
    }
    return isSelected
      ? "bg-sky-100 text-sky-900"
      : "bg-blue-50 text-zinc-800 hover:bg-blue-50";
  };

  const pieceBorder = (isMatched, isCorrectMatch) => {
    if (!isMatched) return "";
    return isCorrectMatch
      ? "border-[1px] border-green-500"
      : "border-[1px] border-red-500";
  };

  useEffect(() => {
    setMatches(currentAnswer || {});
  }, [currentAnswer]);

  const handleItemClick = (item, type) => {
    if (isSubmitted) return;

    if (selectedItem === item && selectedType === type) {
      setSelectedItem(null);
      setSelectedType(null);
      return;
    }

    if (!selectedItem) {
      setSelectedItem(item);
      setSelectedType(type);
      return;
    }

    if (selectedType === type) {
      setSelectedItem(item);
      setSelectedType(type);
      return;
    }

    const newMatches = { ...matches };

    let leftId, rightId;
    if (selectedType === "left") {
      leftId = selectedItem;
      rightId = item;
    } else {
      leftId = item;
      rightId = selectedItem;
    }

    Object.keys(newMatches).forEach((key) => {
      if (newMatches[key] === rightId || key === leftId) {
        delete newMatches[key];
      }
    });

    newMatches[leftId] = rightId;
    setMatches(newMatches);
    onAnswerChange(newMatches);

    if (isMatchCorrect(leftId, rightId)) {
      flushSync(() => {
        moveRightItemToPosition(leftId, rightId);
      });
    }

    setSelectedItem(null);
    setSelectedType(null);
  };

  const moveRightItemToPosition = (leftId, rightId) => {
    const leftIndex = question.leftItems.findIndex(
      (item) => item.id === leftId
    );

    setRightItemsOrder((prevOrder) => {
      const newOrder = [...prevOrder];
      const currentRightIndex = newOrder.findIndex(
        (item) => item.id === rightId
      );

      if (currentRightIndex !== -1 && leftIndex !== -1) {
        const [rightItem] = newOrder.splice(currentRightIndex, 1);
        newOrder.splice(leftIndex, 0, rightItem);
      }

      return newOrder;
    });
  };

  const removeMatch = (leftId) => {
    if (isSubmitted) return;
    const rightId = matches[leftId];
    const newMatches = { ...matches };
    delete newMatches[leftId];
    setMatches(newMatches);
    onAnswerChange(newMatches);

    if (rightId) {
      setTimeout(() => {
        setRightItemsOrder((prevOrder) => {
          const rightItem = prevOrder.find((item) => item.id === rightId);
          if (rightItem) {
            const newOrder = prevOrder.filter((item) => item.id !== rightId);
            const randomIndex = Math.floor(
              Math.random() * (newOrder.length + 1)
            );
            newOrder.splice(randomIndex, 0, rightItem);
            return newOrder;
          }
          return prevOrder;
        });
      }, 200);
    }
  };

  const isMatchCorrect = (leftId, rightId) => {
    return question.answer[leftId] === rightId;
  };

  const isItemSelected = (item, type) =>
    selectedItem === item && selectedType === type;

  const isLeftMatched = (leftId) => !!matches[leftId];
  const isRightMatched = (rightId) => Object.values(matches).includes(rightId);

  const getMatchedRight = (leftId) => matches[leftId];
  const getMatchedLeft = (rightId) =>
    Object.keys(matches).find((key) => matches[key] === rightId);

  const isPositionCorrect = (leftIndex, rightIndex) => {
    const leftItem = question.leftItems[leftIndex];
    const rightItem = rightItemsOrder[rightIndex];
    if (!leftItem || !rightItem) return false;
    const isMatched = matches[leftItem.id] === rightItem.id;
    const isCorrectMatch =
      isMatched && isMatchCorrect(leftItem.id, rightItem.id);
    return isCorrectMatch;
  };

  const JOIN_SHIFT_RIGHT = 8;
  const JOIN_SHIFT_LEFT = 7;

  const LeftPuzzlePiece = ({ item, isMatched, isSelected, isCorrectMatch }) => (
    <div
      className={`relative transform transition-all duration-500 hover:scale-105 cursor-pointer ${
        isSubmitted ? "cursor-default hover:scale-100" : ""
      }`}
      style={{ width: "100%", height: "60px" }}
      onClick={() => handleItemClick(item.id, "left")}
    >
      <div
        className={[
          "relative w-full text-left rounded-md px-8 pr-12 py-4 overflow-visible",
          pieceBg(isMatched, isCorrectMatch, isSelected),
          "after:content-[''] after:absolute after:-right-3 after:top-1/2 after:-translate-y-1/2",
          "after:w-7 after:h-7 after:rounded-full",
          isMatched
            ? isCorrectMatch
              ? "after:bg-green-100 after:border-r-1 after:border-green-500 after:border-t-0 after:border-b-0 after:border-l-0"
              : "after:bg-red-100 after:border-r-1 after:border-red-500 after:border-t-0 after:border-b-0 after:border-l-0"
            : isSelected
            ? "after:bg-sky-100"
            : "after:bg-blue-50 hover:bg-blue-100 hover:after:bg-blue-100",
          pieceBorder(isMatched, isCorrectMatch),
        ].join(" ")}
      >
        <span className="font-semibold text-gray-700 text-base">
          {item.text}
        </span>

        {isMatched && !isSubmitted && !isCorrectMatch && (
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

  const RightPuzzlePiece = ({
    item,
    index,
    isMatched,
    isSelected,
    isCorrectMatch,
  }) => (
    <div
      className={`relative transform transition-all duration-500 hover:scale-105 cursor-pointer ${
        isSubmitted ? "cursor-default hover:scale-100" : ""
      }`}
      style={{ width: "100%", height: "60px", transform: `translateY(0)` }}
      onClick={() => handleItemClick(item.id, "right")}
    >
      <div
        className={[
          "relative w-full text-left rounded-md px-8 pr-12 py-4 transition-colors overflow-visible",
          pieceBg(isMatched, isCorrectMatch, isSelected),
          "before:content-[''] before:absolute before:-left-3 before:top-1/2 before:-translate-y-1/2",
          "before:w-6 before:h-6 before:rounded-full before:bg-white dark:before:bg-white",
          isMatched
            ? isCorrectMatch
              ? "before:border-r-1 before:border-green-500 before:border-t-0 before:border-b-0 before:border-l-0"
              : "after:bg-sky-100 before:border-r-1 before:border-red-500 before:border-t-0 before:border-b-0 before:border-l-0"
            : "after:bg-blue-50 hover:bg-blue-100 hover:after:bg-blue-100",
          pieceBorder(isMatched, isCorrectMatch),
        ].join(" ")}
      >
        <span className="font-semibold text-gray-700 text-base ml-2">
          {item.text}
        </span>

        {/* Индикатор правильной позиции */}
        {isPositionCorrect(index, index) && (
          <div className="absolute -right-2 -top-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <CheckCircle className="w-4 h-4 text-white" />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h4 className="text-2xl font-bold text-gray-800 mb-3">
          {question.question}
        </h4>
      </div>

      {/* Main puzzle area */}
      <div
        className="relative rounded-xl p-8 border border-gray-200"
        ref={containerRef}
      >
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left fixed */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-lg text-sm flex items-center justify-center font-bold">
                🧩
              </div>
              Сол жақ бөлік
            </h3>
            <div className="space-y-4">
              {question.leftItems?.map((item, index) => {
                const isMatched = isLeftMatched(item.id);
                const isSelected = isItemSelected(item.id, "left");
                const matchedRightId = getMatchedRight(item.id);
                const isCorrectMatch = isMatched
                  ? isMatchCorrect(item.id, matchedRightId)
                  : null;

                return (
                  <motion.div
                    key={item.id}
                    data-left={item.id}
                    layout="position"
                    animate={{ x: isCorrectMatch ? JOIN_SHIFT_LEFT : 0 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <LeftPuzzlePiece
                      item={item}
                      index={index}
                      isMatched={isMatched}
                      isSelected={isSelected}
                      isCorrectMatch={isCorrectMatch}
                    />
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Right movable */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <div className="w-8 h-8 bg-green-500 text-white rounded-lg text-sm flex items-center justify-center font-bold">
                🧩
              </div>
              Оң жақ бөлік
            </h3>
            <motion.div
              layout
              transition={{
                layout: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }, // slow + smooth
              }}
              className="space-y-4"
            >
              {rightItemsOrder.map((item, index) => {
                const isMatched = isRightMatched(item.id);
                const isSelected = isItemSelected(item.id, "right");
                const matchedLeftId = getMatchedLeft(item.id);
                const isCorrectMatch = isMatched
                  ? isMatchCorrect(matchedLeftId, item.id)
                  : null;

                return (
                  <motion.div
                    key={item.id}
                    data-right={item.id}
                    layout="position" // animate position only (more predictable)
                    transition={{
                      layout: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
                    }}
                  >
                    <motion.div
                      key={
                        isCorrectMatch ? `${item.id}-pop` : `${item.id}-idle`
                      }
                      animate={{
                        scale: isCorrectMatch ? [1, 1.04, 1] : 1,
                        x: isCorrectMatch ? -JOIN_SHIFT_RIGHT : 0,
                      }}
                      transition={{
                        scale: {
                          type: "tween",
                          duration: 0.28,
                          times: [0, 0.5, 1],
                          ease: ["easeOut", "easeIn"],
                        },
                        x: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
                      }}
                    >
                      <RightPuzzlePiece
                        item={item}
                        index={index}
                        isMatched={isMatched}
                        isSelected={isSelected}
                        isCorrectMatch={isCorrectMatch}
                      />
                    </motion.div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

const shuffleArray = (array) => [...array].sort(() => Math.random() - 0.5);

export const MatchTaskRenderer = ({
  question,
  onAnswerChange,
  isSubmitted,
}) => {
  // --- СОСТОЯНИЕ КОМПОНЕНТА ---

  const [matches, setMatches] = useState({});
  
  // ИЗМЕНЕНИЕ №1: Теперь храним не просто ID, а объект с ID и типом колонки.
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

  // ИЗМЕНЕНИЕ №2: Единая функция для обработки кликов по любому элементу.
  const handleItemClick = (id, type) => {
    // Базовые проверки: не даем ничего делать, если тест сдан или элемент уже в правильной паре.
    if (isSubmitted || isPartOfCorrectMatch(id, type)) {
      return;
    }

    const { id: currentId, type: currentType } = selectedItem;

    // Сценарий 1: Клик по уже выбранному элементу -> Снимаем выделение.
    if (id === currentId) {
      setSelectedItem({ id: null, type: null });
      return;
    }

    // Сценарий 2: Еще ничего не выбрано ИЛИ клик по элементу в той же колонке -> Просто выбираем его.
    if (!currentType || type === currentType) {
      setSelectedItem({ id, type });
      return;
    }

    // Сценарий 3: Выбран элемент в одной колонке, а кликнули по другой -> Сопоставление!
    if (type !== currentType) {
      // Определяем, где левый ID, а где правый, в зависимости от того, с чего начали.
      const leftId = currentType === 'left' ? currentId : id;
      const rightId = currentType === 'right' ? currentId : id;

      const newMatches = { ...matches, [leftId]: rightId };
      setMatches(newMatches);
      onAnswerChange(newMatches);

      // Если сопоставление верное - запускаем анимацию пересортировки.
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

      // Сбрасываем выделение после хода.
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

  // --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---

  const isCorrectlyMatched = (leftId) =>
    matches[leftId] && question.answer[leftId] === matches[leftId];
  
  // Новая функция, чтобы проверять, является ли элемент частью уже решенной пары
  const isPartOfCorrectMatch = (id, type) => {
    if(type === 'left') return isCorrectlyMatched(id);
    if(type === 'right') {
      const leftPartnerId = Object.keys(matches).find(key => matches[key] === id);
      return leftPartnerId && isCorrectlyMatched(leftPartnerId);
    }
    return false;
  }

  // ИЗМЕНЕНИЕ №3: Функция статуса теперь использует `selectedItem`.
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

  const getPieceClasses = (status) => {
    // ... (эта функция не изменилась)
  };

  // --- RENDER ---

  return (
    <div className="max-w-4xl mx-auto p-4 font-sans">
      <h3 className="text-2xl font-bold text-center text-gray-800 mb-8">
        {question.question}
      </h3>
      <div className="grid grid-cols-2 gap-x-8 md:gap-x-16">
        {/* === ЛЕВАЯ КОЛОНКА === */}
        <div className="space-y-4">
          {question.leftItems?.map((item) => {
            const status = getItemStatus(item.id, "left");
            return (
              <div
                key={item.id}
                // ИЗМЕНЕНИЕ №4: Вызываем единый обработчик
                onClick={() => handleItemClick(item.id, "left")}
                className={`...`} // классы не меняются
              >
                {/* ... */}
              </div>
            );
          })}
        </div>

        {/* === ПРАВАЯ КОЛОНКА === */}
        <div className="space-y-4">
          {rightColumnOrder.map((item) => {
            const status = getItemStatus(item.id, "right");
            const isLocked = status === "correct";
            return (
              <motion.div
                layout="position"
                key={item.id}
                // ИЗМЕНЕНИЕ №5: И здесь вызываем тот же обработчик
                onClick={() => handleItemClick(item.id, "right")}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className={`... ${!isLocked && !isSubmitted ? "cursor-pointer" : "cursor-default"}`}
              >
                {item.text}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// P.S. Я сократил код JSX и стилей для краткости, так как он не менялся.
// Вам нужно просто заменить логическую часть в вашем файле.
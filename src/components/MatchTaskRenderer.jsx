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

  // 1. 'matches': Хранит ответы пользователя в формате { leftId: rightId }
  const [matches, setMatches] = useState({});

  // 2. 'selectedId': Хранит ID выбранного элемента из левой колонки.
  //    Нам нужен только один выбранный элемент, т.к. левая колонка - главная.
  const [selectedId, setSelectedId] = useState(null);

  const [selectedItem, setSelectedItem] = useState({ id: null, type: null });

  // 3. 'rightColumnOrder': Самое главное! Хранит массив объектов правой колонки
  //    в том порядке, в котором они отображаются на экране. Анимация работает за счет
  //    изменения порядка элементов в этом массиве.
  const [rightColumnOrder, setRightColumnOrder] = useState([]);

  // --- ЭФФЕКТЫ (Effects) ---

  // Этот useEffect срабатывает один раз при загрузке компонента или когда меняется вопрос.
  // Он сбрасывает все состояния до начальных.
  useEffect(() => {
    setMatches({});
    setSelectedItem({ id: null, type: null }); // Сбрасываем новый state
    if (question.rightItems) {
      setRightColumnOrder(shuffleArray(question.rightItems));
    }
  }, [question]);

  // --- ЛОГИКА ОБРАБОТКИ КЛИКОВ ---

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
      const leftId = currentType === "left" ? currentId : id;
      const rightId = currentType === "right" ? currentId : id;

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

  // Функция для сброса НЕПРАВИЛЬНОГО ответа
  const removeMatch = (leftId) => {
    if (isSubmitted) return;
    const newMatches = { ...matches };
    delete newMatches[leftId];
    setMatches(newMatches);
    onAnswerChange(newMatches);
  };

  // --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---

  // Проверяет, является ли сопоставление для данного элемента левой колонки правильным
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
                className={`relative p-4 rounded-lg text-lg transition-all duration-200 ${getPieceClasses(
                  status
                )} ${
                  status !== "correct" && !isSubmitted
                    ? "cursor-pointer"
                    : "cursor-default"
                }`}
              >
                {item.text}
                {/* Кнопка "X" для сброса неправильного ответа */}
                {status === "incorrect" && !isSubmitted && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // чтобы не сработал клик по самому элементу
                      removeMatch(item.id);
                    }}
                    className="absolute -top-3 -right-3 w-7 h-7 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg z-10"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* === ПРАВАЯ КОЛОНКА (Анимированная) === */}
        <div className="space-y-4">
          {/* Этот motion.div НЕ НУЖЕН для анимации порядка, 
            так как мы анимируем каждый элемент отдельно.
            Но он может быть полезен для анимации появления всего блока.
          */}
          {rightColumnOrder.map((item) => {
            const status = getItemStatus(item.id, "right");
            const isLocked = status === "correct";

            return (
              // layout="position" - это магия framer-motion.
              // Он автоматически анимирует элемент к его новой позиции в DOM.
              <motion.div
                layout="position"
                key={item.id}
                onClick={() => handleItemClick(item.id, "right")}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className={`p-4 rounded-lg text-lg transition-colors duration-200 ${getPieceClasses(
                  status
                )} ${
                  !isLocked && selectedId && !isSubmitted
                    ? "cursor-pointer hover:scale-105"
                    : "cursor-default"
                }`}
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

import { useEffect, useRef, useState } from "react";
import logoAkcent from "../assets/tgrfedws.png";
import { useAuth } from "../context/AuthContext"; // Добавляем импорт

export const ContinuousChatGame = ({ lesson, onStepComplete }) => {
  const { user } = useAuth(); // Получаем данные пользователя
  const [chatHistory, setChatHistory] = useState([]);
  const [currentDialogIndex, setCurrentDialogIndex] = useState(0);
  const [availableOptions, setAvailableOptions] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [stats, setStats] = useState({ correct: 0, total: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const chatEndRef = useRef(null);
  const initializeRef = useRef(false);

  const dialogs = lesson?.dialogs || [];

  // Инициализация только один раз
  useEffect(() => {
    if (initializeRef.current || !lesson || dialogs.length === 0) {
      return;
    }

    initializeRef.current = true;

    if (lesson.greeting) {
      setChatHistory([
        {
          type: "system",
          text: lesson.greeting,
          timestamp: Date.now(),
        },
      ]);

      // Показываем первый диалог через задержку
      setTimeout(() => {
        showNextDialog(0);
      }, 1000);
    }
  }, [lesson?.id, dialogs.length]);

  // Показать следующий диалог
  const showNextDialog = (dialogIndex) => {
    console.log(
      "showNextDialog:",
      dialogIndex,
      "всего диалогов:",
      dialogs.length
    );

    if (dialogIndex >= dialogs.length) {
      finishChat();
      return;
    }

    const dialog = dialogs[dialogIndex];

    if (!dialog) {
      console.error("Диалог не найден для индекса:", dialogIndex);
      return;
    }

    // Добавляем вопрос системы в чат
    setChatHistory((prev) => [
      ...prev,
      {
        type: "system",
        text: dialog.systemMessage,
        dialogId: dialog.id,
        timestamp: Date.now(),
      },
    ]);

    // Устанавливаем доступные опции
    const options = dialog.options || [];
    setAvailableOptions(options);
    setCurrentDialogIndex(dialogIndex);
    setIsProcessing(false);
  };

  // Обработка выбора опции с защитой от множественных кликов
  const handleOptionSelect = (option) => {
    if (isProcessing) {
      return;
    }

    setIsProcessing(true);

    const currentDialog = dialogs[currentDialogIndex];

    if (!currentDialog) {
      console.error("Текущий диалог не найден");
      setIsProcessing(false);
      return;
    }

    // Добавляем ответ пользователя в чат
    setChatHistory((prev) => [
      ...prev,
      {
        type: "user",
        text: option.text,
        optionId: option.id,
        timestamp: Date.now(),
      },
    ]);

    // Убираем опции сразу
    setAvailableOptions([]);

    // Обновляем статистику
    if (option.isCorrect) {
      setStats((prev) => ({
        ...prev,
        correct: prev.correct + 1,
        total: prev.total + 1,
      }));

      // Если правильный ответ - показываем обратную связь и кнопку "Далее"
      setTimeout(() => {
        setAvailableOptions([
          {
            type: "feedback",
            feedback: option.feedback || "Правильно!",
            isCorrect: true,
          },
        ]);
        setIsProcessing(false);
      }, 500);
    } else {
      setStats((prev) => ({ ...prev, total: prev.total + 1 }));

      // Если неправильный ответ - показываем обратную связь и правильные варианты
      setTimeout(() => {
        const correctOptions =
          currentDialog.options?.filter((opt) => opt.isCorrect) || [];
        setAvailableOptions([
          {
            type: "feedback",
            feedback: option.feedback || "Неверный ответ",
            isCorrect: false,
          },
          ...correctOptions,
        ]);
        setIsProcessing(false);
      }, 500);
    }
  };

  // Обработка кнопки "Далее"
  const handleContinue = () => {
    setAvailableOptions([]);
    showNextDialog(currentDialogIndex + 1);
  };

  // Завершение чата
  const finishChat = () => {
    const completionMessage =
      lesson?.completion?.message || "Отлично! Диалог завершен.";

    setChatHistory((prev) => [
      ...prev,
      {
        type: "system",
        text: completionMessage,
        timestamp: Date.now(),
      },
    ]);

    setIsCompleted(true);

    // Завершаем блок
    setTimeout(() => {
      onStepComplete?.("chatgame", {
        stats,
        passed: true,
        completed: true,
      });
    }, 2000);
  };

  // Автоскролл
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory, availableOptions]);

  // Если нет данных
  if (!lesson || dialogs.length === 0) {
    return (
      <div className="p-8 bg-yellow-50 border border-yellow-200 rounded">
        <h3 className="text-lg font-bold text-yellow-800 mb-4">
          Диалоги не найдены
        </h3>
        <p className="text-yellow-700">Проверьте структуру JSON файла</p>
        <button
          onClick={() => onStepComplete?.("chatgame", { passed: true })}
          className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
        >
          Пропустить
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto   pt-8 md:pt-0">
      {/* Область чата */}
      <div className="bg-gray-50 rounded-lg relative min-h-[500px] max-h-[600px] flex flex-col">
        {/* Скроллируемая область сообщений */}
        <div className="flex-1 overflow-y-auto p-4 pb-2">
          <div className="space-y-4">
            {chatHistory.map((message, index) => (
              <div
                key={`${message.timestamp}-${index}`}
                className={`flex ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-lg ${
                    message.type === "user"
                      ? "bg-blue-500 text-white ml-8"
                      : message.isCorrect === true
                      ? "bg-green-100 border-l-4 border-green-500 text-green-800 mr-8"
                      : message.isCorrect === false
                      ? "bg-red-100 border-l-4 border-red-500 text-red-800 mr-8"
                      : "bg-white border border-gray-200 text-gray-800 mr-8 shadow-sm"
                  }`}
                >
                  {message.type === "system" && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                        <img
                          src={logoAkcent}
                          alt="Akcent Academy"
                          className="w-6 h-6  rounded-2xl"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                          }}
                        />
                        <div className="w-6 h-6 bg-gray-800 rounded-full items-center justify-center flex-shrink-0 hidden">
                          <span className="text-white text-xs">★</span>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-gray-600">
                        Akcent Academy
                      </span>
                    </div>
                  )}

                  <div className="text-sm leading-relaxed">{message.text}</div>
                </div>
              </div>
            ))}
          </div>
          <div ref={chatEndRef} />
        </div>

        {/* Фиксированные варианты ответов внизу */}
        {availableOptions.length > 0 && !isCompleted && (
          <div className="border-t border-gray-200 bg-white p-4">
            {availableOptions.map((option, index) => {
              // Если это обратная связь
              if (option.type === "feedback") {
                return (
                  <div key={index} className="mb-3">
                    <div
                      className={`p-3 rounded-sm border-l-4
                         ${
                           option.isCorrect
                             ? "bg-green-50 border-green-500 text-green-800"
                             : "bg-red-50 border-red-500 text-red-800"
                         }`}
                    >
                      <div
                        className={`flex items-center gap-2 font-medium mb-2 ${
                          option.isCorrect ? "text-green-800" : "text-red-800"
                        }`}
                      >
                        {option.isCorrect ? (
                          <>
                            <span>Дұрыс!</span>
                          </>
                        ) : (
                          <>
                            <span>Қате</span>
                          </>
                        )}
                      </div>
                      <div className="text-sm mt-1">{option.feedback}</div>
                    </div>

                    {/* Кнопка "Далее" в стиле вариантов ответов */}
                    {option.isCorrect && (
                      <button
                        onClick={handleContinue}
                        className="mt-3 w-full p-3 text-left rounded-lg border border-gray-300 hover:border-[#9C45FF] hover:bg-[#e0c7fd]  hover:text-[#471d77] bg-gray-50 hover:shadow-sm cursor-pointer text-gray-800 transition-all duration-200"
                      >
                        <div className="text-sm font-medium">Келесі</div>
                      </button>
                    )}
                  </div>
                );
              }

              // Обычные варианты ответов (все в обычном стиле)
              return (
                <div key={option.id || index} className="mb-2">
                  <button
                    onClick={() => handleOptionSelect(option)}
                    disabled={isProcessing}
                    className={`w-full p-3 text-left rounded-lg border transition-all duration-200 ${
                      isProcessing
                        ? "border-gray-200 bg-gray-50 cursor-not-allowed text-gray-500"
                        : "border-gray-300 hover:border-[#e0c7fd] hover:bg-[#e0c7fd] hover:text-[#471d77] bg-gray-50 hover:shadow-sm cursor-pointer text-gray-800"
                    }`}
                  >
                    <div className="text-sm font-medium">{option.text}</div>
                  </button>
                </div>
              );
            })}

            {/* Заголовок только для обычных вариантов */}
            {!availableOptions.some((opt) => opt.type === "feedback") && (
              <div className="text-sm text-gray-600 font-medium mb-3">
                Выберите ответ:
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

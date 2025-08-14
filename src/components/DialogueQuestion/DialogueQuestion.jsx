import { CheckCircle, MessageCircle, Users, Volume2 } from "lucide-react";
import { useState } from "react";

export const DialogueQuestion = ({ answers, handleAnswerChange }) => {
  const [focusedField, setFocusedField] = useState(null);

  // Проверка заполненности каждого поля
  const getFieldStatus = (fieldName) => {
    const value = answers.dialogue[fieldName];
    return value && value.trim() !== "" ? "completed" : "empty";
  };

  // Общий прогресс диалога
  const getDialogueProgress = () => {
    const fields = ["blank1", "blank2", "blank3"];
    const completed = fields.filter(
      (field) => getFieldStatus(field) === "completed"
    ).length;
    return (completed / fields.length) * 100;
  };

  // Подсказки для каждого поля
  const getHint = (fieldName) => {
    const hints = {
      blank1: "Приветствие (например: Привет, Здравствуй)",
      blank2: "Вопрос о самочувствии (например: дела, жизнь)",
      blank3: "Ответ на вопрос о самочувствии (например: Хорошо, Отлично)",
    };
    return hints[fieldName];
  };

  const isDialogueComplete = getDialogueProgress() === 100;

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100 transition-all duration-300 hover:shadow-md">
      {/* Заголовок с иконкой и статусом */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <MessageCircle className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800">
            Диалог (Dialogue)
          </h3>
          <Users className="w-5 h-5 text-gray-400" />
        </div>

        {/* Статус завершения */}
        <div className="flex items-center gap-2">
          {isDialogueComplete ? (
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Диалог завершен</span>
            </div>
          ) : (
            <div className="px-3 py-1 bg-purple-100 rounded-full">
              <span className="text-xs text-purple-600 font-medium">
                {Math.round(getDialogueProgress())}% завершено
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Инструкция */}
      <div className="mb-6">
        <p className="text-gray-600 mb-3">
          Complete the dialogue using the words you've learned.
        </p>
        <div className="flex items-center gap-2 text-sm text-purple-600 bg-purple-50 px-3 py-2 rounded-md border-l-4 border-purple-400">
          <Volume2 className="w-4 h-4" />
          <span>💬 Создайте естественный диалог между Анной и Иваном</span>
        </div>
      </div>

      {/* Прогресс-бар */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <span>Прогресс диалога</span>
          <span>{Math.round(getDialogueProgress())}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${getDialogueProgress()}%` }}
          />
        </div>
      </div>

      {/* Диалог */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
        <div className="space-y-6 text-lg">
          {/* Первая реплика - Анна */}
          <div className="flex items-start gap-4">
            <div className="flex items-center gap-2 w-20 flex-shrink-0">
              <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-rose-400 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                А
              </div>
              <span className="font-semibold text-gray-700 text-sm">Анна:</span>
            </div>

            <div className="flex items-center flex-wrap gap-2 flex-1">
              <div className="relative">
                <input
                  type="text"
                  name="blank1"
                  value={answers.dialogue.blank1}
                  onChange={(e) =>
                    handleAnswerChange("dialogue", {
                      name: e.target.name,
                      val: e.target.value,
                    })
                  }
                  onFocus={() => setFocusedField("blank1")}
                  onBlur={() => setFocusedField(null)}
                  className={`w-32 px-3 py-2 text-center border-b-2 bg-transparent focus:outline-none transition-all duration-300 ${
                    getFieldStatus("blank1") === "completed"
                      ? "border-green-500 text-green-700"
                      : focusedField === "blank1"
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-300"
                  }`}
                  placeholder="______"
                  autoComplete="off"
                />

                {/* Индикатор статуса */}
                {getFieldStatus("blank1") === "completed" && (
                  <CheckCircle className="absolute -right-6 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
                )}
              </div>
              <span className="text-gray-700">, Иван!</span>
            </div>
          </div>

          {/* Подсказка для первого поля */}
          {focusedField === "blank1" && (
            <div className="ml-24 text-xs text-purple-600 bg-purple-50 px-3 py-2 rounded-md animate-fade-in">
              💡 {getHint("blank1")}
            </div>
          )}

          {/* Вторая реплика - Иван */}
          <div className="flex items-start gap-4">
            <div className="flex items-center gap-2 w-20 flex-shrink-0">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                И
              </div>
              <span className="font-semibold text-gray-700 text-sm">Иван:</span>
            </div>

            <div className="flex items-center flex-wrap gap-2 flex-1">
              <span className="text-gray-700">Привет, Анна! Как</span>
              <div className="relative">
                <input
                  type="text"
                  name="blank2"
                  value={answers.dialogue.blank2}
                  onChange={(e) =>
                    handleAnswerChange("dialogue", {
                      name: e.target.name,
                      val: e.target.value,
                    })
                  }
                  onFocus={() => setFocusedField("blank2")}
                  onBlur={() => setFocusedField(null)}
                  className={`w-32 px-3 py-2 text-center border-b-2 bg-transparent focus:outline-none transition-all duration-300 ${
                    getFieldStatus("blank2") === "completed"
                      ? "border-green-500 text-green-700"
                      : focusedField === "blank2"
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-300"
                  }`}
                  placeholder="______"
                  autoComplete="off"
                />

                {getFieldStatus("blank2") === "completed" && (
                  <CheckCircle className="absolute -right-6 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
                )}
              </div>
              <span className="text-gray-700">?</span>
            </div>
          </div>

          {/* Подсказка для второго поля */}
          {focusedField === "blank2" && (
            <div className="ml-24 text-xs text-purple-600 bg-purple-50 px-3 py-2 rounded-md animate-fade-in">
              💡 {getHint("blank2")}
            </div>
          )}

          {/* Третья реплика - Анна */}
          <div className="flex items-start gap-4">
            <div className="flex items-center gap-2 w-20 flex-shrink-0">
              <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-rose-400 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                А
              </div>
              <span className="font-semibold text-gray-700 text-sm">Анна:</span>
            </div>

            <div className="flex items-center flex-wrap gap-2 flex-1">
              <div className="relative">
                <input
                  type="text"
                  name="blank3"
                  value={answers.dialogue.blank3}
                  onChange={(e) =>
                    handleAnswerChange("dialogue", {
                      name: e.target.name,
                      val: e.target.value,
                    })
                  }
                  onFocus={() => setFocusedField("blank3")}
                  onBlur={() => setFocusedField(null)}
                  className={`w-32 px-3 py-2 text-center border-b-2 bg-transparent focus:outline-none transition-all duration-300 ${
                    getFieldStatus("blank3") === "completed"
                      ? "border-green-500 text-green-700"
                      : focusedField === "blank3"
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-300"
                  }`}
                  placeholder="______"
                  autoComplete="off"
                />

                {getFieldStatus("blank3") === "completed" && (
                  <CheckCircle className="absolute -right-6 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
                )}
              </div>
              <span className="text-gray-700">, хорошо. А у тебя?</span>
            </div>
          </div>

          {/* Подсказка для третьего поля */}
          {focusedField === "blank3" && (
            <div className="ml-24 text-xs text-purple-600 bg-purple-50 px-3 py-2 rounded-md animate-fade-in">
              💡 {getHint("blank3")}
            </div>
          )}
        </div>

        {/* Завершающее сообщение */}
        {isDialogueComplete && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg animate-fade-in">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">
                Отличная работа! Диалог завершен.
              </span>
            </div>
            <p className="text-sm text-green-600 mt-1">
              Вы создали естественный диалог между друзьями на русском языке.
            </p>
          </div>
        )}
      </div>

      {/* Счетчик заполненных полей */}
      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
        <span>
          Заполнено полей: {Math.round((getDialogueProgress() / 100) * 3)} из 3
        </span>
        {!isDialogueComplete && (
          <span className="text-purple-600">Продолжайте заполнять диалог</span>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

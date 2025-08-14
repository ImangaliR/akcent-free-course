import { AlertCircle, CheckCircle, HelpCircle } from "lucide-react";

export const FillInTheBlankQuestion = ({ answers, handleAnswerChange }) => {
  const isAnswered = answers.fillInTheBlank.trim() !== "";
  const hasContent = answers.fillInTheBlank.length > 0;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100 transition-all duration-300 hover:shadow-md">
      {/* Заголовок с иконкой статуса */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <HelpCircle className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800">
            Грамматика (Grammar)
          </h3>
        </div>

        {/* Индикатор статуса */}
        <div className="flex items-center gap-2">
          {isAnswered ? (
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Заполнено</span>
            </div>
          ) : hasContent ? (
            <div className="flex items-center gap-1 text-amber-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">В процессе</span>
            </div>
          ) : (
            <div className="px-2 py-1 bg-gray-100 rounded-full">
              <span className="text-xs text-gray-500">Не заполнено</span>
            </div>
          )}
        </div>
      </div>

      {/* Инструкция */}
      <div className="mb-6">
        <p className="text-gray-600 mb-2">
          Fill in the blank. The word for "good" or "well" is...
        </p>
        <div className="text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-md border-l-4 border-blue-400">
          💡 Подсказка: Подумайте о том, как по-русски сказать "всё хорошо"
        </div>
      </div>

      {/* Основное поле ввода */}
      <div className="bg-white p-6 rounded-lg border-2 border-dashed border-gray-200 transition-all duration-300 hover:border-indigo-300 focus-within:border-indigo-500 focus-within:bg-indigo-50/30">
        <div className="flex items-center justify-center text-lg">
          <span className="mr-3 text-gray-700 font-medium">У меня всё</span>

          <div className="relative">
            <input
              type="text"
              className={`w-40 px-4 py-3 text-center text-lg font-medium border-b-3 bg-transparent focus:outline-none transition-all duration-300 ${
                isAnswered
                  ? "border-green-500 text-green-700"
                  : hasContent
                  ? "border-amber-500 text-amber-700"
                  : "border-gray-300 text-gray-700 focus:border-indigo-500"
              }`}
              placeholder="______"
              value={answers.fillInTheBlank}
              onChange={(e) =>
                handleAnswerChange("fillInTheBlank", e.target.value)
              }
              autoComplete="off"
            />

            {/* Анимированное подчеркивание */}
            <div
              className={`absolute bottom-0 left-0 h-0.5 transition-all duration-300 ${
                isAnswered
                  ? "w-full bg-green-500"
                  : hasContent
                  ? "w-3/4 bg-amber-500"
                  : "w-0 bg-indigo-500"
              }`}
            />
          </div>

          <span className="ml-3 text-gray-700 text-2xl">.</span>
        </div>

        {/* Дополнительная информация */}
        <div className="mt-4 text-center">
          <div className="text-sm text-gray-500">
            Введите русское слово в поле выше
          </div>
          {hasContent && (
            <div className="mt-2 text-xs text-gray-400">
              Длина ответа: {answers.fillInTheBlank.length} символов
            </div>
          )}
        </div>
      </div>

      {/* Прогресс заполнения */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span>Прогресс заполнения</span>
          <span>{isAnswered ? "100%" : hasContent ? "50%" : "0%"}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full transition-all duration-500 ${
              isAnswered
                ? "bg-green-500 w-full"
                : hasContent
                ? "bg-amber-500 w-1/2"
                : "bg-gray-300 w-0"
            }`}
          />
        </div>
      </div>

      {/* Дополнительные подсказки при фокусе */}
      <div className="mt-4 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300">
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-md">
          <strong>Совет:</strong> Это очень распространенное слово в русском
          языке, которое используется для выражения того, что всё в порядке.
        </div>
      </div>
    </div>
  );
};

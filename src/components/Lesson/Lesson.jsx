import { CheckCircle, Circle, LayoutGrid, Play, Rows } from "lucide-react";
import { useState } from "react";
import { ResultsPage } from "../../pages/Results";
import { DialogueQuestion } from "../DialogueQuestion/DialogueQuestion";
import { FillInTheBlankQuestion } from "../FillInTheBlankQuestion/FillInTheBlankQuestion";
import { MultipleChoiceQuestion } from "../MultipleQuestion/MultipleQuestion";
import { Pagination } from "../Pagination/Pagination";
import { SingleChoiceQuestion } from "../SingleQuestion/SingleQuestion";
import { VideoLesson } from "../VideoLesson/VideoLesson";

export const Lesson = ({ lesson, setCurrentLesson, currentLesson }) => {
  const [layoutMode, setLayoutMode] = useState("compact");
  const [currentPage, setCurrentPage] = useState(1);
  const [answers, setAnswers] = useState({
    singleChoice: "",
    multipleChoice: [],
    fillInTheBlank: "",
    dialogue: { blank1: "", blank2: "", blank3: "" },
  });
  const [score, setScore] = useState(null);
  const totalPages = layoutMode === "compact" ? 3 : 6;

  const { correctAnswers, totalScore } = lesson.quiz;

  // Проверка статуса заполнения вопросов
  const getQuestionStatus = (type) => {
    switch (type) {
      case "singleChoice":
        return answers.singleChoice !== "" ? "completed" : "pending";
      case "multipleChoice":
        return answers.multipleChoice.length > 0 ? "completed" : "pending";
      case "fillInTheBlank":
        return answers.fillInTheBlank.trim() !== "" ? "completed" : "pending";

      default:
        return "pending";
    }
  };

  // Получение названий страниц
  const getPageTitle = (pageNum) => {
    if (layoutMode === "compact") {
      switch (pageNum) {
        case 1:
          return "Видеоурок";
        case 2:
          return "Тестирование";
        case 3:
          return "Результаты";
        default:
          return `Страница ${pageNum}`;
      }
    } else {
      switch (pageNum) {
        case 1:
          return "Видеоурок";
        case 2:
          return "Одиночный выбор";
        case 3:
          return "Множественный выбор";
        case 4:
          return "Заполнить пропуски";
        case 5:
          return "Диалог";
        case 6:
          return "Результаты";
        default:
          return `Страница ${pageNum}`;
      }
    }
  };

  // Подсчет общего прогресса заполнения
  const getOverallProgress = () => {
    const statuses = [
      getQuestionStatus("singleChoice"),
      getQuestionStatus("multipleChoice"),
      getQuestionStatus("fillInTheBlank"),
      getQuestionStatus("dialogue"),
    ];
    const completed = statuses.filter(
      (status) => status === "completed"
    ).length;
    return (completed / 4) * 100;
  };

  const handleAnswerChange = (type, value) => {
    if (type === "multipleChoice") {
      setAnswers((prev) => ({
        ...prev,
        multipleChoice: prev.multipleChoice.includes(value)
          ? prev.multipleChoice.filter((item) => item !== value)
          : [...prev.multipleChoice, value],
      }));
    } else if (type === "dialogue") {
      const { name, val } = value;
      setAnswers((prev) => ({
        ...prev,
        dialogue: { ...prev.dialogue, [name]: val },
      }));
    } else {
      setAnswers((prev) => ({ ...prev, [type]: value }));
    }
  };

  const handleSubmit = () => {
    let currentScore = 0;
    if (answers.singleChoice === correctAnswers.singleChoice) currentScore++;
    const correctMultiple = correctAnswers.multipleChoice.sort();
    const userMultiple = answers.multipleChoice.sort();
    if (JSON.stringify(correctMultiple) === JSON.stringify(userMultiple))
      currentScore++;
    if (
      answers.fillInTheBlank.trim().toLowerCase() ===
      correctAnswers.fillInTheBlank
    )
      currentScore++;
    if (
      answers.dialogue.blank1.trim().toLowerCase() ===
      correctAnswers.dialogue.blank1.toLowerCase()
    )
      currentScore++;
    if (
      answers.dialogue.blank2.trim().toLowerCase() ===
      correctAnswers.dialogue.blank2.toLowerCase()
    )
      currentScore++;
    if (
      answers.dialogue.blank3.trim().toLowerCase() ===
      correctAnswers.dialogue.blank3.toLowerCase()
    )
      currentScore++;
    setScore(currentScore);
    setCurrentPage(totalPages);
  };

  const resetQuiz = () => {
    setAnswers({
      singleChoice: "",
      multipleChoice: [],
      fillInTheBlank: "",
      dialogue: { blank1: "", blank2: "", blank3: "" },
    });
    setScore(null);
    setCurrentPage(1);
  };

  const renderPage = () => {
    if (layoutMode === "compact") {
      switch (currentPage) {
        case 1:
          return (
            <div className="transition-all duration-300 ease-in-out">
              <VideoLesson videoUrl={lesson.videoUrl} title={lesson.title} />
            </div>
          );
        case 2:
          return (
            <div className="transition-all duration-300 ease-in-out space-y-8">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">
                  Тестирование
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    {getQuestionStatus("singleChoice") === "completed" ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Circle className="w-4 h-4 text-gray-400" />
                    )}
                    <span className="text-gray-700">Одиночный выбор</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {getQuestionStatus("multipleChoice") === "completed" ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Circle className="w-4 h-4 text-gray-400" />
                    )}
                    <span className="text-gray-700">Множественный выбор</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {getQuestionStatus("fillInTheBlank") === "completed" ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Circle className="w-4 h-4 text-gray-400" />
                    )}
                    <span className="text-gray-700">Заполнить пропуски</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {getQuestionStatus("dialogue") === "completed" ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Circle className="w-4 h-4 text-gray-400" />
                    )}
                    <span className="text-gray-700">Диалог</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${getOverallProgress()}%` }}
                  />
                </div>
              </div>

              <SingleChoiceQuestion
                answers={answers}
                handleAnswerChange={handleAnswerChange}
              />
              <MultipleChoiceQuestion
                answers={answers}
                handleAnswerChange={handleAnswerChange}
              />
              <FillInTheBlankQuestion
                answers={answers}
                handleAnswerChange={handleAnswerChange}
              />
              <DialogueQuestion
                answers={answers}
                handleAnswerChange={handleAnswerChange}
              />
            </div>
          );
        case 3:
          return (
            <div className="transition-all duration-300 ease-in-out">
              <ResultsPage score={score} totalScore={totalScore} />
            </div>
          );
        default:
          return (
            <div className="transition-all duration-300 ease-in-out">
              <VideoLesson videoUrl={lesson.videoUrl} title={lesson.title} />
            </div>
          );
      }
    } else {
      switch (currentPage) {
        case 1:
          return (
            <div className="transition-all duration-300 ease-in-out">
              <VideoLesson videoUrl={lesson.videoUrl} title={lesson.title} />
            </div>
          );
        case 2:
          return (
            <div className="transition-all duration-300 ease-in-out">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">
                  Одиночный выбор
                </h3>
                {getQuestionStatus("singleChoice") === "completed" && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Завершено</span>
                  </div>
                )}
              </div>
              <SingleChoiceQuestion
                answers={answers}
                handleAnswerChange={handleAnswerChange}
              />
            </div>
          );
        case 3:
          return (
            <div className="transition-all duration-300 ease-in-out">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">
                  Множественный выбор
                </h3>
                {getQuestionStatus("multipleChoice") === "completed" && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Завершено</span>
                  </div>
                )}
              </div>
              <MultipleChoiceQuestion
                answers={answers}
                handleAnswerChange={handleAnswerChange}
              />
            </div>
          );
        case 4:
          return (
            <div className="transition-all duration-300 ease-in-out">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">
                  Заполнить пропуски
                </h3>
                {getQuestionStatus("fillInTheBlank") === "completed" && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Завершено</span>
                  </div>
                )}
              </div>
              <FillInTheBlankQuestion
                answers={answers}
                handleAnswerChange={handleAnswerChange}
              />
            </div>
          );
        case 5:
          return (
            <div className="transition-all duration-300 ease-in-out">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Диалог</h3>
                {getQuestionStatus("dialogue") === "completed" && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Завершено</span>
                  </div>
                )}
              </div>
              <DialogueQuestion
                answers={answers}
                handleAnswerChange={handleAnswerChange}
              />
            </div>
          );
        case 6:
          return (
            <div className="transition-all duration-300 ease-in-out">
              <ResultsPage score={score} totalScore={totalScore} />
            </div>
          );
        default:
          return (
            <div className="transition-all duration-300 ease-in-out">
              <VideoLesson videoUrl={lesson.videoUrl} title={lesson.title} />
            </div>
          );
      }
    }
  };

  const handleLayoutChange = (mode) => {
    setLayoutMode(mode);
    setCurrentPage(2);
  };

  return (
    <div className="w-full bg-white p-6 sm:p-8 rounded-xl shadow-lg min-h-[550px] flex flex-col justify-between">
      {/* Общий прогресс-индикатор */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900">
            {getPageTitle(currentPage)}
          </h2>
          <span className="text-sm text-gray-500">
            {currentPage} из {totalPages}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentPage / totalPages) * 100}%` }}
          />
        </div>
      </div>

      {/* Breadcrumb навигация */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 text-sm">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(
            (pageNum, index) => (
              <div key={pageNum} className="flex items-center">
                <span
                  className={`px-2 py-1 rounded transition-colors ${
                    pageNum === currentPage
                      ? "bg-indigo-100 text-indigo-700 font-medium"
                      : pageNum < currentPage
                      ? "text-green-600"
                      : "text-gray-400"
                  }`}
                >
                  {pageNum === currentPage && (
                    <Play className="w-3 h-3 inline mr-1" />
                  )}
                  {getPageTitle(pageNum)}
                </span>
                {index < totalPages - 1 && (
                  <span className="mx-2 text-gray-300">→</span>
                )}
              </div>
            )
          )}
        </div>
      </div>

      {/* Переключатель режимов отображения */}
      {currentPage >= 2 && currentPage < totalPages && (
        <div className="flex justify-end mb-6">
          <div className="bg-gray-100 rounded-lg p-1 flex">
            <button
              onClick={() => handleLayoutChange("compact")}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                layoutMode === "compact"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              title="Компактный режим - все вопросы на одной странице"
            >
              <Rows className="w-4 h-4" />
              <span>Все сразу</span>
            </button>

            <button
              onClick={() => handleLayoutChange("step")}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                layoutMode === "step"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              title="Пошаговый режим - по одному вопросу на странице"
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Пошагово</span>
            </button>
          </div>
        </div>
      )}

      {/* Основное содержимое */}
      <div className="flex-1">{renderPage()}</div>

      {/* Навигация */}
      <div className="mt-8">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
          handleSubmit={handleSubmit}
          resetQuiz={resetQuiz}
          setCurrentLesson={setCurrentLesson}
          currentLesson={currentLesson}
        />
      </div>
    </div>
  );
};

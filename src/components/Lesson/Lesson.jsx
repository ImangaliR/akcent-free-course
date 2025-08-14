import { useState } from "react";
import { VideoLesson } from "../VideoLesson/VideoLesson";
import { SingleChoiceQuestion } from "../SingleQuestion/SingleQuestion";
import { MultipleChoiceQuestion } from "../MultipleQuestion/MultipleQuestion";
import { FillInTheBlankQuestion } from "../FillInTheBlankQuestion/FillInTheBlankQuestion";
import { DialogueQuestion } from "../DialogueQuestion/DialogueQuestion";
import { ResultsPage } from "../../pages/Results";
import { Pagination } from "../Pagination/Pagination";
import { LayoutGrid, Rows } from "lucide-react";

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
            <VideoLesson videoUrl={lesson.videoUrl} title={lesson.title} />
          );
        case 2:
          return (
            <>
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
            </>
          );
        case 3:
          return <ResultsPage score={score} totalScore={totalScore} />;
        default:
          return (
            <VideoLesson videoUrl={lesson.videoUrl} title={lesson.title} />
          );
      }
    } else {
      switch (currentPage) {
        case 1:
          return (
            <VideoLesson videoUrl={lesson.videoUrl} title={lesson.title} />
          );
        case 2:
          return (
            <SingleChoiceQuestion
              answers={answers}
              handleAnswerChange={handleAnswerChange}
            />
          );
        case 3:
          return (
            <MultipleChoiceQuestion
              answers={answers}
              handleAnswerChange={handleAnswerChange}
            />
          );
        case 4:
          return (
            <FillInTheBlankQuestion
              answers={answers}
              handleAnswerChange={handleAnswerChange}
            />
          );
        case 5:
          return (
            <DialogueQuestion
              answers={answers}
              handleAnswerChange={handleAnswerChange}
            />
          );
        case 6:
          return <ResultsPage score={score} totalScore={totalScore} />;
        default:
          return (
            <VideoLesson videoUrl={lesson.videoUrl} title={lesson.title} />
          );
      }
    }
  };

  const handleLayoutChange = (mode) => {
    if (currentPage === totalPages) return;
    setLayoutMode(mode);

    if (mode === "compact" && currentPage > 2) {
      setCurrentPage(2);
    } else if (mode === "step" && currentPage > 5) {
      setCurrentPage(2);
    }
  };

  return (
    <div className="w-full bg-white p-6 sm:p-8 rounded-xl shadow-lg min-h-[550px] flex flex-col justify-between">
      {currentPage >= 2 && currentPage !== totalPages && (
        <div className="flex justify-end mb-4">
          <div className="flex justify-end mb-4 gap-2">
            <button
              onClick={() => handleLayoutChange("compact")}
              className={`p-2 border rounded-lg transition-colors ${
                layoutMode === "compact"
                  ? "bg-indigo-50 text-indigo-600 border-indigo-300"
                  : "text-gray-400 hover:text-gray-600"
              }`}
              title="Compact Mode"
            >
              <Rows className="w-5 h-5" />
            </button>

            <button
              onClick={() => handleLayoutChange("step")}
              className={`p-2 border rounded-lg transition-colors ${
                layoutMode === "step"
                  ? "bg-indigo-50 text-indigo-600 border-indigo-300"
                  : "text-gray-400 hover:text-gray-600"
              }`}
              title="Step-by-Step Mode"
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {renderPage()}

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
  );
};

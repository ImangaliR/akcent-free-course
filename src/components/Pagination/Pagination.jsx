import { RefreshCcwIcon } from "lucide-react";

export const Pagination = ({
  currentPage,
  totalPages,
  setCurrentPage,
  handleSubmit,
  setCurrentLesson,
  currentLesson,
  resetQuiz,
}) => (
  <div className="flex justify-between items-center pt-8 mt-auto">
    <div>
      <button
        disabled={currentPage <= 1}
        onClick={() => setCurrentPage(currentPage - 1)}
        className="text-sm md:text-base px-6 py-2 mr-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
      >
        Назад
      </button>
    </div>
    <div>
      {currentPage < totalPages - 1 && (
        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          className="text-sm md:text-base px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Далее
        </button>
      )}
      {currentPage === totalPages - 1 && (
        <button
          onClick={handleSubmit}
          className="text-sm md:text-base px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Отправить
        </button>
      )}
      {currentPage === totalPages && (
        <div className="flex items-center gap-2 md:gap-5">
          <button
            onClick={resetQuiz}
            className="flex items-center gap-2 text-sm md:text-base text-white px-3 md:px-6 py-2 bg-blue-600 rounded-lg transition-colors"
          >
            <RefreshCcwIcon className="w-4 h-4" />
            <span className="hidden md:inline">Повторить снова</span>
          </button>
          <button
            onClick={() => setCurrentLesson(currentLesson + 1)}
            className="text-sm md:text-base px-3 md:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Cледующий урок
          </button>
        </div>
      )}
    </div>
  </div>
);

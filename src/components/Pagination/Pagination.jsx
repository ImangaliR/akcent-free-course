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
        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
      >
        Назад
      </button>
    </div>
    <div className="text-gray-500">
      {currentPage <= totalPages - 1
        ? `Page ${currentPage} of ${totalPages - 1}`
        : ""}
    </div>
    <div>
      {currentPage < totalPages - 1 && (
        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Далее
        </button>
      )}
      {currentPage === totalPages - 1 && (
        <button
          onClick={handleSubmit}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Отправить
        </button>
      )}
      {currentPage === totalPages && (
        <div className="flex items-center gap-5">
          <button
            onClick={resetQuiz}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Попробовать снова
          </button>
          <button
            onClick={() => setCurrentLesson(currentLesson + 1)}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Перейти на следующий урок
          </button>
        </div>
      )}
    </div>
  </div>
);

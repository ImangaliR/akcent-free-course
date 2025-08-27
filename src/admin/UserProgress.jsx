import { Link, useParams } from "react-router-dom";

const UserProgress = ({ data }) => {
  const { userId } = useParams();

  // Handle cases where user data or the user ID is not found.
  if (!data || !data.users[userId]) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-xl">
          <p className="text-xl font-medium text-gray-700">
            Пользователь не найден.
          </p>
          <Link
            to="/admin/users"
            className="mt-4 inline-block text-blue-600 hover:text-blue-800 transition-colors"
          >
            &larr; Вернуться к списку пользователей
          </Link>
        </div>
      </div>
    );
  }

  const user = data.users[userId];
  const storage = data.storage[userId];

  // Safely parse JSON strings from the storage object.
  let courseProgress = {};
  let userAnswers = {};

  if (storage && storage.course_progress) {
    try {
      courseProgress = JSON.parse(storage.course_progress.value);
    } catch (e) {
      console.error("Ошибка парсинга course_progress:", e);
    }
  }

  if (storage && storage.user_answers) {
    try {
      userAnswers = JSON.parse(storage.user_answers.value);
    } catch (e) {
      console.error("Ошибка парсинга user_answers:", e);
    }
  }

  return (
    <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-8xl mx-auto">
      <Link
        to="/adminqwertyuiop/users"
        className="text-blue-600 hover:text-blue-800 mb-6 inline-flex items-center space-x-2 transition-colors duration-200"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
        <span>Назад к списку</span>
      </Link>
      <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b-2 border-gray-200 pb-2">
        Прогресс пользователя: {user.name} {user.surname}
      </h2>

      {storage ? (
        <div className="space-y-8">
          {/* Section for overall course progress */}
          <div className="p-6 bg-gray-50 rounded-xl shadow-inner border border-gray-100">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">
              Курсовой прогресс
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <p className="text-sm text-gray-500 font-medium">
                  Пройдено блоков
                </p>
                <p className="text-3xl font-bold text-indigo-600 mt-1">
                  {courseProgress.completedBlocks?.length || 0}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <p className="text-sm text-gray-500 font-medium">
                  Текущий блок
                </p>
                <p className="text-xl font-bold text-gray-800 mt-1">
                  {courseProgress.currentBlockIndex}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <p className="text-sm text-gray-500 font-medium">
                  Общее время изучения
                </p>
                <p className="text-xl font-bold text-gray-800 mt-1">
                  {storage.total_study_time.value} секунд
                </p>
              </div>
            </div>
          </div>

          {/* Section for individual block answers and results */}
          <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">
              Ответы и результаты
            </h3>
            <div className="space-y-6 divide-y divide-gray-200">
              {Object.values(userAnswers).map((answer, index) => {
                let content;
                const passedStatus = answer.passed
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700";

                switch (answer.blockType) {
                  case "video":
                    content = (
                      <p className="text-sm text-gray-600">
                        Просмотрено:{" "}
                        <span className="font-mono">
                          {answer.timeSpent.toFixed(2)}
                        </span>{" "}
                        секунд
                      </p>
                    );
                    break;
                  case "imagequiz":
                  case "multiblanktask":
                  case "matchtask":
                    content = (
                      <p className="text-sm text-gray-600">
                        Прогресс:{" "}
                        <span className="font-bold">
                          {answer.stats?.percent}%
                        </span>{" "}
                        ({answer.stats?.mainCorrect} из {answer.stats?.total}{" "}
                        правильных)
                      </p>
                    );
                    break;
                  case "audiotask":
                    content = (
                      <p className="text-sm text-gray-600">
                        Прогресс:{" "}
                        <span className="font-bold">
                          {answer.stats?.percent}%
                        </span>{" "}
                        (Основных: {answer.stats?.mainCorrect}, Исправленных:{" "}
                        {answer.stats?.redemptionCorrect})
                      </p>
                    );
                    break;
                  case "infocard":
                  case "chatgame":
                    content = (
                      <p className="text-sm text-gray-600">Просмотрено</p>
                    );
                    break;
                  default:
                    content = (
                      <p className="text-sm text-gray-600">
                        Данные о прогрессе отсутствуют
                      </p>
                    );
                }

                return (
                  <div key={index} className="pt-4 first:pt-0">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-semibold text-lg text-gray-800">
                        {answer.blockId}
                      </h4>
                      {answer.passed !== undefined && (
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-full ${passedStatus}`}
                        >
                          {answer.passed ? "Пройдено" : "Не пройдено"}
                        </span>
                      )}
                    </div>
                    {content}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <p className="text-gray-600 mt-4">
          У этого пользователя пока нет данных о прогрессе.
        </p>
      )}
    </div>
  );
};

export default UserProgress;

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

const Users = ({ users, storage }) => {
  const [sortBy, setSortBy] = useState("progress"); // "date", "progress", "name"

  if (!users) {
    return (
      <div className="text-center py-8 text-gray-500">
        Данные пользователей не найдены.
      </div>
    );
  }

  // === Настройка "все блоки" ===
  // Считаем, что пользователь прошёл все блоки, если у него 13 или 14 завершённых.
  const ALL_COMPLETE_COUNTS = useMemo(() => new Set([13, 14]), []);

  // Проверка наличия прогресса у пользователя
  const hasProgress = (userId) => {
    if (!storage || !storage[userId]) return false;
    const userStorage = storage[userId];

    const hasCourseProgress =
      userStorage.course_progress &&
      userStorage.course_progress.value &&
      userStorage.course_progress.value !== "{}";

    const hasUserAnswers =
      userStorage.user_answers &&
      userStorage.user_answers.value &&
      userStorage.user_answers.value !== "{}";

    return hasCourseProgress || hasUserAnswers;
  };

  // Количество пройденных блоков
  const getCompletedBlocksCount = (userId) => {
    if (!storage || !storage[userId] || !storage[userId].course_progress)
      return 0;

    try {
      const courseProgress = JSON.parse(storage[userId].course_progress.value);
      return courseProgress.completedBlocks?.length || 0;
    } catch {
      return 0;
    }
  };

  // Статистика: нет данных / 0 блоков / все блоки (13 или 14)
  const stats = useMemo(() => {
    let noData = 0;
    let zeroBlocks = 0;
    let allBlocks = 0;

    Object.keys(users).forEach((id) => {
      if (!hasProgress(id)) {
        noData++;
      } else {
        const completed = getCompletedBlocksCount(id);
        if (completed === 0) zeroBlocks++;
        if (ALL_COMPLETE_COUNTS.has(completed)) allBlocks++;
      }
    });

    return { noData, zeroBlocks, allBlocks };
  }, [users, storage, ALL_COMPLETE_COUNTS]);

  // Parse helpers
  const getProgressRecord = (userId) => {
    if (!storage || !storage[userId] || !storage[userId].course_progress)
      return null;
    try {
      return JSON.parse(storage[userId].course_progress.value);
    } catch {
      return null;
    }
  };

  const getAnswersRecord = (userId) => {
    if (!storage || !storage[userId] || !storage[userId].user_answers)
      return null;
    try {
      return JSON.parse(storage[userId].user_answers.value);
    } catch {
      return null;
    }
  };

  // When did user complete all blocks?
  const getAllBlocksCompletionDate = (userId) => {
    const progress = getProgressRecord(userId);
    if (!progress) return null;

    const completed = Array.isArray(progress.completedBlocks)
      ? progress.completedBlocks
      : [];
    if (!ALL_COMPLETE_COUNTS.has(completed.length)) return null; // not all blocks yet

    const answers = getAnswersRecord(userId) || {};

    // Find the latest completedAt among the completed blocks
    const timestamps = completed
      .map((ref) => answers?.[ref]?.completedAt)
      .filter(Boolean)
      .map((iso) => new Date(iso))
      .filter((d) => !isNaN(d));

    if (timestamps.length > 0) {
      // Latest completion time of any block
      return new Date(Math.max(...timestamps.map((d) => d.getTime())));
    }

    // Fallback: use progress.lastUpdated if present
    if (progress.lastUpdated) {
      const d = new Date(progress.lastUpdated);
      if (!isNaN(d)) return d;
    }

    return null;
  };

  // Сортировка
  const sortUsers = (userKeys) => {
    return userKeys.sort((a, b) => {
      switch (sortBy) {
        case "progress": {
          const aHas = hasProgress(a);
          const bHas = hasProgress(b);
          if (aHas && !bHas) return -1;
          if (!aHas && bHas) return 1;
          if (aHas && bHas) {
            return getCompletedBlocksCount(b) - getCompletedBlocksCount(a);
          }
          return 0;
        }
        case "name":
          return (users[a].name || "").localeCompare(users[b].name || "");
        case "date":
        default: {
          const dateA = new Date(users[a].createdAt);
          const dateB = new Date(users[b].createdAt);
          return dateB - dateA; // новые первыми
        }
      }
    });
  };

  const userKeys = sortUsers(Object.keys(users));

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">
          Список пользователей
        </h2>

        {/* Селектор сортировки */}
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600">Сортировать по:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="date">Дате регистрации</option>
            <option value="progress">Прогрессу</option>
            <option value="name">Имени</option>
          </select>
        </div>
      </div>

      {/* Статистика */}
      <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
          <div className="text-xs text-gray-500">Без данных</div>
          <div className="text-lg font-semibold">{stats.noData}</div>
        </div>
        <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
          <div className="text-xs text-gray-500">0 блоков</div>
          <div className="text-lg font-semibold">{stats.zeroBlocks}</div>
        </div>
        <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
          <div className="text-xs text-gray-500">Все блоки (13/14)</div>
          <div className="text-lg font-semibold">{stats.allBlocks}</div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Имя
              </th>
              <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Возраст
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Логин
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Дата регистрации
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Завершение всех блоков
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Прогресс
              </th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {userKeys.map((key, index) => {
              const user = users[key];
              const userHasProgress = hasProgress(key);
              const completedBlocks = getCompletedBlocksCount(key);

              return (
                <tr key={key} className="hover:bg-gray-50 transition-colors">
                  {/* ID column */}
                  <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    {index + 1}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.name} {user.surname}
                  </td>
                  <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    {user.age || "Не указан"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.login}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleString("ru-RU", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {ALL_COMPLETE_COUNTS.has(completedBlocks)
                      ? (() => {
                          const doneAt = getAllBlocksCompletionDate(key);
                          return doneAt
                            ? doneAt.toLocaleString("ru-RU", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "Дата не найдена";
                        })()
                      : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {userHasProgress ? (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {completedBlocks} блоков
                        </span>
                        {ALL_COMPLETE_COUNTS.has(completedBlocks) && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-700">
                            все блоки
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Нет данных
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      to={`/adminqwertyuiop/users/${key}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Подробнее
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;

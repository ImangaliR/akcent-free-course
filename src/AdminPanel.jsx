import {
  Award,
  CheckCircle,
  ChevronDown,
  Download,
  Eye,
  Filter,
  Image,
  Info,
  MessageSquare,
  MoreHorizontal,
  PlayCircle,
  RefreshCw,
  Search,
  Settings,
  Shuffle,
  SortAsc,
  SortDesc,
  TrendingUp,
  UserCheck,
  Users,
  Volume2,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactDOM from "react-dom";

/**
 * Single-file Admin Panel (JSX) with:
 * - Clean separation (components + hook) in one file
 * - Stable modal rendered through a Portal (no z-index stacking bugs)
 * - Filtering, sorting, pagination
 * - CSV export
 * - Skeletons and empty states
 * - TailwindCSS styles
 */

// =========================
// Utils
// =========================
const cls = (...xs) => xs.filter(Boolean).join(" ");
const formatTimeSpent = (seconds) => {
  if (!seconds) return "0 мин";
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return hours > 0 ? `${hours}ч ${mins}м` : `${mins}м`;
};
const getStatusColor = (status) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "inactive":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};
const getStatusText = (status) => {
  switch (status) {
    case "active":
      return "Активный";
    case "pending":
      return "Ожидание";
    case "inactive":
      return "Неактивный";
    default:
      return "Неизвестно";
  }
};

const toCSV = (rows) => {
  if (!rows?.length) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v) =>
    typeof v === "string" ? '"' + v.replaceAll('"', '""') + '"' : v ?? "";
  const lines = [headers.join(",")].concat(
    rows.map((r) => headers.map((h) => escape(r[h])).join(","))
  );
  return lines.join("\n");
};
const downloadFile = (filename, text) => {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// =========================
// Data hook
// =========================
const API_BASE =
  "https://us-central1-akcent-course.cloudfunctions.net/api/storage";

const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState("lastActive");
  const [sortDirection, setSortDirection] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    completedCourses: 0,
    avgProgress: 0,
  });

  const userToken =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!userToken) throw new Error("Токен не найден в localStorage");

      const userResp = await fetch(
        `https://us-central1-akcent-course.cloudfunctions.net/api/user?token=${userToken}`
      );
      if (!userResp.ok)
        throw new Error("Не удалось загрузить информацию о пользователе");
      const userData = await userResp.json();

      const realUser = {
        id: userData.user?.login || "1",
        token: userToken,
        name: userData.user?.name || "Пользователь",
        surname: userData.user?.surname || "",
        email: userData.user?.email || "email@example.com",
        login: userData.user?.login || "",
        age: userData.user?.age ?? null,
        gender: userData.user?.gender ?? null,
        createdAt: userData.user?.createdAt || new Date().toISOString(),
        lastActive: new Date().toISOString(),
        status: "active",
      };

      const courseData = await loadUserCourseData(realUser.token);
      const allUsers = [{ ...realUser, ...courseData }];
      setUsers(allUsers);
      computeStats(allUsers);
    } catch (e) {
      console.error(e);
      setError(e.message || "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  };

  const loadUserCourseData = async (token) => {
    try {
      const progressResp = await fetch(
        `${API_BASE}?token=${token}&key=course_progress`
      );
      let progress = null;
      if (progressResp.ok) {
        const progressData = await progressResp.json();
        if (progressData.value) progress = JSON.parse(progressData.value);
      }

      const answersResp = await fetch(
        `${API_BASE}?token=${token}&key=user_answers`
      );
      let answers = null;
      if (answersResp.ok) {
        const answersData = await answersResp.json();
        if (answersData.value) answers = JSON.parse(answersData.value);
      }

      let calculatedProgress = 0;
      let completedBlocks = 0;
      let totalBlocks = 0;
      let totalTimeSpent = 0;

      if (answers) {
        const blocks = Object.values(answers);
        totalBlocks = blocks.length;
        completedBlocks = blocks.filter((b) => b.completed).length;
        calculatedProgress =
          totalBlocks > 0
            ? Math.round((completedBlocks / totalBlocks) * 100)
            : 0;
        totalTimeSpent = blocks.reduce((acc, b) => acc + (b.timeSpent || 0), 0);
      }

      return {
        progress: calculatedProgress,
        completedBlocks,
        totalBlocks,
        timeSpent: totalTimeSpent,
        answers,
        courseProgress: progress,
      };
    } catch (e) {
      console.warn("Fallback to mock answers due to error:", e);
      const answers = generateMockAnswers();
      const blocks = Object.values(answers);
      const completedBlocks = blocks.filter((b) => b.completed).length;
      const totalBlocks = blocks.length;
      const calculatedProgress = totalBlocks
        ? Math.round((completedBlocks / totalBlocks) * 100)
        : 0;
      const totalTimeSpent = blocks.reduce((a, b) => a + (b.timeSpent || 0), 0);
      return {
        progress: calculatedProgress,
        completedBlocks,
        totalBlocks,
        timeSpent: totalTimeSpent,
        answers,
        courseProgress: {
          completedBlocks: Object.keys(answers),
          currentBlockIndex: "block_20",
        },
      };
    }
  };

  const generateMockAnswers = () => {
    const blockTypes = [
      "video",
      "multiblanktask",
      "chatgame",
      "audiotask",
      "imagequiz",
      "matchtask",
    ];
    const answers = {};
    for (let i = 1; i <= 20; i++) {
      answers[`block_${i}`] = {
        blockId: `Блок ${i}`,
        blockType: blockTypes[Math.floor(Math.random() * blockTypes.length)],
        completed: Math.random() > 0.3,
        passed: Math.random() > 0.2,
        timeSpent: Math.floor(Math.random() * 600),
        completedAt: new Date(
          Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        stats: {
          mainCorrect: Math.floor(Math.random() * 10),
          total: 10,
          percent: Math.floor(Math.random() * 100),
        },
        answers: [
          { isCorrect: Math.random() > 0.5 },
          { isCorrect: Math.random() > 0.5 },
        ],
      };
    }
    return answers;
  };

  const computeStats = (usersData) => {
    const totalUsers = usersData.length;
    const activeUsers = usersData.filter((u) => u.status === "active").length;
    const completedCourses = usersData.filter((u) => u.progress >= 80).length;
    const avgProgress = totalUsers
      ? Math.round(
          usersData.reduce((a, u) => a + (u.progress || 0), 0) / totalUsers
        )
      : 0;
    setStats({ totalUsers, activeUsers, completedCourses, avgProgress });
  };

  const filteredAndSorted = useMemo(() => {
    const term = (searchTerm || "").toLowerCase();
    const filtered = users.filter((u) => {
      const matchesSearch =
        (u.name || "").toLowerCase().includes(term) ||
        (u.email || "").toLowerCase().includes(term) ||
        (u.login || "").toLowerCase().includes(term);
      const matchesStatus = statusFilter === "all" || u.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    const sorted = filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === "lastActive" || sortField === "createdAt") {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = (bValue || "").toLowerCase();
      }
      if (sortDirection === "asc") return aValue > bValue ? 1 : -1;
      return aValue < bValue ? 1 : -1;
    });

    return sorted;
  }, [users, searchTerm, statusFilter, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredAndSorted.length / pageSize) || 1;
  const currentPageSafe = Math.min(Math.max(1, currentPage), totalPages);
  const pageSlice = useMemo(() => {
    const start = (currentPageSafe - 1) * pageSize;
    return filteredAndSorted.slice(start, start + pageSize);
  }, [filteredAndSorted, currentPageSafe, pageSize]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const exportCSV = () => {
    const csvRows = filteredAndSorted.map((u) => ({
      id: u.id,
      name: u.name,
      surname: u.surname,
      email: u.email,
      login: u.login,
      status: getStatusText(u.status),
      progress: u.progress,
      completedBlocks: u.completedBlocks,
      totalBlocks: u.totalBlocks,
      timeSpent: u.timeSpent,
      createdAt: u.createdAt,
      lastActive: u.lastActive,
    }));
    const csv = toCSV(csvRows);
    downloadFile("users.csv", csv);
  };

  return {
    users,
    loading,
    error,
    stats,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    sortField,
    sortDirection,
    handleSort,
    currentPage: currentPageSafe,
    setCurrentPage,
    totalPages,
    pageSize,
    setPageSize,
    filteredAndSorted,
    pageSlice,
    reload: load,
    exportCSV,
  };
};

// =========================
// Modal via Portal
// =========================
const Modal = ({ open, onClose, children }) => {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && open) onClose?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[100]">
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === overlayRef.current) onClose?.();
        }}
      />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden max-h-[90vh] flex flex-col">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

// =========================
// Presentational components
// =========================
const StatsCards = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">
              Всего пользователей
            </p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {stats.totalUsers}
            </p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">
              Активные пользователи
            </p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {stats.activeUsers}
            </p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <UserCheck className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Завершили курс</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {stats.completedCourses}
            </p>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg">
            <Award className="w-6 h-6 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">
              Средний прогресс
            </p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {stats.avgProgress}%
            </p>
          </div>
          <div className="p-3 bg-orange-50 rounded-lg">
            <TrendingUp className="w-6 h-6 text-orange-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

const TableHeaderSort = ({
  label,
  field,
  sortField,
  sortDirection,
  onSort,
}) => (
  <button
    onClick={() => onSort(field)}
    className="flex items-center space-x-1 hover:text-gray-700"
  >
    <span>{label}</span>
    {sortField === field &&
      (sortDirection === "asc" ? (
        <SortAsc className="w-4 h-4" />
      ) : (
        <SortDesc className="w-4 h-4" />
      ))}
  </button>
);

const UsersTable = ({ rows, sortField, sortDirection, onSort, onView }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-900">
          Пользователи ({rows.length})
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <TableHeaderSort
                  label="Пользователь"
                  field="name"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={onSort}
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <TableHeaderSort
                  label="Статус"
                  field="status"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={onSort}
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <TableHeaderSort
                  label="Прогресс"
                  field="progress"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={onSort}
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Время обучения
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <TableHeaderSort
                  label="Последняя активность"
                  field="lastActive"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={onSort}
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">
                        {(user.name || "?").charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.name} {user.surname}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={cls(
                      "inline-flex px-2 py-1 text-xs font-semibold rounded-full",
                      getStatusColor(user.status)
                    )}
                  >
                    {getStatusText(user.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${user.progress || 0}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {user.progress || 0}% ({user.completedBlocks || 0}/
                    {user.totalBlocks || 0} блоков)
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatTimeSpent(user.timeSpent)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.lastActive).toLocaleDateString("ru-RU")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onView(user)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Просмотр"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      className="text-gray-400 hover:text-gray-600"
                      title="Ещё"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Pager = ({ current, total, onPrev, onNext, onJump }) => {
  const pages = [];
  const start = Math.max(1, current - 2);
  const end = Math.min(total, current + 2);
  for (let p = start; p <= end; p++) pages.push(p);

  return (
    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={onPrev}
          disabled={current === 1}
          className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          Предыдущая
        </button>
        <button
          onClick={onNext}
          disabled={current === total}
          className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          Следующая
        </button>
      </div>
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div className="text-sm text-gray-700">
          Страница <span className="font-medium">{current}</span> из{" "}
          <span className="font-medium">{total}</span>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            <button
              onClick={onPrev}
              disabled={current === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronDown className="w-5 h-5 rotate-90" />
            </button>
            {start > 1 && (
              <button
                onClick={() => onJump(1)}
                className="relative inline-flex items-center px-4 py-2 border bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                1
              </button>
            )}
            {start > 2 && (
              <span className="px-2 py-2 border bg-white text-sm text-gray-400">
                …
              </span>
            )}
            {pages.map((p) => (
              <button
                key={p}
                onClick={() => onJump(p)}
                className={cls(
                  "relative inline-flex items-center px-4 py-2 border text-sm font-medium",
                  current === p
                    ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                    : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                )}
              >
                {p}
              </button>
            ))}
            {end < total - 1 && (
              <span className="px-2 py-2 border bg-white text-sm text-gray-400">
                …
              </span>
            )}
            {end < total && (
              <button
                onClick={() => onJump(total)}
                className="relative inline-flex items-center px-4 py-2 border bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                {total}
              </button>
            )}
            <button
              onClick={onNext}
              disabled={current === total}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronDown className="w-5 h-5 -rotate-90" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

// --- Sub-components for each block type (for a detailed modal) ---

const VideoDetails = ({ data }) => (
  <div className="flex items-center space-x-2 text-gray-700">
    <PlayCircle className="w-5 h-5 text-blue-500" />
    <span className="font-medium">Просмотрено:</span>
    <span className="text-sm">{data.watched ? "Да" : "Нет"}</span>
    <span className="font-medium ml-4">Время:</span>
    <span className="text-sm">{formatTimeSpent(data.timeSpent)}</span>
  </div>
);

const ChatgameDetails = ({ data }) => (
  <div className="flex items-center space-x-2 text-gray-700">
    <MessageSquare className="w-5 h-5 text-purple-500" />
    <span className="font-medium">Результат:</span>
    <span className="text-sm">
      {data.stats.correct} из {data.stats.total} правильных ответов
    </span>
  </div>
);

const MultiblanktaskDetails = ({ data }) => (
  <div className="space-y-2 mt-2">
    <div className="flex items-center space-x-2 text-gray-700">
      <Shuffle className="w-5 h-5 text-green-500" />
      <span className="font-medium">Результат:</span>
      <span className="text-sm">
        {data.stats.mainCorrect} из {data.stats.total} правильных ответов
      </span>
      <span className="text-xs text-gray-500 ml-2">
        ({data.stats.percent}%)
      </span>
    </div>
    <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
      {data.answers?.map((ans, idx) => (
        <li
          key={idx}
          className={cls(ans.isCorrect ? "text-green-700" : "text-red-700")}
        >
          Вопрос {idx + 1}:{" "}
          <span className="font-medium">
            {ans.isCorrect ? "Правильно" : "Неправильно"}
          </span>
        </li>
      ))}
    </ul>
  </div>
);

const AudiotaskDetails = ({ data }) => (
  <div className="space-y-2 mt-2">
    <div className="flex items-center space-x-2 text-gray-700">
      <Volume2 className="w-5 h-5 text-orange-500" />
      <span className="font-medium">Результат:</span>
      <span className="text-sm">
        {data.stats.mainCorrect} из {data.stats.total} правильных ответов
      </span>
      <span className="text-xs text-gray-500 ml-2">
        ({data.stats.percent}%)
      </span>
    </div>
    <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
      {data.answers?.map((ans, idx) => (
        <li key={idx}>
          <span className="font-medium">Вопрос {idx + 1}:</span>{" "}
          <span
            className={cls(ans.isCorrect ? "text-green-700" : "text-red-700")}
          >
            {ans.isCorrect ? "Правильно" : "Неправильно"}
          </span>
          <br />
          <span className="text-xs italic text-gray-500">
            (Выбрано: {ans.question.options[ans.answer]?.label || ans.answer})
          </span>
        </li>
      ))}
    </ul>
  </div>
);

const ImageQuizDetails = ({ data }) => (
  <div className="space-y-2 mt-2">
    <div className="flex items-center space-x-2 text-gray-700">
      <Image className="w-5 h-5 text-indigo-500" />
      <span className="font-medium">Результат:</span>
      <span className="text-sm">
        {data.stats.mainCorrect} из {data.stats.total} правильных ответов
      </span>
      <span className="text-xs text-gray-500 ml-2">
        ({data.stats.percent}%)
      </span>
    </div>
    <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
      {data.answers?.map((ans, idx) => (
        <li key={idx}>
          <span className="font-medium">Вопрос {idx + 1}:</span>{" "}
          <span
            className={cls(ans.isCorrect ? "text-green-700" : "text-red-700")}
          >
            {ans.isCorrect ? "Правильно" : "Неправильно"}
          </span>
          <span className="text-xs italic text-gray-500 ml-1">
            (Выбрано: {ans.answer.selectedOption})
          </span>
        </li>
      ))}
    </ul>
  </div>
);

const MatchTaskDetails = ({ data }) => (
  <div className="space-y-2 mt-2">
    <div className="flex items-center space-x-2 text-gray-700">
      <Shuffle className="w-5 h-5 text-cyan-500" />
      <span className="font-medium">Результат:</span>
      <span className="text-sm">
        {data.stats.mainCorrect} из {data.stats.total} правильных ответов
      </span>
      <span className="text-xs text-gray-500 ml-2">
        ({data.stats.percent}%)
      </span>
    </div>
    <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
      {data.answers?.map((ans, idx) => (
        <li key={idx}>
          <span className="font-medium">Вопрос {idx + 1}:</span>{" "}
          <span
            className={cls(ans.isCorrect ? "text-green-700" : "text-red-700")}
          >
            {ans.isCorrect ? "Правильно" : "Неправильно"}
          </span>
        </li>
      ))}
    </ul>
  </div>
);

const BlockDetails = ({ blockData }) => {
  const isCompleted = blockData.completed;
  const statusIcon = isCompleted ? (
    <CheckCircle className="w-5 h-5 text-green-500" />
  ) : (
    <XCircle className="w-5 h-5 text-red-500" />
  );

  const renderSpecificDetails = () => {
    switch (blockData.blockType) {
      case "video":
        return <VideoDetails data={blockData} />;
      case "multiblanktask":
        return <MultiblanktaskDetails data={blockData} />;
      case "chatgame":
        return <ChatgameDetails data={blockData} />;
      case "audiotask":
        return <AudiotaskDetails data={blockData} />;
      case "imagequiz":
        return <ImageQuizDetails data={blockData} />;
      case "matchtask":
        return <MatchTaskDetails data={blockData} />;
      case "infocard":
        return (
          <div className="flex items-center space-x-2 text-gray-700">
            <Info className="w-5 h-5 text-gray-500" />
            <span className="text-sm italic">Информационный блок</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h5 className="font-semibold text-gray-900">{blockData.blockId}</h5>
          <div className="text-xs text-gray-500 uppercase">
            {blockData.blockType}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-600">
            {new Date(blockData.completedAt).toLocaleDateString("ru-RU")}
          </span>
          {statusIcon}
        </div>
      </div>
      {renderSpecificDetails()}
    </div>
  );
};

const UserModal = ({ open, onClose, user }) => {
  if (!user) return null;

  const sortedAnswers = user.answers
    ? Object.entries(user.answers).sort(([, a], [, b]) => {
        const dateA = new Date(a.completedAt || 0);
        const dateB = new Date(b.completedAt || 0);
        return dateB - dateA; // Sort descending by date
      })
    : [];

  const completedBlocksTimeline = user.courseProgress?.completedBlocks || [];

  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-6 overflow-y-auto flex-1">
        <div className="flex justify-between items-start pb-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              Детали пользователя: {user.name} {user.surname}
            </h3>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-3">
              Основная информация
            </h4>
            <div className="space-y-2 text-sm text-gray-700">
              <div>
                <span className="font-medium text-gray-600">Логин:</span> +
                {user.login}
              </div>
              <div>
                <span className="font-medium text-gray-600">Возраст:</span>{" "}
                {user.age ?? "—"}
              </div>
              <div>
                <span className="font-medium text-gray-600">Пол:</span>{" "}
                {user.gender === "male"
                  ? "Мужчина"
                  : user.gender === "female"
                  ? "Женщина"
                  : "—"}
              </div>
              <div>
                <span className="font-medium text-gray-600">Статус:</span>{" "}
                {getStatusText(user.status)}
              </div>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-3">
              Статистика обучения
            </h4>
            <div className="space-y-2 text-sm text-gray-700">
              <div>
                <span className="font-medium text-gray-600">Прогресс:</span>{" "}
                {user.progress || 0}%
              </div>
              <div>
                <span className="font-medium text-gray-600">
                  Завершено блоков:
                </span>{" "}
                {user.completedBlocks || 0}/{user.totalBlocks || 0}
              </div>
              <div>
                <span className="font-medium text-gray-600">
                  Время обучения:
                </span>{" "}
                {formatTimeSpent(user.timeSpent)}
              </div>
            </div>
          </div>
        </div>

        {/* New Course Timeline Section */}
        {completedBlocksTimeline.length > 0 && (
          <div className="mt-8">
            <h4 className="font-semibold text-gray-900 mb-4">
              Хронология прохождения курса
            </h4>
            <ol className="relative border-l border-gray-200 ml-3">
              {completedBlocksTimeline.map((blockRef, index) => {
                const blockData = user.answers?.[blockRef];
                if (!blockData) return null;
                const completedAt = new Date(
                  blockData.completedAt
                ).toLocaleString("ru-RU", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });
                return (
                  <li key={blockRef} className="mb-4 ml-4">
                    <div className="absolute w-3 h-3 bg-blue-600 rounded-full mt-1.5 -left-1.5 border border-white"></div>
                    <time className="mb-1 text-sm font-normal leading-none text-gray-400">
                      {completedAt}
                    </time>
                    <h5 className="text-sm font-semibold text-gray-900">
                      {blockData.blockId} ({blockData.blockType})
                    </h5>
                  </li>
                );
              })}
            </ol>
          </div>
        )}

        <div className="mt-8">
          <h4 className="font-semibold text-gray-900 mb-4">
            Детали прохождения курса ({sortedAnswers.length} блоков)
          </h4>
          <div className="space-y-4">
            {sortedAnswers.length > 0 ? (
              sortedAnswers.map(([, blockData]) => (
                <BlockDetails key={blockData.blockRef} blockData={blockData} />
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                Нет данных о прохождении курса.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end p-6 border-t border-gray-200 sticky bottom-0 bg-white z-10">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Закрыть
        </button>
      </div>
    </Modal>
  );
};

// =========================
// Main AdminPanel
// =========================
export const AdminPanel = () => {
  const {
    loading,
    error,
    stats,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    sortField,
    sortDirection,
    handleSort,
    currentPage,
    setCurrentPage,
    totalPages,
    pageSize,
    setPageSize,
    filteredAndSorted,
    pageSlice,
    reload,
    exportCSV,
  } = useUsers();

  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600 font-medium">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-20">
        <div className="max-w-full mx-auto px-6 lg:px-8">
          <div className="py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Администрирование
                </h1>
                <p className="mt-1 text-gray-600">
                  Управление пользователями и анализ прогресса обучения
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <button className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Settings className="w-4 h-4 mr-2" />
                  Настройки
                </button>
                <button
                  onClick={reload}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Обновить
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-full mx-auto px-6 lg:px-8 py-8">
        {/* Stats */}
        <StatsCards stats={stats} />

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Поиск по имени, email или логину..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">Все статусы</option>
                    <option value="active">Активные</option>
                    <option value="pending">Ожидание</option>
                    <option value="inactive">Неактивные</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <select
                  value={pageSize}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setPageSize(v);
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value={25}>25 на странице</option>
                  <option value={50}>50 на странице</option>
                  <option value={100}>100 на странице</option>
                </select>
                <button
                  onClick={exportCSV}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Экспорт
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <UsersTable
          rows={pageSlice}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          onView={handleViewUser}
        />

        {/* Pagination */}
        {filteredAndSorted.length > 0 && (
          <Pager
            current={currentPage}
            total={totalPages}
            onPrev={() => setCurrentPage(Math.max(1, currentPage - 1))}
            onNext={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            onJump={(p) => setCurrentPage(p)}
          />
        )}

        {/* Empty State */}
        {filteredAndSorted.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Пользователи не найдены
            </h3>
            <p className="text-gray-500 mb-4">
              Попробуйте изменить параметры поиска или фильтры
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Очистить фильтры
            </button>
          </div>
        )}
      </div>

      {/* User Modal */}
      <UserModal
        open={showUserModal}
        onClose={() => setShowUserModal(false)}
        user={selectedUser}
      />
    </div>
  );
};

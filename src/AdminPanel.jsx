import { useEffect, useState } from "react";
import { Link, Route, Routes } from "react-router-dom";
import Dashboard from "./admin/AdminDashboard";
import UserProgress from "./admin/UserProgress";
import Users from "./admin/Users";

const API_URL =
  "https://us-central1-akcent-course.cloudfunctions.net/api/analytics?token=BETA";

export function AdminPanel() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const result = await response.json();
        setData(result);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-700">
        Загрузка данных...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        Ошибка загрузки данных: {error}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <nav className="w-64 bg-white p-6 shadow-md">
        <div className="text-xl font-bold text-gray-800 mb-6">
          Панель админа
        </div>
        <ul>
          <li className="mb-4">
            <Link
              to="/adminqwertyuiop"
              className="block p-2 rounded-md text-gray-700 hover:bg-gray-200 transition-colors"
            >
              Обзор
            </Link>
          </li>
          <li>
            <Link
              to="/adminqwertyuiop/users"
              className="block p-2 rounded-md text-gray-700 hover:bg-gray-200 transition-colors"
            >
              Пользователи
            </Link>
          </li>
        </ul>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <Routes>
          <Route path="/" element={<Dashboard data={data} />} />
          <Route
            path="users"
            element={<Users users={data.users} storage={data.storage} />}
          />
          <Route path="users/:userId" element={<UserProgress data={data} />} />
        </Routes>
      </main>
    </div>
  );
}

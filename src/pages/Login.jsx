import { Eye, EyeOff, Lock, LogIn, Phone } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Добавить этот импорт

// Format phone number while typing
const formatPhoneNumber = (value) => {
  const numbers = value.replace(/\D/g, "");
  if (numbers.length === 0) return "";

  let cleanNumbers = numbers;
  if (numbers.startsWith("8")) {
    cleanNumbers = "7" + numbers.slice(1);
  }

  if (cleanNumbers.startsWith("7")) {
    const phoneDigits = cleanNumbers.slice(1);
    const limitedDigits = phoneDigits.slice(0, 10);
    let formatted = "+7";

    if (limitedDigits.length > 0) {
      formatted += " (" + limitedDigits.slice(0, 3);
      if (limitedDigits.length > 3) {
        formatted += ") " + limitedDigits.slice(3, 6);
        if (limitedDigits.length > 6) {
          formatted += " " + limitedDigits.slice(6, 8);
          if (limitedDigits.length > 8) {
            formatted += " " + limitedDigits.slice(8, 10);
          }
        }
      }
    }
    return formatted;
  }
  return value;
};

// Normalize before sending
const normalizePhoneNumber = (value) => {
  let digitsOnly = value.replace(/\D/g, "");
  if (digitsOnly.startsWith("87")) {
    digitsOnly = "77" + digitsOnly.slice(2);
  } else if (digitsOnly.startsWith("8") && !digitsOnly.startsWith("87")) {
    digitsOnly = "77" + digitsOnly.slice(1);
  } else if (
    digitsOnly.startsWith("7") &&
    digitsOnly.length === 11 &&
    !digitsOnly.startsWith("77")
  ) {
    digitsOnly = "77" + digitsOnly.slice(1);
  }
  return digitsOnly;
};

export const Login = () => {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation(); // Добавить этот хук
  const { login: authLogin } = useAuth(); // Добавить этот хук

  // Путь для редиректа после успешного входа
  const from = location.state?.from?.pathname || "/home";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        login: normalizePhoneNumber(login),
        password,
      };

      const res = await fetch(
        "https://us-central1-akcent-course.cloudfunctions.net/api/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || "Ошибка входа");
      }

      // Используем метод login из контекста вместо прямого сохранения в localStorage
      if (data.token) {
        authLogin(data.token, data.user); // Изменить эту строку
      }

      // Перенаправляем на страницу, с которой пришел пользователь, или на главную
      navigate(from, { replace: true }); // Изменить эту строку
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Добро пожаловать
          </h2>
          <p className="text-gray-600">
            Войдите в свой аккаунт для продолжения обучения
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Phone number */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Номер телефона
              </label>
              <div className="relative">
                <Phone
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="tel"
                  placeholder="Введите ваш номер"
                  value={login}
                  onChange={(e) => setLogin(formatPhoneNumber(e.target.value))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Пароль
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Введите ваш пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Login button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Входим...</span>
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  <span>Войти</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-center text-gray-600">
              Нет аккаунта?{" "}
              <Link
                to="/signup"
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Зарегистрироваться
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

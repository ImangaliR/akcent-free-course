import {
  ArrowRight,
  BookOpen,
  Check,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  UserPlus,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export const SignUp = () => {
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    login: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    if (formData.name.length < 2) {
      setError("Имя должно содержать минимум 2 символа");
      return false;
    }
    if (formData.surname.length < 2) {
      setError("Фамилия должна содержать минимум 2 символа");
      return false;
    }
    if (formData.login.length < 3) {
      setError("Логин должен содержать минимум 3 символа");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Пароль должен содержать минимум 6 символов");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      const res = await fetch(
        "https://us-central1-akcent-course.cloudfunctions.net/api/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || "Ошибка регистрации");
      }

      setSuccess(
        "Регистрация прошла успешно! Перенаправляем на страницу активации..."
      );

      // Сохраняем логин для страницы верификации
      localStorage.setItem("pendingLogin", formData.login);

      // Перенаправляем на страницу верификации через 2 секунды
      setTimeout(() => {
        navigate("/verify", { state: { login: formData.login } });
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = () => {
    const password = formData.password;
    if (password.length === 0) return { strength: 0, text: "" };
    if (password.length < 6)
      return { strength: 25, text: "Слабый", color: "bg-red-500" };
    if (password.length < 8)
      return { strength: 50, text: "Средний", color: "bg-yellow-500" };
    if (
      password.length >= 8 &&
      /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)
    ) {
      return { strength: 100, text: "Сильный", color: "bg-green-500" };
    }
    return { strength: 75, text: "Хороший", color: "bg-blue-500" };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Логотип и заголовок */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-4 rounded-2xl shadow-lg">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Создать аккаунт
          </h2>
          <p className="text-gray-600">
            Присоединяйтесь к нам и начните изучать русский язык
          </p>
        </div>

        {/* Форма регистрации */}
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Сообщения */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm">{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm">{success}</span>
              </div>
            )}

            {/* Имя и Фамилия в одной строке */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Имя</label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                  <input
                    type="text"
                    name="name"
                    placeholder="Иван"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Фамилия
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                  <input
                    type="text"
                    name="surname"
                    placeholder="Петров"
                    value={formData.surname}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Логин */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Логин</label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  name="login"
                  placeholder="Уникальный логин"
                  value={formData.login}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>
            </div>

            {/* Пароль */}
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
                  name="password"
                  placeholder="Минимум 6 символов"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
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

              {/* Индикатор силы пароля */}
              {formData.password && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Сила пароля</span>
                    <span
                      className={`font-medium ${
                        passwordStrength.strength === 100
                          ? "text-green-600"
                          : passwordStrength.strength >= 75
                          ? "text-blue-600"
                          : passwordStrength.strength >= 50
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {passwordStrength.text}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{ width: `${passwordStrength.strength}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Кнопка регистрации */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-3 rounded-lg hover:from-purple-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Регистрируем...</span>
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  <span>Создать аккаунт</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Ссылка на вход */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-center text-gray-600">
              Уже есть аккаунт?{" "}
              <Link
                to="/login"
                className="text-purple-600 hover:text-purple-700 font-medium transition-colors"
              >
                Войти
              </Link>
            </p>
          </div>
        </div>

        {/* Преимущества */}
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-500">
            🎯 Интерактивные уроки • 📚 Персональный прогресс • 🏆 Достижения
          </p>
        </div>
      </div>
    </div>
  );
};

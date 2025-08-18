import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Lock,
  Phone,
  User,
  UserPlus,
} from "lucide-react";
import { useState } from "react";
import { FaFemale } from "react-icons/fa";
import { MdFemale, MdMale } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";

export const SignUp = () => {
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    login: "",
    password: "",
    gender: "male",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "login" ? formatPhoneNumber(value) : value,
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
      const payload = {
        ...formData,
        login: normalizePhoneNumber(formData.login), // normalized here
      };

      const res = await fetch(
        "https://us-central1-akcent-course.cloudfunctions.net/api/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || "Ошибка регистрации");
      }

      setSuccess(
        "Регистрация прошла успешно! Перенаправляем на страницу активации..."
      );
      localStorage.setItem("pendingLogin", payload.login);
      setTimeout(() => {
        navigate("/verify", { state: { login: payload.login } });
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Аккаунт жасау
          </h2>
          <p className="text-gray-600">
            Бізге қосылыңыз және орыс тілін үйренуді бастаңыз
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
                <label className="text-sm font-medium text-gray-700">Аты</label>
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
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Жөні
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
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Логин */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Телефон нөмері
              </label>
              <div className="relative">
                <Phone
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  name="login"
                  placeholder="Нөміріңізді енгізіңіз"
                  value={formData.login}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
                  placeholder="Кемінде 6 символ"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
                    <span className="text-gray-500">Пароль күштілігі</span>
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

            {/* Гендер */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Жыныс</label>
              <div className="flex items-center gap-2">
                {formData.gender === "male" ? (
                  <MdMale className="w-6 h-6" />
                ) : (
                  <MdFemale className="w-6 h-6" />
                )}
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="border-1 border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-sm"
                >
                  <option value="male">Еркек</option>
                  <option value="female">Әйел</option>
                </select>
              </div>
            </div>

            {/* Кнопка регистрации */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Аккаунт тіркелуде...</span>
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  <span>Аккаунт жасау</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Ссылка на вход */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-center text-gray-600">
              Аккаунтыңыз барма?{" "}
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Кіру
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

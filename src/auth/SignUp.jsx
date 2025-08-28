import { Eye, EyeOff, Lock, Phone, Rocket } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const SignUp = () => {
  const [formData, setFormData] = useState({
    login: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

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
        login: normalizePhoneNumber(formData.login),
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
      if (!res.ok)
        throw new Error(data.message || data.error || "Ошибка регистрации");

      // ⬇️ IMPORTANT: set auth state BEFORE navigating
      if (!data.token) {
        throw new Error("Токен авторизации не получен");
      }

      await authLogin(data.token, data.user); // updates context + localStorage inside your provider

      setSuccess("Тіркеу сәтті өтті! Басты бетке өтеміз...");
      localStorage.setItem("pendingLogin", payload.login);

      navigate("/home", { replace: true, state: { login: payload.login } }); // no timeout needed
    } catch (err) {
      setError(
        err.message === "User with this login already exists"
          ? "Бұндай нөмірмен аккаунт тіркелген"
          : err.message === "Invalid password"
          ? "Құпиясөз қате"
          : err.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9f9] flex items-center p-4 justify-center font-['Intertight']">
      <div className="max-w-md w-full">
        {/* Логотип и заголовок */}
        <div className="grid place-items-center text-center">
          <h2 className="text-3xl md:text-4xl font-medium leading-tight tracking-tight">
            <span className="text-[#9C45FF]">Тегін курсқа </span>қол жеткізіңіз
          </h2>
          <p className="text-[#5D5D5D] text-sm md:text-base max-w-60 mt-1">
            Жеке деректеріңізді енгізіп, орыс тілін үйренуді қазір бастаңыз
          </p>
        </div>

        {/* Форма регистрации */}
        <div className="space-y-5">
          <form onSubmit={handleSubmit} className="space-y-3 mt-6">
            {/* Сообщения */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Логин */}
            <div className="space-y-2">
              <div className="relative">
                <Phone
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  name="login"
                  placeholder="Телефон нөмері"
                  value={formData.login}
                  onChange={handleChange}
                  className="text-gray-700 bg-white w-full pl-12 pr-4 py-4 border border-[#B7B7B7] rounded-full focus:outline-none focus:ring-2 focus:ring-[#9C45FF] focus:border-transparent transition-all duration-200 text-sm md:text-base"
                  required
                />
              </div>
            </div>

            {/* Пароль */}
            <div className="space-y-2">
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Құпия сөз"
                  value={formData.password}
                  onChange={handleChange}
                  className="text-gray-700 bg-white w-full pl-12 pr-12 py-4 border border-[#B7B7B7] rounded-full focus:outline-none focus:ring-2 focus:ring-[#9C45FF] focus:border-transparent transition-all duration-200 text-sm md:text-base"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#AE67FF] to-[#7727D2] text-white py-4 cursor-pointer rounded-full hover:bg-[#5f1fa8] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-200"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Кірілуде...</span>
                </>
              ) : (
                <>
                  <Rocket size={20} />
                  <span className="font-semibold">Кіру</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

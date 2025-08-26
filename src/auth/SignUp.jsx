import {
  Check,
  Eye,
  EyeOff,
  Lock,
  Phone,
  Rocket,
  User,
  UserPlus,
} from "lucide-react";
import { useState } from "react";
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

      setSuccess("Тіркеу сәтті өтті! Сізді растау бетіне бағыттаймыз...");
      localStorage.setItem("pendingLogin", payload.login);
      setTimeout(() => {
        navigate("/verify", { state: { login: payload.login } });
      }, 2000);
    } catch (err) {
      setError(
        err.message === "User with this login already exists"
          ? "Бұндай нөмірмен аккаунт тіркелген"
          : err.message
      );
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = () => {
    const password = formData.password;
    if (password.length === 0) return { strength: 0, text: "" };
    if (password.length < 6)
      return { strength: 25, text: "Әлсіз", color: "bg-red-500" };
    if (password.length < 8)
      return { strength: 50, text: "Орташа", color: "bg-yellow-500" };
    if (
      password.length >= 8 &&
      /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)
    ) {
      return { strength: 100, text: "Мықты", color: "bg-green-500" };
    }
    return { strength: 75, text: "Жақсы", color: "bg-blue-500" };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="min-h-screen bg-[#f9f9f9] flex items-center p-4 justify-center font-['Intertight']">
      <div className="max-w-md w-full">
        {/* Логотип и заголовок */}
        <div className="grid place-items-center">
          <h2 className="text-3xl md:text-4xl font-medium leading-tight tracking-tight">
            Тіркелу
          </h2>
          <p className="text-sm md:text-base text-[#5D5D5D] max-w-60 text-center">
            Бізге қосылыңыз және орыс тілін үйренуді бастаңыз
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

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm">{success}</span>
              </div>
            )}

            {/* Имя и Фамилия в одной строке */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="relative">
                  <User
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    name="name"
                    placeholder="Есімі"
                    value={formData.name}
                    onChange={handleChange}
                    className="text-gray-700 bg-white w-full pl-12 pr-3 py-4 border border-[#B7B7B7] rounded-full focus:outline-none focus:ring-2 focus:ring-[#9C45FF] focus:border-transparent transition-all duration-200 text-sm md:text-base"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <User
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    name="surname"
                    placeholder="Тегі"
                    value={formData.surname}
                    onChange={handleChange}
                    className="text-gray-700 bg-white w-full pl-12 pr-3 py-4 border border-[#B7B7B7] rounded-full focus:outline-none focus:ring-2 focus:ring-[#9C45FF] focus:border-transparent transition-all duration-200 text-sm md:text-base"
                    required
                  />
                </div>
              </div>
            </div>

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

              {/* Индикатор силы пароля */}
              {formData.password && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Құпиясөз қиындығы</span>
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
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: "male" })}
                  className={`cursor-pointer flex items-center justify-center gap-2 p-3 border-2 rounded-full transition-all duration-200 ${
                    formData.gender === "male"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-[#B7B7B7] bg-white text-[#5D5D5D] hover:border-gray-400"
                  }`}
                >
                  <MdMale className="w-6 h-6" />
                  <span className="text-sm font-medium">Ер</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: "female" })}
                  className={`cursor-pointer flex items-center justify-center gap-2 p-3 border-2 rounded-full transition-all duration-200 ${
                    formData.gender === "female"
                      ? "border-pink-500 bg-pink-50 text-pink-700"
                      : "border-[#B7B7B7] bg-white text-[#5D5D5D] hover:border-gray-400"
                  }`}
                >
                  <MdFemale className="w-6 h-6" />
                  <span className="text-sm font-medium">Әйел</span>
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
                  <span>Аккаунт тіркелуде...</span>
                </>
              ) : (
                <>
                  <Rocket size={20} />
                  <span className="font-semibold">Тіркелу</span>
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-sm md:text-base text-center text-gray-600">
            Аккаунтыңыз бар ма?{" "}
            <Link
              to="/login"
              className="text-[#9C45FF] hover:text-[#7e37d0] font-bold transition-colors"
            >
              Кіру
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

import { Eye, EyeOff, Lock, Phone, Rocket, Users } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Phone number formatting functions (unchanged)
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

export const Login = () => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { login: authLogin } = useAuth();

  const from = location.state?.from?.pathname || "/home";

  const handleStartLesson = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        login: normalizePhoneNumber(phone),
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
        if (data.message === "User not found") {
          navigate("/signup", { state: { phone, password } });
          return;
        }
        throw new Error(data.message || data.error || "Ошибка входа");
      }

      if (data.token) {
        authLogin(data.token, data.user);
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(
        err.message === "Invalid password"
          ? "Қате құпиясөз"
          : err.message === "User not found"
          ? "Аккаунтыңыз табылмады. Тіркелу бетіне бағытталасыз."
          : "Қате орын алды"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full p-6 md:p-10 rounded-3xl shadow-2xl bg-white/70 backdrop-blur-md border border-gray-100 flex flex-col justify-center text-center">
        {/* Top Section: Heading and Motivation */}
        <div className="space-y-4 mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
            Тегін сабаққа қол жеткізіңіз
          </h2>
          <p className="text-gray-600 text-sm md:text-base">
            Телефон нөміріңізді енгізіп, ағылшын тілін үйренуді қазір бастаңыз
          </p>
        </div>

        {/* Middle Section: Social Proof & Form */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-center items-center sm:gap-8 gap-4 text-center">
            <div className="flex items-center gap-2">
              <Users size={32} className="text-blue-600" />
              <div>
                <span className="block text-2xl font-bold text-gray-900">
                  127
                </span>
                <span className="block text-sm text-gray-500">
                  бүгін оқуды бастады
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users size={32} className="text-blue-600" />
              <div>
                <span className="block text-2xl font-bold text-gray-900">
                  10,000+
                </span>
                <span className="block text-sm text-gray-500">
                  оқушы Akcent Academy таңдады
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleStartLesson} className="space-y-4 mt-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>{error}</span>
              </div>
            )}

            {/* Phone number field */}
            <div className="relative">
              <Phone
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="tel"
                placeholder="Телефон нөмері"
                value={phone}
                onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm md:text-base"
                required
              />
            </div>

            {/* Password field */}
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Құпиясөз"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm md:text-base"
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

            {/* "Start lesson" button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white py-3 rounded-lg cursor-pointer hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Жүктелуде...</span>
                </>
              ) : (
                <>
                  <Rocket size={20} />
                  <span>Тегін сабақты бастау</span>
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-8 text-center text-sm md:text-base text-gray-600">
          Аккаунтыңыз жоқпа?{" "}
          <Link
            to="/signup"
            className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            Тіркелу{" "}
          </Link>
        </p>
      </div>
    </div>
  );
};

import { Eye, EyeOff, Lock, Phone, Rocket } from "lucide-react";
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
    <div className="min-h-screen bg-[#f9f9f9] flex items-center p-4 justify-center font-['Intertight']">
      <div className="max-w-md w-full">
        {/* Top Section: Heading and Motivation */}
        <div className="grid place-items-center text-center">
          <h2 className="text-3xl md:text-4xl font-medium leading-tight tracking-tight">
            <span className="text-[#9C45FF]">Тегін курсқа </span>қол жеткізіңіз
          </h2>
          <p className="text-[#5D5D5D] text-sm md:text-base max-w-60">
            Жеке деректеріңізді енгізіп, орыс тілін үйренуді қазір бастаңыз
          </p>
        </div>

        {/* Middle Section: Social Proof & Form */}
        <div className="space-y-5">
          <form onSubmit={handleStartLesson} className="space-y-3 mt-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-4 rounded-lg flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>{error}</span>
              </div>
            )}

            {/* Phone number field */}
            <div className="relative">
              <Phone
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="tel"
                placeholder="Телефон нөмері"
                value={phone}
                onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                className="w-full pl-12 pr-4 py-4 text-gray-700 bg-white border border-[#DEDEDE] rounded-full focus:outline-none focus:ring-2 focus:ring-[#9C45FF] focus:border-transparent transition-all text-sm md:text-base"
                required
              />
            </div>

            {/* Password field */}
            <div className="relative">
              <Lock
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Құпия сөз"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-4 text-gray-700 bg-white border border-[#DEDEDE] rounded-full focus:outline-none focus:ring-2 focus:ring-[#9C45FF] focus:border-transparent transition-all text-sm md:text-base"
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
              className="w-full bg-gradient-to-r from-[#AE67FF] to-[#7727D2] text-white py-4 rounded-full cursor-pointer hover:bg-[#5f1fa8] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-200  font-medium"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Жүктелуде...</span>
                </>
              ) : (
                <>
                  <Rocket size={20} />
                  <span>Тегін курсты бастау</span>
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm md:text-base text-[#5D5D5D]">
          Аккаунтыңыз жоқ па?{" "}
          <Link
            to="/signup"
            className="text-[#9C45FF] hover:text-[#7e37d0] font-bold transition-colors"
          >
            Тіркелу{" "}
          </Link>
        </p>
      </div>
    </div>
  );
};

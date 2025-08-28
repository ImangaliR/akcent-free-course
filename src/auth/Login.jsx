import { Eye, EyeOff, Lock, Phone, Rocket, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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

  // Forgot password state
  const [showReset, setShowReset] = useState(false);
  const [resetPhone, setResetPhone] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");
  const resetInputRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { login: authLogin } = useAuth();

  const from = location.state?.from?.pathname || "/home";

  useEffect(() => {
    if (showReset) {
      // prefill from login field
      setResetPhone(phone || "");
      // focus input on open
      setTimeout(() => resetInputRef.current?.focus(), 0);
    } else {
      setResetError("");
      setResetSuccess("");
    }
  }, [showReset]); // eslint-disable-line

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

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setResetError("");
    setResetSuccess("");

    const normalized = normalizePhoneNumber(resetPhone);
    if (!normalized || normalized.length < 11) {
      setResetError("Телефон нөмерін дұрыс енгізіңіз.");
      return;
    }

    setResetLoading(true);
    try {
      const RESET_BASE =
        "https://us-central1-akcent-course.cloudfunctions.net/api/forgot-password";
      const url = `${RESET_BASE}?login=${encodeURIComponent(normalized)}`;

      // use GET if your backend expects the query param version
      const res = await fetch(url, { method: "POST" });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data.message || data.error || "Қалпына келтіру қателігі"
        );
      }

      setResetSuccess("Жаңа құпиясөз WhatsApp-қа жіберілді!");
    } catch (err) {
      setResetError(
        err.message === "User not found"
          ? "Бұл нөмір тіркелмеген."
          : err.message || "Қате орын алды"
      );
    } finally {
      setResetLoading(false);
      // ❌ Do NOT close here — let the effect above close after success
      // setShowReset(false);
    }
  };

  // keep this (2s auto-close after success)
  const RESET_CLOSE_DELAY_MS = 2000;
  useEffect(() => {
    if (resetSuccess) {
      const t = setTimeout(() => {
        setShowReset(false);
      }, RESET_CLOSE_DELAY_MS);
      return () => clearTimeout(t);
    }
  }, [resetSuccess]);

  // Lock body scroll when reset modal is open
  useEffect(() => {
    if (showReset) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showReset]);

  const handleResetKeyDown = (e) => {
    if (e.key === "Escape") setShowReset(false);
  };

  return (
    <div className="min-h-screen bg-[#f9f9f9] flex items-center p-4 justify-center font-['Intertight']">
      {/* Make the card a positioning context for the overlay */}
      <div className="max-w-md w-full relative">
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

            {/* Forgot password link (right-aligned under password field) */}
            <div className="flex justify-end -mt-1">
              <button
                type="button"
                onClick={() => setShowReset(true)}
                className="text-xs md:text-sm text-[#9C45FF] hover:text-[#7e37d0] font-medium cursor-pointer"
              >
                Құпиясөзді ұмыттыңыз ба?
              </button>
            </div>

            {/* "Start lesson" button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#AE67FF] to-[#7727D2] text-white py-4 rounded-full cursor-pointer hover:bg-[#5f1fa8] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-200 font-medium"
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

        {/* === Small overlay panel for "Forgot password" === */}
        {showReset && (
          <div className="fixed inset-0 z-50 bg-[#f9f9f9]" role="presentation">
            <div className="min-h-full flex items-center justify-center p-4">
              <div
                className="w-full max-w-md h-fit bg-white rounded-2xl border border-[#EDEDED] p-5 md:p-6"
                onKeyDown={handleResetKeyDown}
                role="dialog"
                aria-modal="true"
                aria-labelledby="reset-title"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3
                    id="reset-title"
                    className="text-xl md:text-2xl font-medium"
                  >
                    Құпиясөзді қалпына келтіру
                  </h3>
                  <button
                    aria-label="Жабу"
                    onClick={() => setShowReset(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={20} />
                  </button>
                </div>

                <p className="text-sm md:text-base text-[#5D5D5D] mb-4">
                  Телефон нөмерін енгізіңіз. Біз WhatsApp арқылы жаңа құпиясөз
                  жібереміз.
                </p>

                {resetError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-3">
                    {resetError}
                  </div>
                )}
                {resetSuccess && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-3">
                    {resetSuccess}
                  </div>
                )}

                <form onSubmit={handleResetSubmit} className="space-y-3">
                  <div className="relative">
                    <Phone
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      ref={resetInputRef}
                      type="tel"
                      placeholder="Телефон нөмері"
                      value={resetPhone}
                      onChange={(e) =>
                        setResetPhone(formatPhoneNumber(e.target.value))
                      }
                      className="w-full pl-12 pr-4 py-3 text-gray-700 bg-white border border-[#DEDEDE] rounded-full focus:outline-none focus:ring-2 focus:ring-[#9C45FF] focus:border-transparent transition-all text-sm md:text-base"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowReset(false)}
                      className="px-4 py-2 rounded-full border border-[#DEDEDE] text-sm md:text-base text-[#5D5D5D] hover:bg-gray-50 cursor-pointer"
                    >
                      Болдырмау
                    </button>
                    <button
                      type="submit"
                      disabled={resetLoading}
                      className="px-4 py-2 rounded-full bg-gradient-to-r from-[#9C45FF] to-[#7e37d0] text-white text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {resetLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Жіберілуде…</span>
                        </>
                      ) : (
                        <span className="cursor-pointer">
                          Жаңа құпиясөзді жіберу
                        </span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

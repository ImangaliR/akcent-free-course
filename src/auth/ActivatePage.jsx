import { AlertCircle, ArrowRight, CheckCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";

export const Verify = () => {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const navigate = useNavigate();
  const location = useLocation();
  const inputRefs = useRef([]);

  // Получаем логин из состояния навигации или localStorage
  const userLogin =
    location.state?.login || localStorage.getItem("pendingLogin") || "";

  // Проверяем наличие логина
  useEffect(() => {
    if (!userLogin) {
      setError("Логин табылмады. Өтініш, тіркеуді қайтадан өтіңіз.");
    }
  }, [userLogin, location.state]);

  // Таймер для повторной отправки
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  // Автофокус на первое поле при загрузке
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Обработка ввода кода
  const handleCodeChange = (index, value) => {
    // Разрешаем только цифры
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1); // Берем только последний символ
    setCode(newCode);

    // Автоматический переход на следующее поле
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Обработка клавиш
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Вставка кода из буфера обмена
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "");
    if (pastedData.length === 6) {
      const newCode = pastedData.split("");
      setCode(newCode);
      inputRefs.current[5].focus();
    }
  };

  // Отправка кода на верификацию
  const handleSubmit = async (e) => {
    e.preventDefault();
    const verificationCode = code.join("");

    if (verificationCode.length !== 6) {
      setError("6-символды кодты енгізіңіз.");
      return;
    }

    if (!userLogin) {
      setError("Логин табылмады. Өтініш, тіркеуді қайтадан өтіңіз.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        "https://us-central1-akcent-course.cloudfunctions.net/api/verify",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            login: userLogin,
            code: verificationCode,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || data.error || "Верификациядан қате кетті"
        );
      }

      setSuccess("Верификация сәтті өтті!");

      // Сохраняем токен если он есть
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      // Очищаем временные данные
      localStorage.removeItem("pendingLogin");

      // Перенаправляем на главную страницу
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setError(
        err.message === "Invalid verification code"
          ? "Растау коды қате"
          : err.message
      );
      // Очищаем код при ошибке
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0].focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-4 md:space-y-8">
        {/* Логотип и заголовок */}
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Аккаунтты растау
          </h2>
          <p className="text-sm md:text-base text-gray-600 mb-4">
            Біз сізге 6-символдық растау кодын WhatsApp-қа жібердік
          </p>

          {/* WhatsApp информация */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center gap-2 text-green-700 mb-2">
              <FaWhatsapp className="w-5 h-5" />
              <span className="font-medium">WhatsApp</span>
            </div>
            <p className="text-xs md:text-sm text-green-600">
              Растау кодын алу үшін WhatsApp хабарламаларыңызды тексеріңіз
            </p>
            {userLogin && (
              <p className="text-xs text-green-500 mt-2">
                Аккаунт нөмірі: <span className="font-mono">+{userLogin}</span>
              </p>
            )}
          </div>
        </div>

        {/* Форма верификации */}
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Сообщения */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">{success}</span>
              </div>
            )}

            {/* Поля для ввода кода */}
            <div className="space-y-4">
              <label className="block text-xs md:text-sm font-medium text-gray-700 text-center">
                WhatsApp-қа келген кодты енгізіңіз
              </label>

              <div className="flex justify-center gap-3">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="w-9 h-9 md:w-12 md:h-12 text-center md:text-xl md:font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    disabled={loading}
                  />
                ))}
              </div>
            </div>

            {/* Кнопка подтверждения */}
            <button
              type="submit"
              disabled={loading || code.join("").length !== 6}
              className="w-full bg-green-500 text-sm md:text-base  cursor-pointer text-white py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Тексерілуде...</span>
                </>
              ) : (
                <>
                  <span>Растау</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

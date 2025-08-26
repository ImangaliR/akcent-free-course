import { Dialog } from "@headlessui/react";
import Lottie from "lottie-react";
import { useMemo, useState } from "react";
import Pensil from "../../assets/Microsoft Designer.json";
import { useAuth } from "../../context/AuthContext";

// Конфиг шагов
const stepConfig = [
  { id: 1, title: "Қош келдіңіз!", type: "welcome" },
  {
    id: 2,
    title: "Орыс тілін оқудағы мақсатыңыз қандай?",
    subtitle: "Неліктен тілді үйреніп жатқаныңызды айтыңыз.",
    type: "single_choice",
    field: "goal",
    options: [
      { id: "goal_1", text: "Акценттен арылу", value: "pronunciation" },
      { id: "goal_2", text: "Еркін сөйлеп үйрену", value: "exam" },
      { id: "goal_3", text: "Жұмыс/мансап үшін", value: "career" },
      { id: "goal_4", text: "Жалпы даму", value: "general" },
      { id: "goal_5", text: "Саяхатқа арналған", value: "travel" },
    ],
  },
  {
    id: 3,
    title: "Сіздің дайындық деңгейіңіз қандай?",
    subtitle: "Деңгейіңізді бағалаңыз",
    type: "single_choice",
    field: "level",
    options: [
      { id: "lvl_a1", text: "Нөлдік", value: "A1" },
      { id: "lvl_a2", text: "Бастауыш", value: "A2" },
      { id: "lvl_b1", text: "Орташа", value: "B1" },
      { id: "lvl_b2", text: "Орташадан жоғары", value: "B2" },
    ],
  },
  {
    id: 4,
    title: "Сіз үшін ең қиын нәрсе не?",
    subtitle: "Негізгі қиындықты таңдаңыз",
    type: "single_choice",
    field: "painPoint",
    options: [
      { id: "pain_1", text: "Сөздерді жаттау", value: "vocabulary" },
      { id: "pain_2", text: "Грамматика", value: "grammar" },
      { id: "pain_3", text: "Акцентпен сөйлеу", value: "pronunciation" },
      { id: "pain_4", text: "Қате сөйлеу", value: "listening" },
      { id: "pain_5", text: "Қате жазу", value: "speaking" },
    ],
  },
  {
    id: 5,
    title: "Жасыңыз нешеде?",
    type: "age",
    field: "age",
    placeholder: "Жасыңызды енгізіңіз",
  },
  {
    id: 6,
    title: "Сіздің электронды поштаңыз",
    type: "email",
    field: "email",
    placeholder: "your@email.com",
  },
];

const WelcomeStep = ({ onNext }) => (
  <div className="text-center py-2">
    <Lottie
      animationData={Pensil}
      loop={false}
      className="w-60 h-60 sm:w-64 sm:h-64 md:w-72 md:h-72 mx-auto"
    />
    <p className="text-gray-600 mb-6 text-sm md:text-base">
      Бірнеше жылдам сұрақтар сізге тамаша курсты реттеуге көмектеседі
    </p>
    <button
      onClick={onNext}
      className="bg-[#9C45FF] hover:bg-purple-600 text-white font-medium px-6 py-2 md:py-3 md:px-8 rounded-lg transition duration-200 shadow-md transform hover:scale-105"
    >
      Бастау
    </button>
  </div>
);

const LevelWifiIcon = ({ level }) => {
  const totalBars = 4;
  return (
    <div className="flex items-end gap-0.5">
      {Array.from({ length: totalBars }).map((_, i) => {
        const bar = i + 1;
        const isActive = bar <= level;

        return (
          <div
            key={i}
            className={`w-1.5 rounded-sm ${
              isActive ? "bg-[#9C45FF]" : "bg-gray-300"
            }`}
            style={{
              height: `${6 + i * 4}px`,
            }}
          />
        );
      })}
    </div>
  );
};

const QuestionStep = ({ stepData, onSelect, selectedValue }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
    {stepData.options.map((option, index) => {
      const isLevel = option.id?.startsWith("lvl_");
      const numberIcons = ["①", "②", "③", "④", "⑤"];

      const isSelected = selectedValue === option.value;

      return (
        <button
          key={option.id}
          onClick={() => onSelect(stepData.field, option.value)}
          className={`w-full text-sm md:text-base text-left px-6 ${
            isLevel ? "py-2" : "py-3"
          } border-2 rounded-xl transition-all duration-200 ease-in-out cursor-pointer
          ${
            isSelected
              ? "bg-purple-50 text-purple-700 border-[#9C45FF] shadow-lg"
              : "bg-white text-gray-800 border-gray-300 hover:border-purple-400"
          }
          ${isLevel ? "sm:col-span-2" : ""}`}
        >
          {isLevel ? (
            <div className="flex items-center gap-5">
              {option.id === "lvl_a1" && <LevelWifiIcon level={1} />}
              {option.id === "lvl_a2" && <LevelWifiIcon level={2} />}
              {option.id === "lvl_b1" && <LevelWifiIcon level={3} />}
              {option.id === "lvl_b2" && <LevelWifiIcon level={4} />}
              <span>{option.text}</span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span
                className={`text-lg md:text-xl ${
                  isSelected ? "text-purple-600" : "text-gray-400"
                }`}
              >
                {numberIcons[index]}
              </span>
              <span>{option.text}</span>
            </div>
          )}
        </button>
      );
    })}
  </div>
);

const InputStep = ({
  stepData,
  value,
  onChange,
  onKeyDown,
  invalid = false,
  errorText = "",
  hint = "",
}) => {
  const isAge = stepData.type === "age";
  const base =
    "w-full rounded-xl border-2 bg-white transition-all duration-200 " +
    "placeholder-gray-400 text-base sm:text-lg focus:outline-none " +
    "shadow-sm focus:shadow-md px-12 py-3 sm:py-4";

  const ok = "border-gray-300 focus:border-[#9C45FF]";
  const bad =
    "border-red-400 focus:ring-2 focus:ring-red-500 focus:border-red-500";

  return (
    <div className="w-full">
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-gray-400">
          {isAge ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 10h12M6 14h12M9 7v10M15 7v10"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M4 6h16v12H4z" stroke="currentColor" strokeWidth="1.8" />
              <path
                d="M4 7l8 6 8-6"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          )}
        </div>

        <input
          type={isAge ? "number" : "email"}
          min={isAge ? "5" : undefined}
          max={isAge ? "120" : undefined}
          inputMode={isAge ? "numeric" : "email"}
          autoComplete={isAge ? "off" : "email"}
          className={[
            base,
            invalid ? bad : ok,
            isAge
              ? "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              : "",
          ].join(" ")}
          placeholder={stepData.placeholder}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          autoFocus
        />
      </div>

      <div className="mt-2 min-h-[20px]">
        {invalid ? (
          <p className="text-sm text-red-600">
            {errorText || "Еңгізілген деректерді тексеріңіз"}
          </p>
        ) : hint ? (
          <p className="text-sm text-gray-500">{hint}</p>
        ) : null}
      </div>
    </div>
  );
};

export const WelcomeModal = () => {
  const { completeWelcome, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    goal: "",
    level: "",
    age: "",
    email: user?.email || "",
  });

  const totalSteps = stepConfig.length;
  const currentStepData = stepConfig[currentStep];

  const handleFormDataChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isStepValid = useMemo(() => {
    const field = currentStepData.field;
    if (!field) return true;
    const value = formData[field];

    if (currentStepData.type === "age") {
      const n = Number(value);
      return Number.isFinite(n) && n >= 6 && n <= 100; // ✅ updated range
    }
    if (currentStepData.type === "email") {
      return typeof value === "string" && /\S+@\S+\.\S+/.test(value.trim());
    }
    return value && value.toString().trim() !== "";
  }, [currentStepData, formData]);

  const handleNext = async () => {
    if (!isStepValid) {
      if (currentStepData.type === "age") {
        setError("Жасыңыз кемінде 6-да болуы керек");
      } else if (currentStepData.type === "email") {
        setError("Дұрыс электронный почта жазу керек");
      } else {
        setError("Өтініш, бұл жерді толтырыңыз");
      }
      return;
    }

    setError("");
    if (currentStep < totalSteps - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      await handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
      setError("");
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await completeWelcome(formData);
      if (!result?.success)
        setError(
          result?.error || "Деректерді сақтау барысында қателер туындады"
        );
    } catch (err) {
      console.error("Ошибка при завершении welcome:", err);
      setError("Деректерді сақтау сәтсіз өтті. Өтініш, қате өтіңіз.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={true}
      onClose={() => {}}
      className="fixed inset-0 z-[60] overflow-y-auto"
    >
      <div className="flex min-h-screen items-center justify-center p-3 sm:p-4 text-center">
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          aria-hidden="true"
        />

        <div
          className="
            relative w-[92vw] max-w-[800px]
            sm:w-[800px] sm:h-[600px]
            transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-2xl transition-all
            flex flex-col
          "
        >
          <div className="flex-1 overflow-hidden p-5 sm:p-8 flex flex-col">
            <div className="h-2 bg-gray-200 rounded-full mb-4">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#9C45FF] to-purple-600 transition-all duration-500 ease-out"
                style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
              />
            </div>

            <div className="flex items-center justify-between mb-3 sm:mb-2">
              <div className="text-xs sm:text-sm font-medium text-gray-500">
                {currentStep + 1} из {totalSteps}
              </div>
            </div>

            <div className="text-center my-2 space-y-1">
              <Dialog.Title
                as="h2"
                className="text-2xl sm:text-3xl font-extrabold text-gray-800"
              >
                {currentStepData.title}
              </Dialog.Title>
              {currentStepData.subtitle && (
                <Dialog.Description className="text-gray-600 text-xs sm:text-base">
                  {currentStepData.subtitle}
                </Dialog.Description>
              )}
            </div>

            {error && (
              <div
                role="alert"
                className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-100 border-l-4 border-red-500 text-red-800 rounded-md"
              >
                {error}
              </div>
            )}

            <div className="flex-1 min-h-[140px] sm:min-h-[150px] flex items-start sm:items-center justify-center overflow-y-auto pr-1">
              {(() => {
                switch (currentStepData.type) {
                  case "welcome":
                    return <WelcomeStep onNext={handleNext} />;
                  case "single_choice":
                    return (
                      <QuestionStep
                        stepData={currentStepData}
                        onSelect={handleFormDataChange}
                        selectedValue={formData[currentStepData.field]}
                      />
                    );
                  case "age":
                  case "email":
                    return (
                      <InputStep
                        stepData={currentStepData}
                        value={formData[currentStepData.field] || ""}
                        onChange={(e) =>
                          handleFormDataChange(
                            currentStepData.field,
                            e.target.value
                          )
                        }
                        onKeyDown={(e) => e.key === "Enter" && handleNext()}
                      />
                    );
                  default:
                    return null;
                }
              })()}
            </div>
          </div>

          {currentStepData.type !== "welcome" && (
            <div className="text-sm md:text-base border-t border-gray-100 p-2 md:p-4 sm:p-6 flex gap-3 sm:gap-4">
              <button
                type="button"
                onClick={handleBack}
                disabled={loading || currentStep === 0}
                className="flex-1 px-3 py-1 sm:px-6 sm:py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 disabled:opacity-50 transition duration-200"
              >
                Артқа
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={loading || !isStepValid}
                className="flex-1 bg-[#9C45FF] hover:bg-purple-600 disabled:bg-gray-400 text-white font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition duration-200 flex items-center justify-center shadow-lg transform hover:scale-105 disabled:transform-none"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938л3-2.647z"
                      />
                    </svg>
                    Сақтау...
                  </>
                ) : currentStep === totalSteps - 1 ? (
                  "Аяқтау"
                ) : (
                  "Алға"
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
};

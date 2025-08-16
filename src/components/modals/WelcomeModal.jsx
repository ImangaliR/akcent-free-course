import { Dialog } from "@headlessui/react";
import { useMemo, useState } from "react";
import owlIcon from "../../assets/horse.svg";
import rocketIcon from "../../assets/rocket.svg";
import { useAuth } from "../../context/AuthContext";

// Конфиг шагов
const stepConfig = [
  { id: 1, title: "Добро пожаловать!", type: "welcome" },
  {
    id: 2,
    title: "Какова ваша цель изучения?",
    subtitle: "Расскажите, зачем вы изучаете язык",
    type: "single_choice",
    field: "goal",
    options: [
      { id: "goal_1", text: "Улучшить произношение", value: "pronunciation" },
      { id: "goal_2", text: "Подготовиться к экзамену", value: "exam" },
      { id: "goal_3", text: "Для работы/карьеры", value: "career" },
      { id: "goal_4", text: "Для путешествий", value: "travel" },
      { id: "goal_5", text: "Общее развитие", value: "general" },
    ],
  },
  {
    id: 3,
    title: "Какой у вас уровень подготовки?",
    subtitle: "Оцените свой текущий уровень",
    type: "single_choice",
    field: "level",
    options: [
      { id: "lvl_a1", text: "A1 — Начальный", value: "A1" },
      { id: "lvl_a2", text: "A2 — Базовый", value: "A2" },
      { id: "lvl_b1", text: "B1 — Средний", value: "B1" },
      { id: "lvl_b2", text: "B2 — Выше среднего", value: "B2" },
      { id: "lvl_c1", text: "C1 — Продвинутый", value: "C1" },
      { id: "lvl_c2", text: "C2 — Владение", value: "C2" },
    ],
  },
  {
    id: 4,
    title: "Сколько вам лет?",
    type: "age",
    field: "age",
    placeholder: "Введите ваш возраст",
  },
  {
    id: 5,
    title: "Ваш email",
    type: "email",
    field: "email",
    placeholder: "your@email.com",
  },
];

const WelcomeStep = ({ onNext }) => (
  <div className="text-center py-2">
    <img
      src={rocketIcon}
      alt="Rocket"
      className="mx-auto mb-6 w-20 h-20 sm:w-28 sm:h-28 animate-pulse"
    />
    <p className="text-gray-600 mb-6">
      Несколько быстрых вопросов помогут нам настроить идеальный курс для вас
    </p>
    <button
      onClick={onNext}
      className="bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-8 rounded-lg transition duration-200 shadow-md transform hover:scale-105"
    >
      Начать
    </button>
  </div>
);

const QuestionStep = ({ stepData, onSelect, selectedValue }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
    {stepData.options.map((option) => (
      <button
        key={option.id}
        onClick={() => onSelect(stepData.field, option.value)}
        className={`w-full text-left px-4 py-3 sm:px-6 sm:py-4 border-2 rounded-xl transition-all duration-200 ease-in-out cursor-pointer
          ${
            selectedValue === option.value
              ? "bg-green-50 text-green-700 border-green-500 shadow-lg"
              : "bg-white text-gray-800 border-gray-300 hover:border-green-400"
          }
        `}
      >
        {option.text}
      </button>
    ))}
  </div>
);

// КРАСИВЫЙ ВАРИАНТ InputStep
const InputStep = ({
  stepData,
  value,
  onChange,
  onKeyDown,
  invalid = false, // передаём true, если есть ошибка валидации
  errorText = "", // текст ошибки
  hint = "", // подсказка под полем
}) => {
  const isAge = stepData.type === "age";
  const base =
    "w-full rounded-xl border-2 bg-white transition-all duration-200 " +
    "placeholder-gray-400 text-base sm:text-lg focus:outline-none " +
    "shadow-sm focus:shadow-md px-12 py-3 sm:py-4"; // padding под иконку

  const ok =
    "border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500";
  const bad =
    "border-red-400 focus:ring-2 focus:ring-red-500 focus:border-red-500";

  return (
    <div className="w-full">
      <div className="relative">
        {/* Левая иконка */}
        <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-gray-400">
          {isAge ? (
            // # — для возраста
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 10h12M6 14h12M9 7v10M15 7v10"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            // конверт — для email
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
          min={isAge ? "1" : undefined}
          max={isAge ? "120" : undefined}
          inputMode={isAge ? "numeric" : "email"}
          autoComplete={isAge ? "off" : "email"}
          className={[
            base,
            invalid ? bad : ok,
            // убираем стрелки у number
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

      {/* Подсказка / ошибка */}
      <div className="mt-2 min-h-[20px]">
        {invalid ? (
          <p className="text-sm text-red-600">
            {errorText || "Проверьте введённые данные"}
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
      return Number.isFinite(n) && n >= 1 && n <= 120;
    }
    if (currentStepData.type === "email") {
      return typeof value === "string" && /\S+@\S+\.\S+/.test(value.trim());
    }
    return value && value.toString().trim() !== "";
  }, [currentStepData, formData]);

  const handleNext = async () => {
    if (!isStepValid) return setError("Пожалуйста, заполните это поле");
    setError("");
    if (currentStep < totalSteps - 1) setCurrentStep((s) => s + 1);
    else await handleSubmit();
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
        setError(result?.error || "Произошла ошибка при сохранении данных");
    } catch (err) {
      console.error("Ошибка при завершении welcome:", err);
      setError("Не удалось сохранить данные. Пожалуйста, попробуйте позже.");
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

        {/* 
          Адаптивный контейнер:
          - на мобильных: ширина ~92vw, высота ~85vh (почти фикс), внутренний скролл
          - на >=sm: жёстко 800×600
        */}
        <div
          className="
            relative w-[92vw] max-w-[800px] h-[85vh]
            sm:w-[800px] sm:h-[600px]
            transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-2xl transition-all
            flex flex-col
          "
        >
          {/* Внутренние отступы — адаптивные */}
          <div className="flex-1 overflow-hidden p-5 sm:p-8 flex flex-col">
            {/* Прогресс */}
            <div className="h-2 bg-gray-200 rounded-full mb-4">
              <div
                className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500 ease-out"
                style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
              />
            </div>

            {/* Счётчик + маскот */}
            <div className="flex items-center justify-between mb-3 sm:mb-2">
              <div className="text-xs sm:text-sm font-medium text-gray-500">
                {currentStep + 1} из {totalSteps}
              </div>
              <img
                src={owlIcon}
                alt="Owl mascot"
                className="w-8 h-8 sm:w-16 sm:h-16"
              />
            </div>

            {/* Заголовок */}
            <div className="text-center mb-5 sm:mb-8">
              <Dialog.Title
                as="h2"
                className="text-2xl sm:text-3xl font-extrabold text-gray-800 mb-2"
              >
                {currentStepData.title}
              </Dialog.Title>
              {currentStepData.subtitle && (
                <Dialog.Description className="text-gray-600 text-sm sm:text-base">
                  {currentStepData.subtitle}
                </Dialog.Description>
              )}
            </div>

            {/* Ошибка */}
            {error && (
              <div
                role="alert"
                className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-100 border-l-4 border-red-500 text-red-800 rounded-md"
              >
                {error}
              </div>
            )}

            {/* Контент шага — делает основной скролл на мобильных */}
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

          {/* Навигация — прилипает к низу модалки и не уезжает при скролле контента */}
          {currentStepData.type !== "welcome" && (
            <div className="border-t border-gray-100 p-4 sm:p-6 flex gap-3 sm:gap-4">
              <button
                type="button"
                onClick={handleBack}
                disabled={loading || currentStep === 0}
                className="flex-1 px-4 py-3 sm:px-6 sm:py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 disabled:opacity-50 transition duration-200"
              >
                Назад
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={loading || !isStepValid}
                className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition duration-200 flex items-center justify-center shadow-lg transform hover:scale-105 disabled:transform-none"
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
                    Сохранение...
                  </>
                ) : currentStep === totalSteps - 1 ? (
                  "Завершить"
                ) : (
                  "Продолжить"
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
};

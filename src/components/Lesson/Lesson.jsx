// components/Lesson/Lesson.jsx
import { useState } from "react";
// import { ExerciseStep } from "../Exercise/ExerciseStep";
import { LessonNavigation } from "./LessonNav";
// import { ResultsStep } from "../Results/ResultsStep";
import { VideoLessonWithSubtitles } from "../VideoLesson/VideoLesson";

export const Lesson = ({ lesson, setCurrentLesson, currentLesson }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [lessonData, setLessonData] = useState({
    answers: {},
    progress: {},
    timeSpent: 0,
  });

  // Определяем шаги урока
  const steps = [
    {
      id: "video",
      type: "video",
      title: "Видеоурок",
      component: VideoLessonWithSubtitles,
      required: true,
    },
    // {
    //   id: "exercises",
    //   type: "exercises",
    //   title: "Упражнения",
    //   component: ExerciseStep,
    //   required: true,
    // },
    // {
    //   id: "results",
    //   type: "results",
    //   title: "Результаты",
    //   component: ResultsStep,
    //   required: false,
    // },
  ];

  const currentStepData = steps[currentStep];

  const handleStepComplete = (stepId, data) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps((prev) => [...prev, stepId]);
    }

    setLessonData((prev) => ({
      ...prev,
      [stepId]: data,
    }));
  };

  const handleStepChange = (stepIndex) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStep(stepIndex);
    }
  };

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderCurrentStep = () => {
    const StepComponent = currentStepData.component;

    return (
      <StepComponent
        lesson={lesson}
        stepData={currentStepData}
        lessonData={lessonData}
        onStepComplete={handleStepComplete}
        onNext={handleNextStep}
        onPrev={handlePrevStep}
      />
    );
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-lg min-h-[600px] flex flex-col">
      {/* Прогресс урока */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">{lesson.title}</h2>
          <span className="text-sm text-gray-500">
            {currentStep + 1} из {steps.length}
          </span>
        </div>

        {/* Прогресс бар */}
        <div className="bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Шаги */}
        <div className="flex items-center justify-between mt-4">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center ${
                index < steps.length - 1 ? "flex-1" : ""
              }`}
            >
              <button
                onClick={() => handleStepChange(index)}
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${
                    index === currentStep
                      ? "bg-blue-600 text-white"
                      : completedSteps.includes(step.id)
                      ? "bg-green-500 text-white"
                      : "bg-gray-300 text-gray-600"
                  }
                `}
              >
                {index + 1}
              </button>
              <span
                className={`ml-2 text-sm ${
                  index === currentStep
                    ? "text-blue-600 font-medium"
                    : "text-gray-600"
                }`}
              >
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <div className="flex-1 mx-4 h-px bg-gray-300" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Основной контент */}
      <div className="flex-1 p-6">{renderCurrentStep()}</div>

      {/* Навигация */}
      <div className="p-6 border-t">
        <LessonNavigation
          currentStep={currentStep}
          totalSteps={steps.length}
          onPrev={handlePrevStep}
          onNext={handleNextStep}
          canProceed={completedSteps.includes(currentStepData.id)}
          isLastStep={currentStep === steps.length - 1}
          setCurrentLesson={setCurrentLesson}
          currentLesson={currentLesson}
        />
      </div>
    </div>
  );
};

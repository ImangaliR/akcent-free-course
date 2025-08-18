import { useEffect, useState } from "react";
import { AudioTask } from "./AudioTask";
import { StoryTask } from "./StoryTask";
import { CheckCircle, Info } from "lucide-react";

export const InfoCard = ({ lesson, onStepComplete }) => {
  const [isRead, setIsRead] = useState(false);

  useEffect(() => {
    // Automatically mark as completed after 3 seconds
    const timer = setTimeout(() => {
      setIsRead(true);
      onStepComplete?.("infocard", {
        completed: true,
        timeSpent: 3,
      });
    }, 6000);

    return () => clearTimeout(timer);
  }, [onStepComplete]);

  const handleMarkAsRead = () => {
    setIsRead(true);
    onStepComplete?.("infocard", {
      completed: true,
      timeSpent: Date.now() / 1000,
    });
  };

  return (
    <div className="mx-auto">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-blue-500 p-6 text-white">
          <div className="flex items-center">
            <Info size={24} className="mr-3" />
            <h3 className="text-xl font-semibold">Пайдалы ақпарат</h3>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Image if provided */}
          {lesson.media && (
            <div className="mb-6 text-center">
              <img
                src={lesson.media}
                alt={lesson.title}
                className="max-w-md mx-auto rounded-lg shadow-md"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>
          )}

          {/* Text content */}
          <div className="text-center">
            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <p className="text-lg text-gray-800 leading-relaxed">
                {lesson.text}
              </p>
            </div>

            {/* Completion indicator */}
            {isRead ? (
              <div className="flex items-center justify-center text-green-600 font-medium">
                <CheckCircle size={20} className="mr-2" />
                Ақпарат оқылды
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-center text-gray-500">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                  Ақпарат оқылуда...
                </div>
                <button
                  onClick={handleMarkAsRead}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Оқылды деп белгілеу
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Demo component showing all task types
export const TaskDemo = () => {
  const [completedTasks, setCompletedTasks] = useState(new Set());

  const handleTaskComplete = (taskId, completionData) => {
    console.log(`Task ${taskId} completed:`, completionData);
    setCompletedTasks((prev) => new Set([...prev, taskId]));
  };

  const sampleStoryTask = {
    id: "t1",
    type: "storytask",
    title: "Первый диалог",
    story: "Анна приехала в кафе.",
    question: "Что она должна сказать бариста?",
    options: ["Я хочу кофе", "Дай мне кофе", "Кофе, пожалуйста"],
    answer: 2,
    feedback: [
      "Близко, но не хватает вежливости.",
      "Это звучит грубо.",
      "Правильно! Вежливая форма.",
    ],
  };

  const sampleAudioTask = {
    id: "t2",
    type: "audiotask",
    title: "Аудирование в кафе",
    audio: "/media/audio/cafe-order.mp3",
    question: "Что заказала Анна?",
    options: ["Чай", "Кофе", "Сок"],
    answer: 1,
  };

  const sampleInfoCard = {
    id: "inf-1",
    type: "infocard",
    title: "Факт о курсе",
    text: "Наш курс помогает заговорить по-русски всего за 15 минут в день!",
    media: "/media/images/fact1.png",
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Демонстрация компонентов курса
        </h1>

        <div className="space-y-12">
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">
              Story Task
            </h2>
            <StoryTask
              lesson={sampleStoryTask}
              onStepComplete={(type, data) =>
                handleTaskComplete(sampleStoryTask.id, data)
              }
            />
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">
              Audio Task
            </h2>
            <AudioTask
              lesson={sampleAudioTask}
              onStepComplete={(type, data) =>
                handleTaskComplete(sampleAudioTask.id, data)
              }
            />
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">
              Info Card
            </h2>
            <InfoCard
              lesson={sampleInfoCard}
              onStepComplete={(type, data) =>
                handleTaskComplete(sampleInfoCard.id, data)
              }
            />
          </div>
        </div>

        <div className="mt-12 p-4 bg-white rounded-lg shadow">
          <h3 className="font-semibold mb-2">Completed Tasks:</h3>
          <p className="text-gray-600">
            {completedTasks.size > 0
              ? Array.from(completedTasks).join(", ")
              : "No tasks completed yet"}
          </p>
        </div>
      </div>
    </div>
  );
};

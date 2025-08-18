import { useEffect, useState } from "react";
import { CheckCircle, Clock, Edit3 } from "lucide-react";
import { useCourse } from "../../context/CourseContext";
import { StoryTask } from "../Tasks/StoryTask";
import { AudioTask } from "../Tasks/AudioTask";
import { InfoCard } from "../Tasks/InfoCard";
import { VideoLessonWithSubtitles } from "../VideoLesson/VideoLesson";
import { MatchTask } from "../Tasks/MatchTask";
import { ImageQuiz } from "../Tasks/ImageQuiz";

export const Lesson = ({ currentBlockRef, onBlockComplete }) => {
  const [loading, setLoading] = useState(true);
  const [blockData, setBlockData] = useState(null);
  const [error, setError] = useState(null);

  // Get methods from your existing context
  const {
    getUserAnswer,
    hasUserAnswer,
    getBlockStatus,
    updateAnswer,
    completeBlock,
  } = useCourse();

  const userAnswer = getUserAnswer(currentBlockRef);
  const hasAnswer = hasUserAnswer(currentBlockRef);
  const blockStatus = getBlockStatus(currentBlockRef);

  // Загрузка данных блока из JSON
  useEffect(() => {
    const loadBlockData = async () => {
      const blockRef = currentBlockRef || "blocks/v1.video.json";

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/content/${blockRef}`);

        if (!response.ok) {
          throw new Error(`Не удалось загрузить блок: ${response.status}`);
        }

        const data = await response.json();
        setBlockData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadBlockData();
  }, [currentBlockRef]);

  // Enhanced block completion handler with answer storage
  const handleBlockComplete = async (blockType, completionData = {}) => {
    console.log(`Блок ${blockData?.id} завершен:`, completionData);

    // Store the completion data as user answer
    const answerData = {
      blockType,
      blockId: blockData?.id,
      blockRef: currentBlockRef,
      ...completionData,
    };

    // Use your existing completeBlock method
    await completeBlock(blockData?.id, answerData);

    // Call the original callback
    onBlockComplete?.(blockData?.id, answerData);
  };

  // Handle answer updates (for draft saves)
  const handleAnswerUpdate = (answerData) => {
    updateAnswer(currentBlockRef, {
      blockType: blockData?.type,
      blockId: blockData?.id,
      blockRef: currentBlockRef,
      ...answerData,
    });
  };

  // Format completion time
  const formatCompletionTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Render previous answer summary
  const renderAnswerSummary = () => {
    if (!hasAnswer || !userAnswer) return null;

    const isCompleted = blockStatus === "completed";
    const isDraft = blockStatus === "draft";

    return (
      <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {isCompleted ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <Edit3 className="w-5 h-5 text-blue-600" />
            )}
            <h4 className="font-semibold text-gray-800">
              {isCompleted
                ? "Ваш ответ"
                : isDraft
                ? "Черновик ответа"
                : "Сохраненный ответ"}
            </h4>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            {formatCompletionTime(
              userAnswer.completedAt || userAnswer.updatedAt
            )}
          </div>
        </div>

        {/* Render answer based on block type */}
        {blockData?.type === "storytask" && renderStoryTaskAnswer()}
        {blockData?.type === "audiotask" && renderAudioTaskAnswer()}
        {blockData?.type === "video" && renderVideoAnswer()}
        {blockData?.type === "matchtask" && renderMatchTaskAnswer()}
        {blockData?.type === "imagequiz" && renderImageQuizAnswer()}
        {blockData?.type === "infocard" && renderInfoCardAnswer()}
      </div>
    );
  };

  // Render story task answer
  const renderStoryTaskAnswer = () => {
    if (
      !userAnswer.selectedAnswers &&
      !userAnswer.userAnswer &&
      !userAnswer.answers
    )
      return null;

    return (
      <div className="space-y-3">
        {/* Multiple choice answers */}
        {(userAnswer.selectedAnswers || userAnswer.answers) && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              Выбранные ответы:
            </p>
            <div className="space-y-2">
              {Object.entries(
                userAnswer.selectedAnswers || userAnswer.answers || {}
              ).map(([questionId, answer]) => (
                <div
                  key={questionId}
                  className="bg-white rounded-lg px-3 py-2 border flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs text-gray-600">
                      Вопрос {questionId}:
                    </span>
                    <span className="ml-2 font-medium text-gray-800">
                      {answer}
                    </span>
                  </div>
                  {userAnswer.correctAnswers &&
                    userAnswer.correctAnswers[questionId] && (
                      <div className="flex items-center gap-1">
                        {answer === userAnswer.correctAnswers[questionId] ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-red-600">✗</span>
                            <span className="text-xs text-gray-500">
                              Верно: {userAnswer.correctAnswers[questionId]}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Text answer */}
        {userAnswer.userAnswer && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              Текстовый ответ:
            </p>
            <div className="bg-white rounded-lg p-3 border">
              <p className="text-gray-800">{userAnswer.userAnswer}</p>
            </div>
          </div>
        )}

        {/* Score display */}
        {userAnswer.score !== undefined && (
          <div className="flex items-center gap-2 pt-2">
            <span className="text-sm text-gray-600">Результат:</span>
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                userAnswer.score >= 80
                  ? "bg-green-100 text-green-800"
                  : userAnswer.score >= 60
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {userAnswer.score}% ({userAnswer.correctCount || 0} из{" "}
              {userAnswer.totalQuestions || 0})
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render audio task answer
  const renderAudioTaskAnswer = () => {
    if (!userAnswer.userAnswer && !userAnswer.selectedAnswer) return null;

    return (
      <div className="space-y-3">
        {userAnswer.selectedAnswer && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              Выбранный ответ:
            </p>
            <div className="bg-white rounded-lg p-3 border flex items-center justify-between">
              <p className="text-gray-800">{userAnswer.selectedAnswer}</p>
              {userAnswer.isCorrect !== undefined && (
                <div className="flex items-center gap-1">
                  {userAnswer.isCorrect ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <span className="text-xs text-red-600">✗</span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {userAnswer.userAnswer && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Ваш ответ:</p>
            <div className="bg-white rounded-lg p-3 border">
              <p className="text-gray-800">{userAnswer.userAnswer}</p>
            </div>
          </div>
        )}

        {userAnswer.isCorrect !== undefined && (
          <div className="flex items-center gap-2 pt-2">
            <span className="text-sm text-gray-600">Результат:</span>
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                userAnswer.isCorrect
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {userAnswer.isCorrect ? "Правильно" : "Неправильно"}
            </div>
            {!userAnswer.isCorrect && userAnswer.correctAnswer && (
              <span className="text-xs text-gray-500">
                Верный ответ: {userAnswer.correctAnswer}
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderMatchTaskAnswer = () => {
    if (!userAnswer.matches) return null;

    return (
      <div className="space-y-3">
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">
            Ваши соответствия:
          </p>
          <div className="space-y-2">
            {Object.entries(userAnswer.matches).map(
              ([sentence, translation]) => (
                <div
                  key={sentence}
                  className="bg-white rounded-lg p-3 border flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="text-gray-800 font-medium">{sentence}</div>
                    <div className="text-gray-600 text-sm mt-1">
                      → {translation}
                    </div>
                  </div>
                  {userAnswer.isCompleted && blockData?.pairs && (
                    <div className="flex items-center gap-1">
                      {blockData.pairs.some(
                        (pair) =>
                          pair.sentence === sentence &&
                          pair.translation === translation
                      ) ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <span className="text-xs text-red-600">✗</span>
                      )}
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        </div>

        {/* Score display */}
        {userAnswer.score !== undefined && (
          <div className="flex items-center gap-2 pt-2">
            <span className="text-sm text-gray-600">Результат:</span>
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                userAnswer.score >= 80
                  ? "bg-green-100 text-green-800"
                  : userAnswer.score >= 60
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {userAnswer.score}% ({userAnswer.correctCount || 0} из{" "}
              {userAnswer.totalQuestions || 0})
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderImageQuizAnswer = () => {
    if (!userAnswer.selectedOption) return null;

    const selectedOptionData = blockData?.options?.find(
      (opt) => opt.id === userAnswer.selectedOption
    );
    const correctOptionData = blockData?.options?.find(
      (opt) => opt.id === userAnswer.correctAnswer
    );

    return (
      <div className="space-y-3">
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">
            Выбранный ответ:
          </p>
          <div className="bg-white rounded-lg p-3 border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={`/images/${selectedOptionData?.image}`}
                alt={selectedOptionData?.label}
                className="w-12 h-12 object-cover rounded-lg"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
              <div>
                <p className="text-gray-800 font-medium">
                  {selectedOptionData?.label || userAnswer.selectedOption}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {userAnswer.isCorrect ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <span className="text-xs text-red-600">✗</span>
              )}
            </div>
          </div>
        </div>

        {/* Show correct answer if wrong */}
        {!userAnswer.isCorrect && correctOptionData && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              Правильный ответ:
            </p>
            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
              <div className="flex items-center gap-3">
                <img
                  src={`/images/${correctOptionData.image}`}
                  alt={correctOptionData.label}
                  className="w-12 h-12 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
                <div>
                  <p className="text-green-800 font-medium">
                    {correctOptionData.label}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Result display */}
        <div className="flex items-center gap-2 pt-2">
          <span className="text-sm text-gray-600">Результат:</span>
          <div
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              userAnswer.isCorrect
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {userAnswer.isCorrect ? "Правильно" : "Неправильно"}
          </div>
        </div>
      </div>
    );
  };

  // Render video answer (watch progress)
  /* const renderVideoAnswer = () => {
    if (
      !userAnswer.watchProgress &&
      !userAnswer.completed &&
      !userAnswer.progress
    )
      return null;

    const progress = userAnswer.watchProgress || userAnswer.progress || 0;

    return (
      <div className="space-y-3">
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">
            Прогресс просмотра:
          </p>
          <div className="bg-white rounded-lg p-3 border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Просмотрено:</span>
              <span className="font-medium text-gray-800">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {(userAnswer.completed || progress >= 90) && (
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              Видео просмотрено{" "}
              {progress >= 100 ? "полностью" : "почти полностью"}
            </span>
          </div>
        )}

        {userAnswer.watchTime && (
          <div className="text-xs text-gray-500">
            Время просмотра: {Math.round(userAnswer.watchTime / 1000)} секунд
          </div>
        )}
      </div>
    );
  }; */

  // Render info card answer
  /* const renderInfoCardAnswer = () => {
    if (!userAnswer.timeSpent && !userAnswer.completed && !userAnswer.readTime)
      return null;

    return (
      <div className="space-y-3">
        {(userAnswer.timeSpent || userAnswer.readTime) && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              Время изучения:
            </p>
            <div className="bg-white rounded-lg p-3 border">
              <p className="text-gray-800">
                {Math.round(
                  (userAnswer.timeSpent || userAnswer.readTime) / 1000
                )}{" "}
                секунд
              </p>
            </div>
          </div>
        )}

        {userAnswer.completed && (
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              Информация изучена
            </span>
          </div>
        )}
      </div>
    );
  }; */

  // Loading state
  if (loading) {
    return (
      <div className="w-full bg-white rounded-xl shadow-lg min-h-[600px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Загружаем контент...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full bg-white rounded-xl shadow-lg min-h-[600px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Ошибка загрузки
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  if (!blockData && !loading) {
    return (
      <div className="w-full bg-white rounded-xl shadow-lg min-h-[600px] flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Контент не найден
          </h3>
          <p className="text-gray-600">Не удалось загрузить данные блока</p>
        </div>
      </div>
    );
  }

  // Render content based on block type
  const renderBlockContent = () => {
    const commonProps = {
      lesson: blockData,
      onStepComplete: handleBlockComplete,
      onAnswerUpdate: handleAnswerUpdate,
      previousAnswer: userAnswer, // Pass previous answer to components
    };

    switch (blockData?.type) {
      case "video":
        return <VideoLessonWithSubtitles {...commonProps} />;
      case "storytask":
        return <StoryTask {...commonProps} />;
      case "audiotask":
        return <AudioTask {...commonProps} />;
      case "infocard":
        return <InfoCard {...commonProps} />;
      case "matchtask":
        return <MatchTask {...commonProps} />;
      case "imagequiz":
        return <ImageQuiz {...commonProps} />;
      default:
        return (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {blockData?.title || "Контент"}
            </h3>
            <p className="text-gray-600 mb-4">
              Тип: {blockData?.type || "неизвестен"}
            </p>
            <p className="text-sm text-gray-500">
              Компонент для этого типа контента будет добавлен позже
            </p>
          </div>
        );
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case "video":
        return "Видео";
      case "storytask":
        return "Задание";
      case "audiotask":
        return "Аудирование";
      case "infocard":
        return "Инфокарточка";
      case "matchtask":
        return "Сопоставление";
      case "imagequiz":
        return "Квиз с изображениями";
      default:
        return type;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "draft":
        return "bg-yellow-500";
      case "in_progress":
        return "bg-blue-500";
      default:
        return "bg-gray-400";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "completed":
        return "Завершен";
      case "draft":
        return "Черновик";
      case "in_progress":
        return "В процессе";
      default:
        return "Не начат";
    }
  };

  return (
    <div className="w-full">
      {/* Block header */}
      <div className="bg-white rounded-xl shadow-lg mb-6 p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {blockData.title}
            </h2>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-sm text-gray-500">ID: {blockData.id}</span>
              <span className="capitalize bg-gray-100 px-2 py-1 rounded text-xs text-gray-600">
                {getTypeLabel(blockData.type)}
              </span>
            </div>
          </div>

          <div className="text-right">
            <div
              className={`w-3 h-3 rounded-full ${getStatusColor(blockStatus)}`}
            ></div>
            <span className="text-xs text-gray-500 mt-1 block">
              {getStatusLabel(blockStatus)}
            </span>
          </div>
        </div>
      </div>

      {/* Answer Summary */}
      {/* {renderAnswerSummary()} */}

      {/* Main content */}
      <div className="bg-white rounded-xl shadow-lg min-h-[600px]">
        <div className="p-6">{renderBlockContent()}</div>
      </div>
    </div>
  );
};

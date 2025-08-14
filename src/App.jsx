import React, { useState } from "react";
import lessonData from "./data/lessonData";
import { SidebarNav } from "./components/Sidebar/Sidebar";
import { Lesson } from "./components/Lesson/Lesson";

function App() {
  const [currentLessonId, setCurrentLessonId] = useState(1);

  // Find the full lesson object based on the current ID
  const activeLesson = lessonData.find(
    (lesson) => lesson.id === currentLessonId
  );

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900 flex">
      <SidebarNav
        lessons={lessonData}
        currentLesson={currentLessonId}
        setCurrentLesson={setCurrentLessonId}
      />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800">
            Lesson {activeLesson?.id}: {activeLesson?.title}
          </h2>
          <p className="text-gray-600 mt-1 text-lg">
            {activeLesson?.description}
          </p>
        </div>
        {activeLesson ? (
          <Lesson
            key={currentLessonId}
            lesson={activeLesson}
            currentLesson={currentLessonId}
            setCurrentLesson={setCurrentLessonId}
          />
        ) : (
          <p>Lesson not found. Please select a lesson from the side menu.</p>
        )}
      </main>
    </div>
  );
}

export default App;

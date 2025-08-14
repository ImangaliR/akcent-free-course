import { BookOpen, LogOut } from "lucide-react";

export const SidebarNav = ({ lessons, currentLesson, setCurrentLesson }) => (
  <aside className="w-64 bg-white shadow-lg flex-shrink-0">
    <div className="p-6 border-b">
      <h1 className="text-2xl font-bold text-gray-800">
        Russian for Beginners
      </h1>
    </div>
    <div className="grid justify-between">
      <nav className="mt-2">
        <p className="px-6 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Lessons
        </p>
        <ul>
          {lessons.map((lesson) => (
            <li key={lesson.id}>
              <button
                onClick={() => setCurrentLesson(lesson.id)}
                className={`w-full text-left px-6 py-3 text-sm font-medium transition-colors flex items-center ${
                  currentLesson === lesson.id
                    ? "bg-indigo-50 text-indigo-700 border-r-4 border-indigo-500"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                }`}
              >
                <BookOpen className="w-5 h-5 mr-2" />
                <span className="truncate">{`Lesson ${lesson.id}: ${lesson.title}`}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="flex justify-center">
        <div className="flex gap-2 w-fit items-center justify-center hover:text-red-600 transition-colors">
          <LogOut className="w-5 h-5 text-red-500" />
          <button className="text-red-500">Выход</button>
        </div>
      </div>
    </div>
  </aside>
);

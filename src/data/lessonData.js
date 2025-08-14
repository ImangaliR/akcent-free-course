const lessonData = [
  {
    id: 1,
    title: "Greetings",
    description: "Learn the most common ways to greet someone in Russian.",
    videoUrl: "https://www.youtube.com/embed/wJ-B_e5bV4s",
    quiz: {
      correctAnswers: {
        singleChoice: "b",
        multipleChoice: ["a", "c"],
        fillInTheBlank: "хорошо",
        dialogue: { blank1: "Привет", blank2: "дела", blank3: "Спасибо" },
      },
      totalScore: 6,
    },
  },
  {
    id: 2,
    title: "Introductions",
    description: "Learn how to introduce yourself and ask for someone's name.",
    videoUrl: "https://www.youtube.com/embed/FynB_12Y_aY", // Placeholder video
    quiz: {
      // Placeholder quiz data
      correctAnswers: {
        singleChoice: "a",
        multipleChoice: ["b", "d"],
        fillInTheBlank: "зовут",
        dialogue: { blank1: "Как", blank2: "тебя", blank3: "Меня" },
      },
      totalScore: 6,
    },
  },
  // Add lessons 3, 4, 5, 6 here in the future
];
export default lessonData;

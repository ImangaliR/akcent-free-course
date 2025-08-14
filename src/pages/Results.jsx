export const ResultsPage = ({ score, totalScore }) => (
  <div className="text-center flex flex-col items-center justify-center h-full">
    <h3 className="text-2xl md:text-3xl font-bold mb-4 text-gray-800">
      Ваши результаты!
    </h3>
    <p className="text-gray-600 mb-6 text-lg md:text-xl">
      Вы закончили этот урок
    </p>
    <div className="bg-indigo-100 rounded-full w-48 h-48 flex items-center justify-center mb-8 border-4 border-indigo-200">
      <p className="text-5xl font-bold text-indigo-700">
        {score}
        <span className="text-3xl text-indigo-500">/{totalScore}</span>
      </p>
    </div>
    <p className="max-w-md mx-auto text-gray-600">
      {score > 4 ? "Отлично! " : "Неплохо! "}
    </p>
    <p className="max-w-md mx-auto text-gray-600 mt-4">
      Готовы к следующему уроку?
    </p>
  </div>
);

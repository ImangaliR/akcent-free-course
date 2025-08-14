export const VideoLesson = ({ videoUrl, title }) => (
  <div>
    <h3 className="text-2xl font-bold mb-4 text-gray-800">Посмотрите видео</h3>
    <p className="text-gray-600 mb-6">
      Пожалуйста, посмотрите видео ниже, чтобы лучше понять материал урока.
    </p>
    <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden shadow-md">
      <iframe
        className="w-full h-90"
        src={videoUrl}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  </div>
);

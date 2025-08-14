// VideoLesson.jsx

/**
 * Нормализует "обычные" YouTube ссылки в embed-формат.
 * Поддерживает:
 *  - https://www.youtube.com/watch?v=ID
 *  - https://youtu.be/ID
 *  - https://www.youtube.com/shorts/ID
 * Остальные URL возвращает без изменений (например, Vimeo).
 */
function toEmbedUrl(url) {
  if (!url) return "";
  try {
    const u = new URL(url);

    // youtu.be/ID
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.replace("/", "");
      return `https://www.youtube.com/embed/${id}`;
    }

    // youtube.com/watch?v=ID
    if (
      u.hostname.includes("youtube.com") &&
      (u.pathname === "/watch" || u.pathname === "/watch/")
    ) {
      const id = u.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : url;
    }

    // youtube.com/shorts/ID
    if (
      u.hostname.includes("youtube.com") &&
      u.pathname.startsWith("/shorts/")
    ) {
      const id = u.pathname.split("/")[2];
      return id ? `https://www.youtube.com/embed/${id}` : url;
    }

    return url;
  } catch {
    return url;
  }
}

export const VideoLesson = ({ videoUrl, title = "Видео урок" }) => {
  const embedUrl = toEmbedUrl(videoUrl);

  if (!embedUrl) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 p-6 text-sm text-gray-500">
        Не указан <code>videoUrl</code>. Добавьте ссылку на видео.
      </div>
    );
  }

  return (
    <section className="w-full max-w-5xl">
      <header className="mb-4">
        <h3 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Посмотрите видео
        </h3>
        <p className="text-gray-600 mt-2">
          Пожалуйста, посмотрите видео ниже, чтобы лучше понять материал урока.
        </p>
      </header>

      {/* Контейнер с правильным соотношением сторон и аккуратными углами */}
      <div className="aspect-video rounded-xl overflow-hidden shadow-md ring-1 ring-black/5">
        <iframe
          className="w-full h-full"
          src={embedUrl}
          title={title}
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>

      {/* Небольшая подпись (опционально) */}
      <p className="sr-only">Видео: {title}</p>
    </section>
  );
};

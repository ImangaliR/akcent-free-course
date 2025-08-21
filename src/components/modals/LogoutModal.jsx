// LogoutModal.jsx
import { LogOut, X } from "lucide-react";

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all scale-100 animate-in fade-in duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400  hover:text-gray-600 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-8 text-center">
          {/* Icon */}
          <div className="mx-auto mb-6 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <LogOut className="w-8 h-8 text-red-500" />
          </div>

          {/* Title */}
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Жүйеден шығу
          </h3>

          {/* Message */}
          {/* <p className="text-gray-600 mb-8">
            Шыққыңыз келетініне сенімдісіз бе? Барлық сақталмаған деректер
            жоғалуы мүмкін.
          </p> */}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100  cursor-pointer hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Болдырмау
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 cursor-pointer text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-300"
            >
              Шығу
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;

import { useEffect } from "react";

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const baseStyles = `
    fixed top-24 right-6 z-50 max-w-sm px-6 py-4 rounded-xl 
    text-white shadow-2xl backdrop-blur-md transition-transform 
    transform animate-toast-slide
  `; // Changed top-6 to top-24 to move it lower

  const toastTypeStyles =
    type === "SUCCESS"
      ? "bg-green-500/90 border border-green-300/40"
      : "bg-red-500/90 border border-red-300/40";

  return (
    <div className={`${baseStyles} ${toastTypeStyles}`}>
      <span className="text-base font-semibold">{message}</span>
    </div>
  );
};

export default Toast;

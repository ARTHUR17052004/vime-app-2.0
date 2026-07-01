export default function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  className = "",
}) {
  const variants = {
    primary:
      "bg-green-700 hover:bg-green-800 text-white",

    secondary:
      "bg-gray-100 hover:bg-gray-200 text-gray-700",

    danger:
      "bg-red-600 hover:bg-red-700 text-white",

    warning:
      "bg-yellow-500 hover:bg-yellow-600 text-white",

    info:
      "bg-blue-600 hover:bg-blue-700 text-white",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`
        px-5
        py-3
        rounded-xl
        font-medium
        transition-all
        duration-200
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </button>
  );
}
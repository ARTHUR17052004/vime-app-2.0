export default function Card({
  children,
  className = "",
  padding = "p-6",
  hover = true,
  border = true,
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      className={`
        glass
        ${hover ? "glass-hover transition-all duration-300" : ""}
        ${border ? "border border-white/10" : ""}
        ${padding}
        rounded-2xl
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
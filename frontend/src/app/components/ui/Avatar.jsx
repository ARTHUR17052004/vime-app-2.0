"use client";

export default function Avatar({
  name = "VIME",
  src = null,
  size = "md",
  className = "",
}) {
  const sizes = {
    sm: "w-9 h-9 text-sm",
    md: "w-11 h-11 text-base",
    lg: "w-16 h-16 text-2xl",
    xl: "w-28 h-28 text-5xl",
  };

  const initials = name
    .trim()
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`
          ${sizes[size]}
          rounded-full
          object-cover
          border
          border-white/10
          shadow-xl
          shadow-emerald-900/20
          ${className}
        `}
      />
    );
  }

  return (
    <div
      className={`
        ${sizes[size]}

        rounded-full

        bg-gradient-to-br
        from-emerald-500
        via-green-600
        to-emerald-700

        flex
        items-center
        justify-center

        font-bold
        text-white

        shadow-xl
        shadow-emerald-900/30

        select-none

        ${className}
      `}
    >
      {initials}
    </div>
  );
}
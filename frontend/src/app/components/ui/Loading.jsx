"use client";

export default function Loading({
  text = "Carregando...",

  size = "md",

  fullScreen = false,
}) {
  const sizes = {
    sm: "w-6 h-6 border-2",
    md: "w-10 h-10 border-4",
    lg: "w-14 h-14 border-[5px]",
  };

  return (
    <div
      className={`
        flex
        flex-col
        items-center
        justify-center
        gap-4

        ${
          fullScreen
            ? "fixed inset-0 z-[999] bg-[#111827]/70 backdrop-blur-sm"
            : "py-12"
        }
      `}
    >
      <div
        className={`
          ${sizes[size]}

          rounded-full

          border-emerald-500
          border-t-transparent

          animate-spin
        `}
      />

      <p
        className="
          text-sm
          font-medium
          text-gray-400
          animate-pulse
        "
      >
        {text}
      </p>
    </div>
  );
}
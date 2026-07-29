"use client";

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  color = "emerald",
  className = "",
}) {
  const colors = {
    emerald: {
      border: "border-emerald-500/30",
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
    },

    blue: {
      border: "border-blue-500/30",
      bg: "bg-blue-500/10",
      text: "text-blue-400",
    },

    yellow: {
      border: "border-yellow-500/30",
      bg: "bg-yellow-500/10",
      text: "text-yellow-400",
    },

    red: {
      border: "border-red-500/30",
      bg: "bg-red-500/10",
      text: "text-red-400",
    },

    purple: {
      border: "border-purple-500/30",
      bg: "bg-purple-500/10",
      text: "text-purple-400",
    },

    orange: {
      border: "border-orange-500/30",
      bg: "bg-orange-500/10",
      text: "text-orange-400",
    },
  };

  const style =
    colors[color] || colors.emerald;

  return (
    <div
      className={`
        rounded-3xl
        border
        ${style.border}
        bg-[#17212b]
        p-6
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-xl
        ${className}
      `}
    >
      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm text-gray-400">
            {title}
          </p>

          <h2
            className={`
              text-4xl
              font-bold
              mt-2
              ${style.text}
            `}
          >
            {value}
          </h2>

          {subtitle && (
            <p className="text-xs text-gray-500 mt-2">
              {subtitle}
            </p>
          )}

        </div>

        {icon && (
          <div
            className={`
              w-14
              h-14
              rounded-2xl
              flex
              items-center
              justify-center
              ${style.bg}
            `}
          >
            {icon}
          </div>
        )}

      </div>
    </div>
  );
}
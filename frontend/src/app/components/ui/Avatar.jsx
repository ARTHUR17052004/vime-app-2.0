"use client";

export default function Avatar({
  name = "VIME",
  src = null,
  size = "md",
  status = null,
  className = "",
}) {
  const sizes = {
    sm: "w-10 h-10 text-sm",
    md: "w-12 h-12 text-base",
    lg: "w-16 h-16 text-xl",
    xl: "w-28 h-28 text-5xl",
  };

  const initials = name
    .trim()
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className={`relative inline-flex ${className}`}>

      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name}
          className={`
            ${sizes[size]}

            rounded-full
            object-cover

            border
            border-[var(--border-token)]

            shadow-xl
            shadow-emerald-950/30
          `}
        />
      ) : (
        <div
          className={`
            ${sizes[size]}

            rounded-full

            bg-linear-to-br
            from-emerald-500
            via-green-600
            to-emerald-700

            flex
            items-center
            justify-center

            font-bold
            text-[var(--text)]

            border
            border-[var(--border-token)]

            shadow-xl
            shadow-emerald-950/30

            select-none
          `}
        >
          {initials}
        </div>
      )}

      {status && (
        <span
          className={`
            absolute
            bottom-0
            right-0

            w-3.5
            h-3.5

            rounded-full

            border-2
            border-[#182128]

            ${
              status === "online"
                ? "bg-emerald-500"
                : status === "away"
                ? "bg-yellow-500"
                : "bg-gray-500"
            }
          `}
        />
      )}

    </div>
  );
}
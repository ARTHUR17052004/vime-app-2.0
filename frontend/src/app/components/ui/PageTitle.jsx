"use client";

export default function PageTitle({
  title,
  subtitle,
  className = "",
}) {
  return (
    <div className={className}>
      <h1
        className="
          text-4xl
          font-bold
          tracking-tight
          text-white
        "
      >
        {title}
      </h1>

      {subtitle && (
        <p
          className="
            mt-2
            text-gray-400
            text-base
          "
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
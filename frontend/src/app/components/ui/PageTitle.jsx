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
          text-[var(--text)]
        "
      >
        {title}
      </h1>

      {subtitle && (
        <p
          className="
            mt-2
            text-[var(--text-subtle)]
            text-base
          "
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
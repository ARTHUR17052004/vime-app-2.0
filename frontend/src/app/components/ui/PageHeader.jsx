"use client";

export default function VimePageHeader({
  title,
  subtitle,
  count,
  countLabel,
  actions,
  children,
}) {
  return (
    <div className="mb-8">

      <div className="flex items-start justify-between gap-6 flex-wrap">

        <div>

          <h1
            className="
              text-3xl
              sm:text-4xl
              md:text-6xl
              font-black
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
                text-base
                md:text-2xl
                text-gray-300
              "
            >
              {subtitle}
            </p>
          )}

          {count !== undefined && (
            <p
              className="
                mt-1
                text-sm
                font-semibold
                text-emerald-400
              "
            >
              {count} {countLabel}
            </p>
          )}

        </div>

        {actions && (
          <div className="flex gap-3">
            {actions}
          </div>
        )}

      </div>

      {children && (
        <div className="mt-8">
          {children}
        </div>
      )}

    </div>
  );
}
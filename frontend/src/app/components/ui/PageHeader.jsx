export default function PageHeader({
  title,
  subtitle,
  actions,
}) {
  return (
    <div className="flex items-center justify-between mb-8">

      <div>

        <h1 className="text-3xl font-bold text-gray-800">
          {title}
        </h1>

        {subtitle && (
          <p className="text-gray-500 mt-2">
            {subtitle}
          </p>
        )}

      </div>

      {actions}

    </div>
  );
}
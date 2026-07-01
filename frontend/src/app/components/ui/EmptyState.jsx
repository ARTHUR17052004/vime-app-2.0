export default function EmptyState({
  title,
  description,
}) {
  return (
    <div className="text-center py-16">

      <h2 className="text-xl font-bold text-gray-700">
        {title}
      </h2>

      <p className="text-gray-500 mt-2">
        {description}
      </p>

    </div>
  );
}
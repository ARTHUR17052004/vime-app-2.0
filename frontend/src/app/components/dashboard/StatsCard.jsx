export default function StatsCard({
  title,
  value
}) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-sm text-gray-800">
        {title}
      </h2>

      <p className="text-3xl font-bold mt-2">
        {value}
      </p>
    </div>
  );
}
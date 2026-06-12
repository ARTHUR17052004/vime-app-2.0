export default function OccupancyCard() {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-semibold text-gray-800">
        Ocupação
      </h2>

      <div className="mt-4 space-y-3">
        <div>
          <p className="text-sm text-gray-500">
            Kitnets Ocupadas
          </p>

          <p className="text-2xl font-bold text-green-600">
            0
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">
            Kitnets Vagas
          </p>

          <p className="text-2xl font-bold text-orange-500">
            0
          </p>
        </div>
      </div>
    </div>
  );
}
export default function Topbar() {
  return (
    <header className="bg-white h-16 shadow-sm flex items-center justify-between px-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-800">
          VIME 2.0
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500">
          Arthur
        </span>

        <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
          A
        </div>
      </div>
    </header>
  );
}
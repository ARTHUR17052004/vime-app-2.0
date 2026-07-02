export default function Topbar() {
  return (
    <header
      className="
        glass
        h-20
        mx-6
        mt-6
        px-8
        flex
        items-center
        justify-between
      "
    >
      <div>
        <h1 className="text-3xl font-bold text-white">
          Dashboard
        </h1>

        <p className="text-green-300 text-sm mt-1">
          Bem-vindo ao VIME 2.0
        </p>
      </div>

      <div className="flex items-center gap-5">

        <button
          className="
            w-11
            h-11
            rounded-full
            bg-white/10
            hover:bg-white/20
            text-xl
          "
        >
          🔔
        </button>

        <div className="text-right">

          <p className="text-white font-semibold">
            Arthur
          </p>

          <p className="text-green-300 text-sm">
            Administrador
          </p>

        </div>

        <div
          className="
            w-12
            h-12
            rounded-full
            bg-green-600
            flex
            items-center
            justify-center
            text-white
            font-bold
            text-lg
            border
            border-green-400
          "
        >
          A
        </div>

      </div>
    </header>
  );
}
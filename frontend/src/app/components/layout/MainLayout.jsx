import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function MainLayout({ children }) {
  return (
    <div className="flex h-screen relative">

      {/* Fundo */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/background.jpg')",
        }}
      />

      {/* Camada escura */}
      <div className="fixed inset-0 bg-black/45 backdrop-blur-sm" />

      <Sidebar />

      <div className="flex flex-col flex-1 relative z-10">

        <Topbar />

        <main className="flex-1 overflow-auto p-8">
          {children}
        </main>

      </div>

    </div>
  );
}
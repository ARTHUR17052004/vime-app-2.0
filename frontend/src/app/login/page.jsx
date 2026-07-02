"use client";

import LoginForm from "../components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center p-6"
      style={{
        backgroundImage: "url('/images/background.jpg')",
      }}
    >
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" />

      <div className="relative z-10 w-full max-w-md">

        <div className="text-center mb-8">

          <h1 className="text-5xl font-bold text-white">
            VIME
          </h1>

          <p className="text-green-300 mt-2">
            Gestão Inteligente de Locações
          </p>

        </div>

        <div className="glass p-8">
          <LoginForm />
        </div>

      </div>
    </div>
  );
}
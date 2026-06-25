"use client";

export default function OcorrenciaForm() {

  return (

    <div className="space-y-6">

      <div>

        <label className="block text-gray-900 mb-2">
          Título
        </label>

        <input
          className="w-full border rounded-2xl p-4 text-gray-900"
        />

      </div>

      <div>

        <label className="block text-gray-900 mb-2">
          Descrição
        </label>

        <textarea
          rows="5"
          className="w-full border rounded-2xl p-4 text-gray-900"
        />

      </div>

    </div>

  );

}
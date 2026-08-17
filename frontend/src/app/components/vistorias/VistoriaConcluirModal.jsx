"use client";

import { useEffect, useState } from "react";
import { Image as ImageIcon } from "lucide-react";

import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { formatDate } from "@/utils/formatDate";

export default function VistoriaConcluirModal({
  isOpen,
  onClose,
  vistoria,
  onConfirm,
}) {
  const [data, setData] = useState("");
  const [midias, setMidias] = useState([]);

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setData(new Date().toISOString().split("T")[0]);
      setMidias([]);
    }
  }, [isOpen]);

  const handleArquivos = (e) => {
    const arquivos = Array.from(e.target.files || []);

    arquivos.forEach((arquivo) => {
      const reader = new FileReader();

      reader.onload = () => {
        setMidias((prev) => [...prev, reader.result]);
      };

      reader.readAsDataURL(arquivo);
    });
  };

  const handleConfirmar = () => {
    onConfirm({
      dataUltima: data,
      fotosConclusao: midias,
    });
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Registrar Vistoria Realizada"
      subtitle={vistoria?.nomeVistoria}
      size="md"
    >
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-[var(--text-muted)] mb-2">
            Data em que foi realizada
          </label>

          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="
              w-full
              rounded-xl
              border
              border-[var(--border-token)]
              bg-[var(--surface-2)]
              px-4
              py-3
              text-[var(--text)]
              outline-none
              focus:border-emerald-500
            "
          />

          {data && (
            <p className="text-xs text-[var(--text-faint)] mt-2">
              Será registrada como {formatDate(data)}
            </p>
          )}
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-[var(--text-muted)] mb-2">
            <ImageIcon size={16} />
            Fotos e vídeos da execução (opcional)
          </label>

          <input
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleArquivos}
            className="
              w-full
              rounded-xl
              border
              border-[var(--border-token)]
              bg-[var(--surface-2)]
              px-4
              py-3
              text-[var(--text)]
              text-sm
            "
          />

          {midias.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mt-4">
              {midias.map((midia, index) =>
                midia.startsWith("data:video") ? (
                  <video
                    key={index}
                    src={midia}
                    controls
                    className="w-full h-24 object-cover rounded-xl border border-[var(--border-token)]"
                  />
                ) : (
                  <img
                    key={index}
                    src={midia}
                    alt={`Mídia ${index + 1}`}
                    className="w-full h-24 object-cover rounded-xl border border-[var(--border-token)]"
                  />
                )
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>

          <Button onClick={handleConfirmar}>
            Confirmar Realização
          </Button>
        </div>
      </div>
    </Modal>
  );
}

"use client";

import Modal from "../ui/Modal";
import Card from "../ui/Card";

function Info({ label, value }) {
  return (
    <Card className="p-5">

      <p className="text-xs uppercase tracking-[0.18em] text-gray-500">
        {label}
      </p>

      <p className="mt-2 text-base font-semibold text-white">
        {value || "-"}
      </p>

    </Card>
  );
}

export default function UnitViewModal({
  unidade,
  isOpen,
  onClose,
}) {

  if (!isOpen || !unidade) return null;

  return (

    <Modal
      open={isOpen}
      onClose={onClose}
      title={unidade.nome}
      subtitle="Informações completas da unidade"
      size="xl"
    >

      <div className="space-y-8">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <Info
            label="Nome"
            value={unidade.nome}
          />

          <Info
            label="CEP"
            value={unidade.cep}
          />

          <Info
            label="Logradouro"
            value={unidade.logradouro}
          />

          <Info
            label="Número"
            value={unidade.numero}
          />

          <Info
            label="Complemento"
            value={unidade.complemento}
          />

          <Info
            label="Bairro"
            value={unidade.bairro}
          />

          <Info
            label="Cidade"
            value={unidade.cidade}
          />

          <Info
            label="UF"
            value={unidade.uf}
          />

          <Info
            label="Locador"
            value={unidade.locador}
          />

          <Info
            label="Kitnets"
            value={unidade.kitnets}
          />

          <Info
            label="Valor do aluguel"
            value={
              unidade.aluguel
                ? `R$ ${unidade.aluguel}`
                : "-"
            }
          />

          <Info
            label="Status"
            value={unidade.status}
          />

        </div>

        <Card className="p-6">

          <p className="text-xs uppercase tracking-[0.18em] text-gray-500">

            Observações

          </p>

          <p className="mt-3 whitespace-pre-wrap leading-7 text-gray-300">

            {unidade.observacoes ||
              "Nenhuma observação cadastrada."}

          </p>

        </Card>

      </div>

    </Modal>

  );

}
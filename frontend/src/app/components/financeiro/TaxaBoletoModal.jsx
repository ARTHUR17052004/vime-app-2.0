"use client";

import { useEffect, useState } from "react";

import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { ConfiguracaoFinanceiroService } from "../../../services/configuracaoFinanceiro.service";

export default function TaxaBoletoModal({ isOpen, onClose, onSalvo }) {
  const [taxa, setTaxa] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {

    if (!isOpen) return;

    setErro("");
    setCarregando(true);

    ConfiguracaoFinanceiroService.buscar()
      .then((resposta) => {
        const dados = resposta.data || resposta;
        setTaxa(String(dados.taxaBoletoPercentual ?? 0));
      })
      .catch((err) => setErro(err.message || "Não foi possível carregar a taxa atual."))
      .finally(() => setCarregando(false));

  }, [isOpen]);

  const salvar = async () => {

    setSalvando(true);
    setErro("");

    try {

      await ConfiguracaoFinanceiroService.atualizar({ taxaBoletoPercentual: taxa });

      onSalvo?.();
      onClose();

    } catch (err) {

      setErro(err.message || "Não foi possível salvar a taxa.");

    } finally {

      setSalvando(false);

    }

  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Taxa de boleto"
      subtitle="% descontado pelo banco/Asaas na emissão -- usado pra calcular o Valor a Receber sozinho em cada cobrança nova."
      size="sm"
    >
      <div className="space-y-5">

        <div>
          <label className="block text-xs text-[var(--text-faint)] mb-1.5">
            Taxa (%)
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={taxa}
            onChange={(e) => setTaxa(e.target.value)}
            disabled={carregando}
            placeholder="Ex.: 3"
            className="border border-[var(--border-token)] bg-[var(--surface-2)] text-[var(--text)] rounded-xl p-3 w-full disabled:opacity-50"
          />
          <p className="text-[11px] text-[var(--text-faint)] mt-1.5">
            Ex.: boleto de R$ 800 com taxa de 3% -- valor a receber calculado sozinho: R$ 776.
          </p>
        </div>

        {erro && (
          <p className="text-sm text-red-400">{erro}</p>
        )}

        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={salvar} disabled={salvando || carregando}>
            {salvando ? "Salvando..." : "Salvar"}
          </Button>
        </div>

      </div>
    </Modal>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

import Input from "../ui/Input";
import Button from "../ui/Button";

import { WhatsappService } from "../../../services/whatsapp.service";
import { usePermissao } from "../../../hooks/usePermissao";

export default function WhatsappAssistenteCard({
  dados,
  onAtualizar,
}) {
  const podeConfigurar = usePermissao("whatsapp.assistenteConfigurar");

  const [ativo, setAtivo] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!dados) return;

    setAtivo(dados.iaAtivo === true);
  }, [dados]);

  async function salvar() {
    try {
      setSalvando(true);

      await WhatsappService.salvarConfiguracao({
        iaAtivo: ativo,
        // Só manda a chave se o usuário digitou uma nova -- em branco
        // significa "não mexe na que já está salva".
        iaApiKey: apiKey || undefined,
      });

      setApiKey("");

      alert("Configuração do assistente salva com sucesso!");

      onAtualizar?.();
    } catch (error) {
      console.error(error);

      alert("Erro ao salvar configuração do assistente.");
    } finally {
      setSalvando(false);
    }
  }

  const jaConfigurada = dados?.iaApiKeyConfigurada;

  return (
    <div
      className="
        rounded-3xl
        border
        border-[var(--border-token)]
        bg-[#101827]
        p-8
        shadow-xl
      "
    >
      <div className="flex items-center gap-3 mb-6">

        <div
          className="
            w-11
            h-11
            rounded-2xl
            bg-purple-500/10
            border
            border-purple-500/20
            flex
            items-center
            justify-center
          "
        >
          <Sparkles size={20} className="text-purple-400" />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-[var(--text)]">
            Assistente IA
          </h2>
          <p className="text-sm text-[var(--text-subtle)]">
            Responde automaticamente perguntas de inquilinos sobre o próprio contrato e cobranças.
          </p>
        </div>

      </div>

      <label
        className="
          flex
          items-center
          gap-3
          cursor-pointer
          w-fit
          mb-6
        "
      >
        <input
          type="checkbox"
          checked={ativo}
          onChange={(e) => setAtivo(e.target.checked)}
          className="sr-only peer"
        />
        <div
          className="
            w-12
            h-7
            rounded-full
            bg-[var(--surface-2)]
            border
            border-[var(--border-token)]
            peer-checked:bg-purple-500
            peer-checked:border-purple-400
            transition
            relative
            after:content-['']
            after:absolute
            after:top-0.5
            after:left-0.5
            after:w-5
            after:h-5
            after:rounded-full
            after:bg-[var(--text)]
            after:transition-transform
            peer-checked:after:translate-x-5
          "
        />
        <span className="text-[var(--text-1)] font-medium">
          {ativo ? "Assistente ativado" : "Assistente desativado"}
        </span>
      </label>

      <Input
        label="Chave da API (Anthropic)"
        type="password"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        placeholder={
          jaConfigurada
            ? "Já configurada — deixe em branco para manter"
            : "sk-ant-..."
        }
      />

      <p className="mt-4 text-sm text-[var(--text-faint)]">
        Gerada em <strong>console.anthropic.com</strong> → API Keys. O assistente só
        responde a números que já são de um inquilino cadastrado — para qualquer outro
        contato, a conversa continua caindo normalmente na caixa de mensagens.
      </p>

      {podeConfigurar && (
        <div className="mt-8">
          <Button onClick={salvar} disabled={salvando}>
            {salvando ? "Salvando..." : "Salvar Assistente"}
          </Button>
        </div>
      )}

    </div>
  );
}

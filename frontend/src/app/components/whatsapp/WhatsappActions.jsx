"use client";

import { useState } from "react";

import Button from "../ui/Button";
import Modal from "../ui/Modal";

import {
  QrCode,
  PlugZap,
  Send,
  RefreshCcw,
} from "lucide-react";

import { WhatsappService } from "../../../services/whatsapp.service";
import { usePermissao } from "../../../hooks/usePermissao";

export default function WhatsappActions({

  onAtualizar,

}) {

  const podeConectar = usePermissao("whatsapp.conectar");
  const podeEnviar = usePermissao("whatsapp.enviar");

  const [qrCode, setQrCode] = useState("");

  const [modalQr, setModalQr] = useState(false);

  async function conectar() {

    try {

      await WhatsappService.conectar();

      alert("WhatsApp conectado com sucesso.");

      onAtualizar?.();

    } catch (error) {

      console.error(error);

      alert("Erro ao conectar.");

    }

  }

  async function gerarQrCode() {

    try {

      const resposta =
        await WhatsappService.gerarQrCode();

      setQrCode(resposta.data.qrCode);

      setModalQr(true);

    } catch (error) {

      console.error(error);

      alert("Erro ao gerar QR Code.");

    }

  }

  async function sincronizar() {

    try {

      await WhatsappService.sincronizar();

      alert("Conversas sincronizadas.");

    } catch (error) {

      console.error(error);

      alert("Erro ao sincronizar.");

    }

  }

  async function enviarTeste() {

    const numero = prompt(
      "Digite o número de WhatsApp para o teste (com DDD, ex: 5562999999999):"
    );

    if (!numero) return;

    try {

      await WhatsappService.enviar({

        numero,

        mensagem: "Teste enviado pelo VIME 2.0 🚀",

      });

      alert("Mensagem enviada com sucesso.");

    } catch (error) {

      console.error(error);

      alert(error.message || "Erro ao enviar mensagem.");

    }

  }

  return (

    <div
      className="
        rounded-3xl
        border
        border-[var(--border-token)]
        bg-[#101827]
        p-6
        shadow-xl
      "
    >

      <h2 className="text-2xl font-bold text-[var(--text)] mb-6">

        Ações

      </h2>

      <div className="flex flex-wrap gap-4">

        {podeConectar && (
          <Button onClick={conectar}>

            <PlugZap size={18} />

            Conectar

          </Button>
        )}

        {podeConectar && (
          <Button
            variant="secondary"
            onClick={gerarQrCode}
          >

            <QrCode size={18} />

            Gerar QR Code

          </Button>
        )}

        {podeEnviar && (
          <Button
            variant="secondary"
            onClick={enviarTeste}
          >

            <Send size={18} />

            Enviar Teste

          </Button>
        )}

        {podeConectar && (
          <Button
            variant="secondary"
            onClick={sincronizar}
          >

            <RefreshCcw size={18} />

            Sincronizar

          </Button>
        )}

      </div>

      <Modal
        open={modalQr}
        onClose={() => setModalQr(false)}
        title="QR Code do WhatsApp"
        size="md"
      >

        <div className="flex flex-col items-center gap-6">

          <p className="text-center text-[var(--text-muted)]">

            Escaneie este QR Code com o WhatsApp.

          </p>

          {qrCode && (

            <img
              src={qrCode}
              alt="QR Code"
              className="
                rounded-xl
                border
                border-[var(--border-token)]
                bg-white
                p-4
                w-72
                h-72
              "
            />

          )}

        </div>

      </Modal>

    </div>

  );

}
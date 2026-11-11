"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import MainLayout from "../components/layout/MainLayout";

import Page from "../components/ui/Page";
import PageContainer from "../components/ui/PageContainer";
import PageSection from "../components/ui/PageSection";
import Loading from "../components/ui/Loading";
import FadeIn from "../components/ui/FadeIn";
import { socket } from "../../services/socket";

import WhatsappHeader from "../components/whatsapp/WhatsappHeader";
import WhatsappStatusCard from "../components/whatsapp/WhatsappStatusCard";
import WhatsappConfigCard from "../components/whatsapp/WhatsappConfigCard";
import WhatsappAssistenteCard from "../components/whatsapp/WhatsappAssistenteCard";
import WhatsappAvisosCobrancaCard from "../components/whatsapp/WhatsappAvisosCobrancaCard";
import WhatsappActions from "../components/whatsapp/WhatsappActions";
import WhatsappConversations from "../components/whatsapp/WhatsappConversations";
import WhatsappChat from "../components/whatsapp/WhatsappChat";
import SemPermissao from "../components/ui/SemPermissao";

import { WhatsappService } from "../../services/whatsapp.service";
import { usePermissao } from "../../hooks/usePermissao";

export default function WhatsappPage() {
  return (
    <Suspense fallback={null}>
      <WhatsappPageConteudo />
    </Suspense>
  );
}

// useSearchParams() (lido aqui pro ?conversaId=... que vem das
// notificações) só funciona dentro de um Suspense -- sem isso o build
// de produção do Next recusa gerar a página.
function WhatsappPageConteudo() {

  const podeVisualizar = usePermissao("whatsapp.visualizar");

  // Clicar numa notificação de WhatsApp (nova mensagem, falha de envio)
  // leva pra cá com ?conversaId=... -- sem isso a tela sempre abria na
  // primeira conversa da lista, não na que gerou a notificação.
  const searchParams = useSearchParams();
  const conversaIdDaUrl = searchParams.get("conversaId");

  const [loading, setLoading] = useState(true);

  const [status, setStatus] = useState(null);

  const [configuracao, setConfiguracao] = useState(null);

  const [conversas, setConversas] = useState([]);

  const [conversaSelecionada, setConversaSelecionada] = useState(null);

  const [erro, setErro] = useState("");

  async function carregar() {

    try {

      setLoading(true);

      const [

        status,

        configuracao,

        conversas,

      ] = await Promise.all([

        WhatsappService.status(),

        WhatsappService.configuracao(),

        WhatsappService.conversas(),

      ]);

      setStatus(status.data);

      setConfiguracao(configuracao.data);

      setConversas(conversas.data);

      if (conversas.data.length > 0) {

        setConversaSelecionada((atual) => {

            let selecionada;

            if (!atual) {

            // Primeiro carregamento: se veio de uma notificação
            // (?conversaId=...), abre ela direto -- senão, a primeira
            // da lista, igual sempre foi.
            const daNotificacao = conversaIdDaUrl
              ? conversas.data.find((c) => c.id === conversaIdDaUrl)
              : null;

            selecionada = daNotificacao || conversas.data[0];

            } else {

            const encontrada = conversas.data.find(

            (c) => c.id === atual.id

            );

            selecionada = encontrada || conversas.data[0];

            }

            // A conversa que acabou de abrir sozinha (primeiro
            // carregamento ou veio de notificação) também conta como
            // "lida" por este usuário -- senão o badge fica preso até
            // ele clicar em outra e voltar.
            if (selecionada?.naoLidas) {

              WhatsappService
                .marcarConversaLida(selecionada.id)
                .catch((err) => console.error("Erro ao marcar conversa como lida:", err));

              selecionada = { ...selecionada, naoLidas: 0 };

              setConversas((lista) =>
                lista.map((c) => (c.id === selecionada.id ? { ...c, naoLidas: 0 } : c))
              );

            }

            return selecionada;

        });

        }

    } catch (err) {

      console.error(err);

      setErro(

        err.message ||

        "Erro ao carregar WhatsApp."

      );

    } finally {

      setLoading(false);

    }

  }

  useEffect(() => {

    carregar();

  }, []);

  // Abrir a conversa marca como lida só pra ESTE usuário (ver
  // whatsappService.marcarConversaLida) -- zera o badge na hora aqui
  // (otimista) sem esperar o próximo fetch/socket.
  function selecionarConversa(conversa) {

    setConversaSelecionada(conversa);

    if (!conversa || !conversa.naoLidas) return;

    setConversas((atual) =>
      atual.map((c) => (c.id === conversa.id ? { ...c, naoLidas: 0 } : c))
    );

    WhatsappService
      .marcarConversaLida(conversa.id)
      .catch((err) => console.error("Erro ao marcar conversa como lida:", err));

  }

  async function excluirConversa(id) {

    try {

      await WhatsappService.excluirConversa(id);

      setConversas((atual) => atual.filter((c) => c.id !== id));

      setConversaSelecionada((atual) => (atual?.id === id ? null : atual));

    } catch (err) {

      alert(err.message || "Erro ao excluir conversa.");

    }

  }

   useEffect(() => {

  // O payload que o socket manda é o mesmo pra todo mundo conectado
  // (io.emit, sem personalizar por usuário) -- "não lidas" agora é por
  // usuário (ver whatsappService.conversas), então usar esse payload
  // direto mostraria a contagem errada. Só serve de aviso "mudou algo":
  // busca de novo pela rota autenticada, que calcula certo pra quem tá
  // logado.
  socket.on("whatsapp:update", () => {

    WhatsappService.conversas().then((resposta) => {

      const dados = resposta.data || [];

      setConversas(dados);

      setConversaSelecionada((atual) => {

        if (!atual) return atual;

        const atualizada = dados.find((c) => c.id === atual.id);

        return atualizada || atual;

      });

    }).catch((err) => console.error("Erro ao atualizar conversas:", err));

  });

  return () => {

    socket.off("whatsapp:update");

  };

}, []);


  if (!podeVisualizar) {
    return <SemPermissao />;
  }

  if (loading) {

    return (

      <MainLayout>

        <Loading />

      </MainLayout>

    );

  }

   return (

    <MainLayout>

      <Page>

        <PageContainer>

          {erro && (

            <div
              className="
                mb-6
                rounded-2xl
                border
                border-red-500/20
                bg-red-500/10
                p-4
                text-red-300
              "
            >

              {erro}

            </div>

          )}

          <FadeIn>

            <WhatsappHeader />

          </FadeIn>

          <FadeIn delay={0.1}>

            <PageSection spacing="xl">

              <div className="grid grid-cols-12 gap-6">

                <div className="col-span-12 xl:col-span-4">

                  <WhatsappStatusCard
                    dados={status}
                  />

                </div>

                <div className="col-span-12 xl:col-span-8">

                  <WhatsappConfigCard
                    dados={configuracao}
                    onAtualizar={carregar}
                  />

                </div>

              </div>

            </PageSection>

          </FadeIn>

          <FadeIn delay={0.15}>

            <PageSection spacing="xl">

              <div className="grid grid-cols-12 gap-6">

                <div className="col-span-12 xl:col-span-6">

                  <WhatsappAssistenteCard
                    dados={configuracao}
                    onAtualizar={carregar}
                  />

                </div>

                <div className="col-span-12 xl:col-span-6">

                  <WhatsappAvisosCobrancaCard
                    dados={configuracao}
                    onAtualizar={carregar}
                  />

                </div>

              </div>

            </PageSection>

          </FadeIn>

          <FadeIn delay={0.2}>

            <PageSection spacing="xl">

              <WhatsappActions
                status={status}
                onAtualizar={carregar}
              />

            </PageSection>

          </FadeIn>

          <FadeIn delay={0.3}>

            <PageSection spacing="xxl">

              <div className="grid grid-cols-12 gap-6">

                <div className="col-span-12 xl:col-span-4">

                  <WhatsappConversations
                    conversas={conversas}
                    conversaSelecionada={conversaSelecionada}
                    onSelecionar={selecionarConversa}
                    onExcluir={excluirConversa}
                  />

                </div>

                <div className="col-span-12 xl:col-span-8">

                  <WhatsappChat
                    conversa={conversaSelecionada}
                  />

                </div>

              </div>

            </PageSection>

          </FadeIn>

        </PageContainer>

      </Page>

    </MainLayout>

  );

}
 
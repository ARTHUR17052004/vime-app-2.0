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

            if (!atual) {

            // Primeiro carregamento: se veio de uma notificação
            // (?conversaId=...), abre ela direto -- senão, a primeira
            // da lista, igual sempre foi.
            const daNotificacao = conversaIdDaUrl
              ? conversas.data.find((c) => c.id === conversaIdDaUrl)
              : null;

            return daNotificacao || conversas.data[0];

            }

            const encontrada = conversas.data.find(

            (c) => c.id === atual.id

            );

            return encontrada || conversas.data[0];

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

  socket.on("whatsapp:update", (dados) => {

    setConversas(dados);

    if (conversaSelecionada) {

      const atualizada = dados.find(
        (c) => c.id === conversaSelecionada.id
      );

      if (atualizada) {
        setConversaSelecionada(atualizada);
      }

    }

  });

  return () => {

    socket.off("whatsapp:update");

  };

}, [conversaSelecionada]);


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

              <WhatsappAssistenteCard
                dados={configuracao}
                onAtualizar={carregar}
              />

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
                    onSelecionar={setConversaSelecionada}
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
 
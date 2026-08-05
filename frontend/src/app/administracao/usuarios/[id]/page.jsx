"use client";

import {

  useEffect,

  useState,

} from "react";

import {

  useParams,

  useRouter,

} from "next/navigation";

import {

  User,

  Mail,

  Phone,

  Shield,

  CheckCircle2,

  Clock,

  ArrowLeft,

} from "lucide-react";

import MainLayout from "../../../components/layout/MainLayout";

import Page from "../../../components/ui/Page";
import PageContainer from "../../../components/ui/PageContainer";
import PageHeader from "../../../components/ui/PageHeader";
import PageSection from "../../../components/ui/PageSection";
import Button from "../../../components/ui/Button";
import FadeIn from "../../../components/ui/FadeIn";

import { UsuarioService } from "@/services/usuarios.service";

export default function UsuarioDetalhesPage() {

  const params = useParams();

  const router = useRouter();

  const [usuario, setUsuario] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    async function carregar() {

      try {

        const resposta = await UsuarioService.buscar(

          params.id

        );

        setUsuario(

          resposta.data || resposta

        );

      } catch (err) {

        console.error(err);

      } finally {

        setLoading(false);

      }

    }

    if (params.id) {

      carregar();

    }

  }, [params.id]);

  if (loading) {

    return (

      <MainLayout>

        <Page>

          <PageContainer>

            <div className="flex justify-center py-32">

              <p className="text-gray-400">

                Carregando usuário...

              </p>

            </div>

          </PageContainer>

        </Page>

      </MainLayout>

    );

  }

  if (!usuario) {

    return (

      <MainLayout>

        <Page>

          <PageContainer>

            <div className="flex justify-center py-32">

              <p className="text-red-400">

                Usuário não encontrado.

              </p>

            </div>

          </PageContainer>

        </Page>

      </MainLayout>

    );

  }

  return (

    <MainLayout>

      <Page>

        <PageContainer>

          <FadeIn>

            <PageHeader

              title={usuario.nome}

              subtitle="Visualização do usuário"

              actions={

                <Button

                  variant="secondary"

                  onClick={() => router.back()}

                >

                  <ArrowLeft size={18}/>

                  Voltar

                </Button>

              }

            />

          </FadeIn>

          <FadeIn delay={0.15}>

            <PageSection spacing="xxl">

              <div

                className="

                  rounded-3xl

                  border

                  border-white/10

                  bg-[#19242b]/90

                  backdrop-blur-xl

                  shadow-xl

                  p-8

                "

              >

                <div

                  className="

                    flex

                    items-center

                    gap-5

                    pb-8

                    border-b

                    border-white/10

                  "

                >

                  <div

                    className="

                      flex

                      items-center

                      justify-center

                      w-20

                      h-20

                      rounded-full

                      bg-emerald-500/20

                    "

                  >

                    <User

                      size={42}

                      className="text-emerald-400"

                    />

                  </div>

                  <div>

                    <h2 className="text-3xl font-black text-white">

                      {usuario.nome}

                    </h2>

                    <p className="text-gray-400">

                      {usuario.email}

                    </p>

                  </div>

                </div>

                <div className="grid lg:grid-cols-2 gap-6 mt-8">

                  <InfoCard

                    icon={<Mail size={20}/>}

                    titulo="E-mail"

                    valor={usuario.email}

                  />

                  <InfoCard

                    icon={<Phone size={20}/>}

                    titulo="Telefone"

                    valor={usuario.telefone || "-"}

                  />

                  <InfoCard

                    icon={<Shield size={20}/>}

                    titulo="Perfil"

                    valor={usuario.perfil}

                  />

                  <InfoCard

                    icon={<CheckCircle2 size={20}/>}

                    titulo="Status"

                    valor={

                      usuario.ativo

                        ? "ATIVO"

                        : "INATIVO"

                    }

                  />

                  <InfoCard

                    icon={<Clock size={20}/>}

                    titulo="Último acesso"

                    valor={

                      usuario.ultimoAcesso ||

                      "Nunca acessou"

                    }

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

function InfoCard({

  icon,

  titulo,

  valor,

}) {

  return (

    <div

      className="

        rounded-2xl

        border

        border-white/10

        bg-white/5

        p-5

      "

    >

      <div className="flex items-center gap-3 mb-3">

        <div className="text-emerald-400">

          {icon}

        </div>

        <span className="text-gray-400">

          {titulo}

        </span>

      </div>

      <h3 className="text-xl font-bold text-white">

        {valor}

      </h3>

    </div>

  );

}
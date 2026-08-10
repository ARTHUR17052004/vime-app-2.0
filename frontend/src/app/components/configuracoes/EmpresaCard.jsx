"use client";

import { Building2 } from "lucide-react";

import Card from "../ui/Card";
import Input from "../ui/Input";
import Button from "../ui/Button";

export default function EmpresaCard({
  dados = {},
  onChange = () => {},
  onSalvar = () => {},
  salvando = false,
}) {
  return (
    <Card className="rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl shadow-xl p-6">

      {/* Cabeçalho */}

      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 flex items-center justify-center">
          <Building2
            size={26}
            className="text-emerald-400"
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white">
            Informações da Empresa
          </h2>

          <p className="text-sm text-gray-400">
            Dados utilizados em contratos, documentos e relatórios.
          </p>
        </div>
      </div>

      {/* Formulário */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <Input
          label="Empresa"
          value={dados.nome || ""}
          onChange={(e) =>
            onChange("nome", e.target.value)
          }
        />

        <Input
          label="CNPJ"
          value={dados.cnpj || ""}
          onChange={(e) =>
            onChange("cnpj", e.target.value)
          }
        />

        <Input
          label="Telefone"
          value={dados.telefone || ""}
          onChange={(e) =>
            onChange("telefone", e.target.value)
          }
        />

        <Input
          label="E-mail"
          value={dados.email || ""}
          onChange={(e) =>
            onChange("email", e.target.value)
          }
        />

        <Input
          label="CEP"
          value={dados.cep || ""}
          onChange={(e) =>
            onChange("cep", e.target.value)
          }
        />

        <Input
          label="Cidade"
          value={dados.cidade || ""}
          onChange={(e) =>
            onChange("cidade", e.target.value)
          }
        />

        <div className="md:col-span-2">
          <Input
            label="Endereço"
            value={dados.endereco || ""}
            onChange={(e) =>
              onChange("endereco", e.target.value)
            }
          />
        </div>

        <Input
          label="UF"
          value={dados.uf || ""}
          onChange={(e) =>
            onChange("uf", e.target.value)
          }
        />

      </div>

      <div className="flex justify-end mt-8">
        <Button
          onClick={onSalvar}
          disabled={salvando}
        >
          {salvando ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </div>

    </Card>
  );
}
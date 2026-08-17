"use client";

import { useEffect, useState } from "react";

import Modal from "../../../components/ui/Modal";

export default function PerfilModal({

  isOpen,

  onClose,

  perfil,

  onSave,

}) {

  const [form, setForm] = useState({

    nome: "",

    descricao: "",

    ativo: true,

  });

  useEffect(() => {

    if (perfil) {

      setForm({

        nome: perfil.nome || "",

        descricao: perfil.descricao || "",

        ativo: perfil.ativo,

      });

    } else {

      setForm({

        nome: "",

        descricao: "",

        ativo: true,

      });

    }

  }, [perfil]);

  function alterar(e) {

    const { name, value, type, checked } = e.target;

    setForm((old) => ({

      ...old,

      [name]:

        type === "checkbox"

          ? checked

          : value,

    }));

  }

  async function salvar(e) {

    e.preventDefault();

    await onSave(form);

  }

  const input = `

    w-full

    rounded-2xl

    bg-[var(--surface-2)]

    border

    border-[var(--border-token)]

    px-4

    py-3

    text-[var(--text)]

    outline-none

    focus:border-emerald-500

  `;

  return (

    <Modal

      open={isOpen}

      onClose={onClose}

      size="lg"

    >

      <form

        onSubmit={salvar}

        className="space-y-6"

      >

        <div>

          <h2 className="text-3xl font-black text-[var(--text)]">

            {

              perfil

                ? "Editar Perfil"

                : "Novo Perfil"

            }

          </h2>

          <p className="text-[var(--text-subtle)] mt-2">

            Cadastro de perfis de acesso.

          </p>

        </div>

        <div className="space-y-5">

          <input

            name="nome"

            value={form.nome}

            onChange={alterar}

            className={input}

            placeholder="Nome do Perfil"

            required

          />

          <textarea

            name="descricao"

            value={form.descricao}

            onChange={alterar}

            className={`${input} min-h-[120px] resize-none`}

            placeholder="Descrição"

          />

          <label

            className="

              flex

              items-center

              gap-3

              text-[var(--text)]

            "

          >

            <input

              type="checkbox"

              name="ativo"

              checked={form.ativo}

              onChange={alterar}

            />

            Perfil Ativo

          </label>

        </div>

        <div

          className="

            border-t

            border-[var(--border-token)]

            pt-6

            flex

            justify-end

            gap-3

          "

        >

          <button

            type="button"

            onClick={onClose}

            className="

              px-6

              py-3

              rounded-2xl

              bg-[var(--surface-3)]

              text-[var(--text)]

            "

          >

            Cancelar

          </button>

          <button

            type="submit"

            className="

              px-8

              py-3

              rounded-2xl

              bg-emerald-600

              text-[var(--text)]

              font-bold

            "

          >

            {

              perfil

                ? "Salvar Alterações"

                : "Cadastrar"

            }

          </button>

        </div>

      </form>

    </Modal>

  );

}
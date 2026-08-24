"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import {
  createPortal,
} from "react-dom";

export default function ActionMenu({
  open,
  position,
  onClose,
  children,
}) {
  const menuRef = useRef(null);

  // `position` vem calculado pelo caller a partir do botão (bottom + 8),
  // sem levar em conta se isso estoura o fim da tela -- linhas perto do
  // rodapé (última linha de uma tabela, por exemplo) abriam o menu cortado,
  // sem como rolar até "Excluir". Depois de montado, mede a altura real do
  // menu e reposiciona pra sempre caber inteiro na viewport.
  const [posAjustada, setPosAjustada] = useState(position);

  useLayoutEffect(() => {

    if (!open) return;

    setPosAjustada(position);

    const frame = requestAnimationFrame(() => {

      const el = menuRef.current;
      if (!el) return;

      const margem = 12;
      const altura = el.offsetHeight;
      const largura = el.offsetWidth;

      let top = position.top;
      let left = position.left;

      if (top + altura > window.innerHeight - margem) {
        // não cabe abaixo do botão -- sobe o suficiente pra caber,
        // sem passar do topo da tela.
        top = Math.max(margem, window.innerHeight - altura - margem);
      }

      if (left + largura > window.innerWidth - margem) {
        left = Math.max(margem, window.innerWidth - largura - margem);
      }

      if (top !== position.top || left !== position.left) {
        setPosAjustada({ top, left });
      }

    });

    return () => cancelAnimationFrame(frame);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, position.top, position.left]);

  useEffect(() => {

    if (!open) return;

    function handleClickOutside(e) {

      if (
        menuRef.current &&
        !menuRef.current.contains(e.target)
      ) {
        onClose?.();
      }

    }

    function handleEscape(e) {

      if (e.key === "Escape") {
        onClose?.();
      }

    }

    window.addEventListener(
      "mousedown",
      handleClickOutside
    );

    window.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {

      window.removeEventListener(
        "mousedown",
        handleClickOutside
      );

      window.removeEventListener(
        "keydown",
        handleEscape
      );

    };

  }, [open, onClose]);

  if (
    !open ||
    typeof window === "undefined"
  ) {
    return null;
  }

  return createPortal(

    <div
      ref={menuRef}
      onClick={(e) => e.stopPropagation()}
      style={{
        position: "fixed",
        top: `${posAjustada.top}px`,
        left: `${posAjustada.left}px`,
        maxHeight: `calc(100vh - 24px)`,
        overflowY: "auto",
        zIndex: 9999999,
        }}
      className="
        w-56

        rounded-2xl

        border
        border-[var(--border-token)]

        bg-[#1a242c]/98

        backdrop-blur-2xl

        shadow-2xl
        shadow-black/60

        overflow-hidden

        animate-in
        fade-in
        zoom-in-95

        duration-150
      "
    >

      {children}

    </div>,

    document.body

  );

}
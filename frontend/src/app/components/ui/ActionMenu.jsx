"use client";

import {
  useEffect,
  useRef,
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
      style={{
        position: "fixed",
        top: `${position.top}px`,
        left: `${position.left}px`,
        zIndex: 9999999,
        }}
      className="
        w-56

        rounded-2xl

        border
        border-white/10

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
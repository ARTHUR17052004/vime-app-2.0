"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export default function Modal({
  open,

  onClose,

  children,

  title,

  subtitle,

  footer,

  size = "lg",

  showCloseButton = true,

  closeOnOverlay = true,

  closeOnEsc = true,

  scrollable = true,

  persistent = false,
}) {
  useEffect(() => {
    if (!closeOnEsc) return;

    function handleKey(e) {
      if (e.key === "Escape") {
        onClose?.();
      }
    }

    if (open) {
      document.addEventListener(
        "keydown",
        handleKey
      );
    }

    return () => {
      document.removeEventListener(
        "keydown",
        handleKey
      );
    };
  }, [open, onClose, closeOnEsc]);

  if (!open || typeof window === "undefined") return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
    full: "max-w-[95vw]",
  };

  return createPortal(
    <div
      onClick={
        !persistent && closeOnOverlay
          ? onClose
          : undefined
      }
      className="
        fixed
        inset-0

        z-[999]

        flex
        items-center
        justify-center

        bg-black/60

        backdrop-blur-md

        p-8

        animate-in
        fade-in
        duration-300
      "
    >
      <div
        onClick={(e) =>
          e.stopPropagation()
        }
        className={`
          relative

          w-full

          ${sizes[size]}

          max-h-[92vh]

          overflow-hidden

          rounded-[26px]

          border
          border-white/5

          bg-gradient-to-br
          from-[#1b2728]/90
          via-[#1a242c]/88
          to-[#151d26]/90

          backdrop-blur-3xl

          shadow-[0_30px_80px_rgba(0,0,0,.45)]

          animate-in
          zoom-in-95
          fade-in
          duration-300
        `}
      >
        {(title || subtitle || showCloseButton) && (
          <div
            className="
              flex
              items-start
              justify-between

              border-b
              border-white/5

              px-8
              py-6
            "
          >
            <div>

              {title && (
                <h2
                  className="
                    text-3xl
                    font-bold
                    text-white
                  "
                >
                  {title}
                </h2>
              )}

              {subtitle && (
                <p
                  className="
                    mt-2
                    text-sm
                    text-gray-400
                  "
                >
                  {subtitle}
                </p>
              )}

            </div>

            {showCloseButton && (
              <button
                onClick={onClose}
                className="
                  flex
                  items-center
                  justify-center

                  w-11
                  h-11

                  rounded-xl

                  bg-white/5

                  border
                  border-white/5

                  text-gray-400

                  transition-all
                  duration-300

                  hover:bg-red-500/15
                  hover:border-red-500/20
                  hover:text-red-400
                "
              >
                <X size={20} />
              </button>
            )}

          </div>
        )}

        <div
          className={`
            p-8

            ${
              scrollable
                ? "overflow-y-auto max-h-[calc(92vh-105px)]"
                : ""
            }
          `}
        >
          {children}
        </div>

        {footer && (
          <div
            className="
              border-t
              border-white/5

              px-8
              py-5
            "
          >
            {footer}
          </div>
        )}

      </div>
    </div>,
    document.body
  );
}
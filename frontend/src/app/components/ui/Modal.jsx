"use client";

import { useEffect } from "react";

export default function Modal({
  open,
  onClose,
  children,
  title,
  subtitle,
  size = "lg",
  closeOnOverlay = true,
}) {
  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") {
        onClose?.();
      }
    }

    if (open) {
      document.addEventListener("keydown", handleKey);
    }

    return () => {
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
    full: "max-w-[95vw]",
  };

  return (
    <div
      onClick={closeOnOverlay ? onClose : undefined}
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/50
        backdrop-blur-sm
        p-6
      "
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`
          glass
          rounded-2xl
          shadow-2xl
          w-full
          ${sizes[size]}
          max-h-[90vh]
          flex
          flex-col
          animate-in
          fade-in
          zoom-in
        `}
      >
        {(title || subtitle) && (
          <div className="border-b border-white/10 px-6 py-5">

            <div className="flex justify-between items-start">

              <div>

                {title && (
                  <h2 className="text-2xl font-bold text-white">
                    {title}
                  </h2>
                )}

                {subtitle && (
                  <p className="text-gray-300 mt-1">
                    {subtitle}
                  </p>
                )}

              </div>

              <button
                onClick={onClose}
                className="
                  text-gray-300
                  hover:text-white
                  text-2xl
                "
              >
                ×
              </button>

            </div>

          </div>
        )}

        <div
          className="
            overflow-y-auto
            p-6
            flex-1
          "
        >
          {children}
        </div>

      </div>
    </div>
  );
}
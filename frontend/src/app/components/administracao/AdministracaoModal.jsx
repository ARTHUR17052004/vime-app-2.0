"use client";

import Modal from "../ui/Modal";

export default function AdministracaoModal({

  isOpen,

  onClose,

  title,

  subtitle,

  children,

  maxWidth = "max-w-4xl",

}) {

  return (

    <Modal

      isOpen={isOpen}

      onClose={onClose}

      maxWidth={maxWidth}

    >

      <div className="space-y-8">

        {(title || subtitle) && (

          <div>

            {title && (

              <h2
                className="
                  text-3xl
                  font-black
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
                  text-gray-400
                "
              >

                {subtitle}

              </p>

            )}

          </div>

        )}

        {children}

      </div>

    </Modal>

  );

}
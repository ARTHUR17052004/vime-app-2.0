"use client";

import { MessageCircle } from "lucide-react";

export default function WhatsappHeader() {

  return (

    <div className="mb-8">

      <div className="flex items-center justify-between">

        <div>

          <h1 className="flex items-center gap-3 text-4xl font-black text-white">

            <MessageCircle
              size={38}
              className="text-green-500"
            />

            WhatsApp IA

          </h1>

          <p className="mt-2 text-gray-400">

            Central de atendimento, automações e integração com WhatsApp.

          </p>

        </div>

      </div>

    </div>

  );

}
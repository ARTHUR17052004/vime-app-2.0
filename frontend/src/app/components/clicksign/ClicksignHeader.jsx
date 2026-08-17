"use client";

import { FileSignature } from "lucide-react";

export default function ClicksignHeader() {
    return (
        <div className="flex items-center justify-between">

            <div className="flex items-center gap-4">

                <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">

                    <FileSignature
                        size={34}
                        className="text-emerald-400"
                    />

                </div>

                <div>

                    <h1 className="text-4xl font-bold text-[var(--text)]">
                        Clicksign
                    </h1>

                    <p className="text-slate-400">
                        Gerencie integrações, assinaturas digitais e documentos eletrônicos.
                    </p>

                </div>

            </div>

        </div>
    );
}
"use client";

import { X } from "lucide-react";

export type StatusNumero = "disponivel" | "selecionado" | "vendido";

interface Props {
  numero: number;
  status: StatusNumero;
  onClick: () => void;
}

export default function NumeroRifa({ numero, status, onClick }: Props) {
  const styles = {
    
    disponivel: "bg-[#121214] text-[#8257E5] border-[#8257E5]/30 hover:border-[#8257E5] hover:bg-[#8257E5]/10",
    
    
    selecionado: "bg-[#8257E5] text-white border-[#9466FF] shadow-[0_0_20px_rgba(130,87,229,0.4)] scale-105 z-10",
    
    
    vendido: "bg-[#0C0C0D] text-[#4d4d57] border-[#16161A] opacity-50 cursor-not-allowed",
  };

  return (
    <button
      onClick={onClick}
      disabled={status === "vendido"}
      className={`
        relative h-12 w-full flex items-center justify-center 
        rounded-lg border-2 font-black text-sm
        transition-all duration-300
        ${styles[status]}
      `}
    >
      {status === "vendido" ? (
        <div className="relative flex items-center justify-center">
          <span className="opacity-10">{numero.toString().padStart(2, '0')}</span>
          <X size={22} className="absolute text-[#EF4444]" strokeWidth={3} />
        </div>
      ) : (
        numero.toString().padStart(2, '0')
      )}
    </button>
  );
}
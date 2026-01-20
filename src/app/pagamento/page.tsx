"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { CheckCircle2, Clock, Copy } from "lucide-react";
export function Timer({ creatredAt }: { creatredAt: string }) {
  const [timeLeft, setTimeLeft] = useState("");
  useEffect(() => {
    const calculateTime = () => {
      const createdTime = new Date(creatredAt).getTime();
      const expirationTime = createdTime + 15 * 60 * 1000;
      const now = new Date().getTime();
      const difference = expirationTime - now;
      if (difference <= 0) {
        setTimeLeft("Expirado");
        return;
      }
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      setTimeLeft(
        `${String(minutes).padStart(10, "0")}:${String(seconds).padStart(2, "0")}`,
      );
    };
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [creatredAt]);
  return (
    <div className="text-center p-4 bg-yellow-100 rounded-lg border border-yellow-300">
      <p className="font-bold text-yellow-800">
        Tempo restante para pagamento:
      </p>
      <span className="text-2xl font-mono text-red-600">{timeLeft}</span>
    </div>
  );
}

function PagamentoContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("id");
  const qrCode = searchParams.get("code");

  const [status, setStatus] = useState("pendente");

  useEffect(() => {
    if (!paymentId) return;

    // Função para verificar o status no Supabase
    const checkStatus = async () => {
      const { data } = await supabase
        .from("rifas")
        .select("status")
        .eq("payment_id", String(paymentId))
        .single();

      if (data?.status === "approved" || data?.status === "pago") {
        setStatus("approved");
      }
    };

    checkStatus();

    // Escuta mudanças em tempo real no banco
    const channel = supabase
      .channel("check-pagamento")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "rifas",
          filter: `payment_id=eq.${paymentId}`,
        },
        (payload) => {
          if (
            payload.new.status === "approved" ||
            payload.new.status === "pago"
          ) {
            setStatus("approved");
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [paymentId]);

  // Se o pagamento for aprovado, mostra esta tela
  if (status === "approved") {
    return (
      <main className="min-h-screen bg-[#09090A] flex items-center justify-center p-4">
        <div className="bg-[#121214] p-8 rounded-2xl border border-green-500/20 text-center max-w-md w-full">
          <CheckCircle2 size={64} className="text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">
            Pagamento Confirmado!
          </h1>
          <p className="text-gray-400 mb-6">
            Seus números foram reservados com sucesso. Boa sorte!
          </p>
          <button
            onClick={() => (window.location.href = "/")}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg transition-colors"
          >
            VOLTAR PARA O INÍCIO
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#09090A] text-white p-4 flex flex-col items-center justify-center">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">
            QUASE <span className="text-[#8257E5]">LÁ!</span>
          </h1>
          <p className="text-gray-400 text-sm">
            Para garantir seus números, realize o pagamento via Pix.
          </p>
        </div>

        <div className="bg-[#121214] border border-white/5 rounded-2xl p-6 flex flex-col items-center gap-6">
          {qrCode ? (
            <div className="bg-white p-2 rounded-xl">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrCode)}&size=250x250`}
                alt="QR Code Pix"
                className="w-48 h-48"
              />
            </div>
          ) : (
            <div className="w-48 h-48 bg-white/5 animate-pulse rounded-xl flex items-center justify-center">
              <Clock className="text-gray-600" />
            </div>
          )}

          <div className="w-full space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              Copia e Cola
            </label>
            <div className="relative">
              <input
                readOnly
                value={qrCode || "Gerando código..."}
                className="w-full bg-[#09090A] border border-white/10 rounded-lg py-3 px-4 text-xs font-mono pr-12 text-gray-300"
              />
              <button
                onClick={() => {
                  if (qrCode) navigator.clipboard.writeText(qrCode);
                  alert("Código copiado!");
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8257E5] hover:text-white transition-colors"
              >
                <Copy size={20} />
              </button>
            </div>
          </div>

          <div className="w-full bg-[#17171B] border border-white/5 rounded-xl p-4 flex items-center gap-3">
            <Clock size={20} className="text-[#8257E5]" />
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Seu tempo de reserva expira em{" "}
              <span className="text-white font-bold">15:00 minutos</span>. Após
              esse tempo, os números serão liberados.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function PagamentoPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#09090A] flex items-center justify-center">
          <div className="text-[#8257E5] animate-pulse font-mono">
            CARREGANDO...
          </div>
        </div>
      }
    >
      <PagamentoContent />
    </Suspense>
  );
}

"use client";

import { styles } from "@/app/styles";
import { Copy, CheckCircle, Clock, PartyPopper } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useSearchParams } from "next/navigation";

export default function PagamentoPage() {
  const [copiado, setCopiado] = useState(false);
  const [status, setStatus] = useState("pending");
  const searchParams = useSearchParams();

  const paymentId = searchParams.get("id");
  const valorRifa = "3,50";
  const chavePix = searchParams.get("code") || "CARREGANDO...";

  useEffect(() => {
    if (!paymentId) return;

    const interval = setInterval(async () => {
      const { data, error } = await supabase
        .from("rifas")
        .select("status")
        .eq("payment_id", String(paymentId))
        .single();

      if (data?.status === "approved" || data?.status === "pago") {
        setStatus("approved");
        clearInterval(interval);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [paymentId]);

  const copiarChavePix = () => {
    navigator.clipboard.writeText(chavePix);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  if (status === "approved") {
    return (
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={`${styles.payment.card} text-center py-12`}>
            <div className="flex justify-center mb-6">
              <div className="bg-green-500/20 p-6 rounded-full">
                <PartyPopper size={64} className="text-green-500" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">
              Pagamento Confirmado!
            </h1>
            <p className="text-gray-400 mb-8">
              Seus números foram reservados com sucesso. Boa sorte na rifa!
            </p>
            <button
              onClick={() => (window.location.href = "/")}
              className="w-full bg-[#8257E5] hover:bg-[#9466FF] text-white font-bold py-4 rounded-xl transition-all"
            >
              Voltar ao Início
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <header className={styles.header.wrapper}>
          <h1 className={styles.header.title}>
            Quase <span className="text-[#8257E5]">Lá!</span>
          </h1>
          <p className={styles.header.subtitle}>
            Para garantir seus números, realize o pagamento via Pix utilizando a
            chave abaixo:
          </p>
        </header>

        <div className={styles.payment.card}>
          <div className={styles.payment.qrCodeWrapper}>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${chavePix}`}
              alt="QR Code Pix"
              className="w-48 h-48"
            />
          </div>

          <div className="mb-8">
            <span className={styles.payment.valueLabel}>Valor a pagar</span>
            <span className={styles.payment.valueText}>R$ {valorRifa}</span>
          </div>

          <div className="space-y-4 text-left">
            <p className={styles.footer.label}>Copia e Cola</p>
            <div onClick={copiarChavePix} className={styles.payment.pixBox}>
              <span
                className={styles.payment.pixText + " truncate max-w-[250px]"}
              >
                {chavePix}
              </span>
              {copiado ? (
                <CheckCircle size={20} className="text-green-500" />
              ) : (
                <Copy size={20} className="text-[#8257E5]" />
              )}
            </div>
          </div>

          <div className={styles.payment.statusBadge}>
            <Clock className="text-[#8257E5] shrink-0" size={24} />
            <p className={styles.payment.statusText}>
              Aguardando confirmação do pagamento...
            </p>
          </div>

          <button
            disabled
            className="w-full mt-8 bg-gray-700 text-gray-400 font-bold py-4 rounded-xl cursor-not-allowed uppercase tracking-widest"
          >
            Verificando Automaticamente...
          </button>
        </div>
      </div>
    </main>
  );
}

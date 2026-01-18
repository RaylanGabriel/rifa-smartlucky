"use client";

import { styles } from "@/app/styles";
import { Copy, CheckCircle, Clock } from "lucide-react";
import { useState } from "react";

export default function PagamentoPage() {
  const [copiado, setCopiado] = useState(false);

  const chavePix = "SUA_CHAVE_PIX_AQUI";
  const valorRifa = "3,50";

  const copiarChavePix = () => {
    navigator.clipboard.writeText(chavePix);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

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
              <span className={styles.payment.pixText}>{chavePix}</span>

              {copiado ? (
                <CheckCircle size={20} className="text-green-500" />
              ) : (
                <Copy
                  size={20}
                  className="text-[#8257E5] group-hover:text-[#9466FF]"
                />
              )}
            </div>
          </div>

          <div className={styles.payment.statusBadge}>
            <Clock className="text-[#8257E5] shrink-0" size={24} />
            <p className={styles.payment.statusText}>
              Seu tempo de reserva expira em{" "}
              <span className="text-white font-bold">15:00 minutos</span>. Após
              esse tempo, os números serão liberados caso o pagamento não seja
              confirmado.
            </p>
          </div>

          <button className="w-full mt-8 bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition-all uppercase tracking-widest shadow-lg shadow-green-900/20 active:scale-95">
            Já fiz o pagamento
          </button>
        </div>
      </div>
    </main>
  );
}

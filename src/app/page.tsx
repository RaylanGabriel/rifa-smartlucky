"use client";

import { useState, useEffect } from "react";
import Script from "next/script";
import NumeroRifa, { StatusNumero } from "@/components/NumeroRifa";
import { styles } from "./styles";
import { supabase } from "@/lib/supabase";
import {User, Smartphone, CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  // ===============================
  // ESTADOS PRINCIPAIS
  // ===============================
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [selecionados, setSelecionados] = useState<number[]>([]);
  const [numerosOcupados, setNumerosOcupados] = useState<number[]>([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [carregado, setCarregado] = useState(false);
  const [estaProcessando, setEstaProcessando] = useState(false);



  // ===============================
  // CONFIGURAÇÕES DA RIFA
  // ===============================
  const totalNumeros = 500;
  const numerosPorPagina = 100;
  const totalPaginas = Math.ceil(totalNumeros / numerosPorPagina);
  const LIMITE_SELECAO = 10;
  const VALOR_UNITARIO = 3.5;

  // ===============================
  // CARREGA RESERVAS ATIVAS
  // ===============================
  const carregarReservas = async () => {
    const { data } = await supabase
      .from("rifas")
      .select("id")
      .in("status", ["vendido", "pago", "em_processamento", "pendente"]);

    if (data) {
      setNumerosOcupados(data.map(item => item.id));
    }
  };

  // ===============================
  // REALTIME SUPABASE
  // ===============================
  useEffect(() => {
    carregarReservas();

    const channel = supabase
      .channel("rifas-realtime")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "rifas",
      }, carregarReservas)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ===============================
  // LOCAL STORAGE
  // ===============================
  useEffect(() => {
    const salvo = localStorage.getItem("@rifa:selecionados");
    if (salvo) setSelecionados(JSON.parse(salvo));
    setCarregado(true);
  }, []);

  useEffect(() => {
    if (carregado) {
      localStorage.setItem("@rifa:selecionados", JSON.stringify(selecionados));
    }
  }, [selecionados, carregado]);

  // ===============================
  // INICIALIZA MERCADO PAGO (DEVICE ID)
  // ===============================
  useEffect(() => {
  if (typeof window !== "undefined" && window.MercadoPago) {
    new window.MercadoPago(
      process.env.NEXT_PUBLIC_MP_PUBLIC_KEY!,
      { locale: "pt-BR" }
    );
  }
}, []);

  // ===============================
  // CONTROLE DE SELEÇÃO
  // ===============================
  const gerenciarSelecao = (num: number) => {
    if (numerosOcupados.includes(num)) return;

    if (selecionados.includes(num)) {
      setSelecionados(prev => prev.filter(n => n !== num));
    } else {
      if (selecionados.length >= LIMITE_SELECAO) {
        alert(`Limite de ${LIMITE_SELECAO} números atingido.`);
        return;
      }
      setSelecionados(prev => [...prev, num]);
    }
  };

  // ===============================
  // FINALIZA PAGAMENTO (PIX)
  // ===============================
  const handleFinalizar = async () => {
    setEstaProcessando(true);

    try {
      const valorTotal = selecionados.length * VALOR_UNITARIO;

      // Cria pagamento no backend
      const res = await fetch("/api/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, telefone, numeros: selecionados, valorTotal }),
      });

      const checkout = await res.json();
      if (!checkout.id) throw new Error("Erro ao gerar pagamento.");

      // Salva reservas
      const dados = selecionados.map(num => ({
        id: num,
        status: "pendente",
        nome,
        telefone,
        payment_id: String(checkout.id),
      }));

      const { error } = await supabase.from("rifas").upsert(dados);
      if (error) throw error;

      localStorage.removeItem("@rifa:selecionados");
      setSelecionados([]);

      router.push(`/pagamento?id=${checkout.id}&code=${encodeURIComponent(checkout.qr_code)}`);
    } catch (err) {
      alert("Erro ao processar pagamento.");
    } finally {
      setEstaProcessando(false);
    }
  };

  // ===============================
  // NUMEROS DA PÁGINA
  // ===============================
  const numerosDaPagina = Array.from(
    { length: numerosPorPagina },
    (_, i) => (paginaAtual - 1) * numerosPorPagina + i + 1
  );

  return (
    <>
      {/* SDK MERCADO PAGO (OBRIGATÓRIO) */}
      <Script
        src="https://sdk.mercadopago.com/js/v2"
        strategy="afterInteractive"
      />

      <main className={`${styles.main} min-h-screen pb-20`}>
        <div className={styles.container}>

          {/* HEADER */}
          <header className={styles.header.wrapper}>
            <h1 className={styles.header.title}>
              <span className="text-[#8257E5]">Smart</span>Lucky
            </h1>
            <p className={styles.header.subtitle}>
              Escolha até {LIMITE_SELECAO} números
            </p>
          </header>

          {/* PAGINAÇÃO */}
          <nav className={styles.pagination.wrapper}>
            <button onClick={() => setPaginaAtual(p => Math.max(p - 1, 1))}>Anterior</button>
            <span>Página {paginaAtual} de {totalPaginas}</span>
            <button onClick={() => setPaginaAtual(p => Math.min(p + 1, totalPaginas))}>Próxima</button>
          </nav>

          {/* GRID */}
          <section className={styles.grid}>
            {numerosDaPagina.map(n => {
              let status: StatusNumero = "disponivel";
              if (numerosOcupados.includes(n)) status = "vendido";
              else if (selecionados.includes(n)) status = "selecionado";

              return (
                <NumeroRifa
                  key={n}
                  numero={n}
                  status={status}
                  onClick={() => gerenciarSelecao(n)}
                />
              );
            })}
          </section>

          {/* FORMULÁRIO */}
         <footer className={styles.footer.wrapper}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-1">
              <label className={styles.footer.label}>NOME</label>
              <div className={styles.footer.inputWrapper}>
                <User className={styles.footer.inputIcon} />
                <input
                  type="text"
                  className={`${styles.footer.input} ${styles.footer.inputWithIcon}`}
                  value={nome}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, "");
                    setNome(value);
                  }}
                  placeholder="Seu nome completo"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className={styles.footer.label}>TELEFONE</label>
              <div className={styles.footer.inputWrapper}>
                <Smartphone className={styles.footer.inputIcon} />
                <input
                  type="tel"
                  className={`${styles.footer.input} ${styles.footer.inputWithIcon}`}
                  value={telefone}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, "");
                    if (value.length > 11) value = value.slice(0, 11);
                    value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
                    value = value.replace(/(\d{5})(\d)/, "$1-$2");
                    setTelefone(value);
                  }}
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-6 border-t border-white/5">
            <div>
              <p className="text-[12px] font-black text-[#8257E5] uppercase tracking-widest">
                Total da Reserva
              </p>
              <p className="text-3xl font-black text-white font-mono">
                R$ {(selecionados.length * VALOR_UNITARIO).toFixed(2).replace(".", ",")}
              </p>
            </div>

            <button
              className={styles.footer.btnFinalizar}
              disabled={!nome || !telefone || selecionados.length === 0 || estaProcessando}
              onClick={handleFinalizar}
            >
              <CreditCard size={22} className="text-white" />
              {estaProcessando ? "PROCESSANDO..." : "PAGAR COM PIX"}
            </button>
          </div>
        </footer>
      </div>
    </main>
    </>
  );
}
"use client";

import { useState, useEffect } from "react";
import NumeroRifa, { StatusNumero } from "@/components/NumeroRifa";
import { styles } from "./styles";
import { supabase } from "@/lib/supabase";
import { User, Smartphone, CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [selecionados, setSelecionados] = useState<number[]>([]);
  const [carregado, setCarregado] = useState(false);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [numerosOcupados, setNumerosOcupados] = useState<number[]>([]);
  const [estaProcessando, setEstaProcessando] = useState(false);

  const carregarReservas = async () => {
    const { data, error } = await supabase
      .from("rifas")
      .select("id")
      .in("status", ["vendido", "pago"]);
    if (data) {
      setNumerosOcupados(data.map((item) => item.id));
    }
  };

  useEffect(() => {
    carregarReservas();
    const channel = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rifas" },
        () => {
          carregarReservas();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const totalNumeros = 500;
  const numerosPorPagina = 100;
  const totalPaginas = Math.ceil(totalNumeros / numerosPorPagina);
  const LIMITE_SELECAO = 10;
  const VALOR_UNITARIO = 3.5; 

  const numerosDaPagina = Array.from(
    { length: numerosPorPagina },
    (_, i) => (paginaAtual - 1) * numerosPorPagina + i + 1,
  );

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

  const gerenciarSelecao = (num: number) => {
    if (numerosOcupados.includes(num)) return;

    if (selecionados.includes(num)) {
      setSelecionados((prev) => prev.filter((item) => item !== num));
    } else {
      if (selecionados.length >= LIMITE_SELECAO) {
        alert(`Limite de ${LIMITE_SELECAO} números atingido!`);
        return;
      }
      setSelecionados((prev) => [...prev, num]);
    }
  };

  const handleFinalizar = async () => {
    setEstaProcessando(true);

    try {
      const valorTotal = selecionados.length * VALOR_UNITARIO;

      const res = await fetch("/api/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          numeros: selecionados,
          valorTotal: valorTotal,
        }),
      });

      const checkout = await res.json();

      if (!checkout.id) {
        throw new Error("Erro ao gerar o PIX. Tente novamente.");
      }

    
      const dadosParaSalvar = selecionados.map((num) => ({
        id: num,
        status: "pendente",
        nome: nome,
        whatsapp: whatsapp,
        payment_id: String(checkout.id),
      }));

      const { error } = await supabase.from("rifas").upsert(dadosParaSalvar);

      if (error) throw error;

      localStorage.setItem(
        "dadosPagamento",
        JSON.stringify({
          ...checkout,
          valorTotal: valorTotal,
          numeros: selecionados,
        }),
      );

      setSelecionados([]);
      localStorage.removeItem("@rifa:selecionados");

      router.push("/pagamento");
    } catch (error: any) {
      alert("Erro: " + error.message);
    } finally {
      setEstaProcessando(false);
    }
  };

  return (
    <main className={`${styles.main} overflow-x-hidden relative min-h-screen`}>
      <div className="absolute top-[-10%] left-[-10%] w-125 h-125 bg-[#8257E5] opacity-[0.15] blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[0%] right-[-10%] w-100 h-100 bg-[#4A90E2] opacity-[0.1] blur-[100px] rounded-full pointer-events-none"></div>

      <div className={`${styles.container} relative z-10`}>
        <header className={styles.header.wrapper}>
          <h1 className={styles.header.title}>
            <span className="text-[#8257E5] font-mono">Smart</span>
            <span className="text-white font-mono">Lucky</span>
          </h1>
          <p className={styles.header.subtitle}>
            Sua sorte começa aqui! Escolha até {LIMITE_SELECAO} números.
          </p>
        </header>

        <nav className={styles.pagination.wrapper}>
          <button
            className={`${styles.pagination.btn} ${styles.pagination.btnClaro}`}
            onClick={() => setPaginaAtual((p) => Math.max(p - 1, 1))}
            disabled={paginaAtual === 1}
          >
            Anterior
          </button>
          <span className="text-sm font-bold text-gray-400">
            Página {paginaAtual} de {totalPaginas}
          </span>
          <button
            className={`${styles.pagination.btn} ${styles.pagination.btnAzul}`}
            onClick={() => setPaginaAtual((p) => Math.min(p + 1, totalPaginas))}
            disabled={paginaAtual === totalPaginas}
          >
            Próxima
          </button>
        </nav>

        <section
          className={`${styles.grid} ${carregado ? "opacity-100" : "opacity-0"}`}
        >
          {numerosDaPagina.map((n) => {
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
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Seu nome completo"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className={styles.footer.label}>WHATSAPP</label>
              <div className={styles.footer.inputWrapper}>
                <Smartphone className={styles.footer.inputIcon} />
                <input
                  type="tel"
                  className={`${styles.footer.input} ${styles.footer.inputWithIcon}`}
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
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
                R${" "}
                {(selecionados.length * VALOR_UNITARIO)
                  .toFixed(2)
                  .replace(".", ",")}
              </p>
            </div>

            <button
              className={styles.footer.btnFinalizar}
              disabled={
                !nome ||
                !whatsapp ||
                selecionados.length === 0 ||
                estaProcessando
              }
              onClick={handleFinalizar}
            >
              <CreditCard size={22} className="text-white" />
              {estaProcessando ? "PROCESSANDO..." : "PAGAR COM PIX"}
            </button>
          </div>
        </footer>
      </div>
    </main>
  );
}

"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { styles } from "@/app/styles";
import { Trash2, ExternalLink, LogOut } from "lucide-react";

interface Venda {
  id: string;
  numero: number;
  nome: string;
  whatsapp: string;
}

export default function AdminPage() {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const router = useRouter();

  useEffect(() => {
    const isLogged = localStorage.getItem("smartlucky_admin");
    if (!isLogged) {
      router.push("/admin/login");
      return;
    }
    buscarVendas();
  }, [router]);

  async function buscarVendas() {
    try {
      const { data, error } = await supabase
        .from("rifas")
        .select("*")
        .order("id", { ascending: true });

      if (error) throw error;
      if (data) setVendas(data as Venda[]);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    }
  }

  async function excluirVenda(id: string) {
    if (confirm("Tem certeza que deseja excluir esta reserva e liberar o número?")) {
      const { error } = await supabase.from("rifas").delete().eq("id", id);
      if (!error) {
        setVendas(vendas.filter(v => v.id !== id));
      } else {
        alert("Erro ao excluir!");
      }
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("smartlucky_admin");
    router.push("/admin/login");
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <header className={`${styles.header.wrapper} flex justify-between items-center`}>
          <div>
            <h1 className={styles.header.title}>Painel <span className="text-[#8257E5]">Admin</span></h1>
            <p className={styles.header.subtitle}>Gerencie as reservas da SmartLucky</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-all font-bold uppercase"
          >
            <LogOut size={16} /> Sair
          </button>
        </header>

        <div className="bg-[#121214] border border-[#29292E] rounded-xl overflow-hidden shadow-2xl">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#09090A] text-[#8257E5] uppercase text-[10px] font-black tracking-widest border-b border-[#29292E]">
              <tr>
                <th className="p-4">Nº</th>
                <th className="p-4">Cliente</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#29292E]">
              {vendas.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-10 text-center text-gray-500 italic">Nenhuma reserva encontrada.</td>
                </tr>
              ) : (
                vendas.map((venda) => (
                  <tr key={venda.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-black text-[#8257E5] text-lg">
                      #{String(venda.id).padStart(2, '0')}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-white uppercase">{venda.nome}</div>
                      <div className="text-gray-500 text-xs">{venda.whatsapp}</div>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <a
                        href={`https://wa.me/55${venda.whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        className="inline-block p-2 text-green-500 hover:bg-green-500/10 rounded-lg transition-all"
                        title="Enviar Mensagem"
                      >
                        <ExternalLink size={18} />
                      </a>
                      
                      <button
                        onClick={() => excluirVenda(venda.id)}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                        title="Excluir Reserva"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
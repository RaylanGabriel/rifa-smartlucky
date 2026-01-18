"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { styles } from "@/app/styles";
import { Lock, User } from "lucide-react";

export default function LoginPage() {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (usuario === "process.env.ADM_USUARIO" && senha === "process.env.ADM_SENHA") {
      localStorage.setItem("smartlucky_admin", "true");
      router.push("/admin");
    } else {
      alert("Credenciais inválidas!");
    }
  };

  return (
    <main className={`${styles.main} flex items-center justify-center`}>
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-100 h-100 bg-[#8257E5] opacity-20 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-[#121214] border border-[#29292E] p-8 rounded-2xl shadow-2xl">
          <header className="mb-8 text-center">
            <h1 className="text-3xl font-black text-white uppercase">
              Smart<span className="text-[#8257E5]">Admin</span>
            </h1>
            <p className="text-[#A8A8B3] text-sm mt-2 font-medium">Faça login para gerir as rifas</p>
          </header>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className={styles.footer.inputWrapper}>
              <User className={styles.footer.inputIcon} />
              <input
                type="text"
                placeholder="Utilizador"
                className={`${styles.footer.input} pl-12`}
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
              />
            </div>

            <div className={styles.footer.inputWrapper}>
              <Lock className={styles.footer.inputIcon} />
              <input
                type="password"
                placeholder="Senha"
                className={`${styles.footer.input} pl-12`}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
            </div>

            <button type="submit" className={styles.footer.btnFinalizar}>
              Acessar Painel
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
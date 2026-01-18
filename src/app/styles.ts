export const styles = {
  main: "min-h-screen bg-[#0C0C0D] py-12 px-4 text-[#E1E1E6] relative",
  container: "max-w-2xl mx-auto",

  header: {
    wrapper: "mb-10 text-center sm:text-left border-l-4 border-[#8257E5] pl-6",
    title: "text-4xl font-black tracking-tight text-white uppercase",
    subtitle: "text-[#A8A8B3] text-sm mt-2 font-mono",
  },

  pagination: {
    wrapper:
      "bg-[#121214]/80 backdrop-blur-md p-3 rounded-xl mb-8 flex justify-between items-center border border-white/5 shadow-2xl",
    btn: "px-5 py-2 rounded-lg font-bold transition-all disabled:opacity-20",
    btnAzul:
      "bg-[#8257E5] text-white hover:bg-[#9466FF] shadow-[0_0_20px_rgba(130,87,229,0.3)]",
    btnClaro: "bg-[#29292E] text-[#E1E1E6] hover:bg-[#323238]",
  },

  grid: "bg-[#121214] p-6 rounded-2xl shadow-2xl grid grid-cols-5 sm:grid-cols-10 gap-3 border border-[#29292E] transition-opacity duration-500",

  footer: {
    wrapper:
      "mt-8 bg-[#121214]/90 backdrop-blur-xl p-8 rounded-2xl border border-white/5 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]",
    label:
      "text-[10px] font-black text-[#8257E5] uppercase tracking-[3px] mb-3 block",
    inputWrapper: "relative flex items-center group",
    inputIcon:
      "absolute left-4 text-[#8257E5] w-5 h-5 transition-colors group-focus-within:text-[#9466FF]",
    input:
      "w-full bg-[#09090A] border border-[#29292E] rounded-xl py-4 px-4 focus:outline-none focus:border-[#8257E5] text-[#E1E1E6] placeholder:text-[#4d4d57] transition-all",
    inputWithIcon: "pl-12",
    btnFinalizar:
      "w-full flex items-center justify-center gap-3 bg-gradient-to-r from-[#8257E5] to-[#9466FF] hover:brightness-110 text-white font-bold py-5 px-10 rounded-xl shadow-lg shadow-[#8257E5]/20 transition-all transform active:scale-95 disabled:bg-[#29292E] disabled:bg-none disabled:text-[#4d4d57]",
      
  },
  payment: {
    card: "bg-[#121214] border border-[#29292E] p-8 rounded-2xl shadow-2xl text-center mb-6",
    qrCodeWrapper: "bg-white p-4 rounded-xl inline-block mb-6 shadow-[0_0_25px_rgba(130,87,229,0.2)]",
    valueLabel: "text-[#A8A8B3] text-[10px] font-black uppercase tracking-widest mb-1 block",
    valueText: "text-4xl font-black text-white block mb-8",
    pixBox: "flex items-center justify-between bg-[#09090A] border border-[#29292E] p-4 rounded-xl cursor-pointer hover:border-[#8257E5] transition-all group",
    pixText: "text-[#E1E1E6] font-mono text-sm truncate mr-4",
    statusBadge: "mt-8 p-4 bg-[#8257E5]/5 border border-[#8257E5]/20 rounded-xl flex items-center gap-4 text-left",
    statusText: "text-xs text-[#A8A8B3] leading-relaxed",
  }
};

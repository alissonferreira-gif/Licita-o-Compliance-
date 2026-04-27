export interface NCMCategory {
  label: string;
  color: string;
  lei: string;
  pisCofinsNote: string;
}

export const NCM_CATEGORIES: Record<string, NCMCategory> = {
  "2710": { label: "Combustíveis", color: "text-orange-400", lei: "Lei 9.718/98", pisCofinsNote: "Regime monofásico — tributação concentrada no produtor/importador" },
  "2711": { label: "Gás Natural", color: "text-orange-400", lei: "Lei 9.718/98", pisCofinsNote: "Regime monofásico" },
  "3001": { label: "Farmacêuticos", color: "text-blue-400", lei: "Lei 10.147/00", pisCofinsNote: "Alíquota zero na revenda" },
  "3002": { label: "Farmacêuticos", color: "text-blue-400", lei: "Lei 10.147/00", pisCofinsNote: "Alíquota zero na revenda" },
  "3003": { label: "Medicamentos", color: "text-blue-400", lei: "Lei 10.147/00", pisCofinsNote: "Alíquota zero na revenda" },
  "3004": { label: "Medicamentos", color: "text-blue-400", lei: "Lei 10.147/00", pisCofinsNote: "Alíquota zero na revenda" },
  "3301": { label: "Perfumaria", color: "text-purple-400", lei: "Lei 10.147/00", pisCofinsNote: "Substituição tributária" },
  "3302": { label: "Perfumaria", color: "text-purple-400", lei: "Lei 10.147/00", pisCofinsNote: "Substituição tributária" },
  "3303": { label: "Perfumaria", color: "text-purple-400", lei: "Lei 10.147/00", pisCofinsNote: "Substituição tributária" },
  "3304": { label: "Cosméticos", color: "text-purple-400", lei: "Lei 10.147/00", pisCofinsNote: "Substituição tributária" },
  "2201": { label: "Águas Minerais", color: "text-cyan-400", lei: "Lei 10.833/03", pisCofinsNote: "Tributação monofásica sobre bebidas" },
  "2202": { label: "Bebidas", color: "text-cyan-400", lei: "Lei 10.833/03", pisCofinsNote: "Tributação monofásica" },
  "2203": { label: "Cerveja", color: "text-yellow-400", lei: "Lei 10.833/03", pisCofinsNote: "Tributação monofásica — alíquota concentrada" },
  "2204": { label: "Vinhos", color: "text-red-400", lei: "Lei 10.833/03", pisCofinsNote: "Tributação monofásica" },
  "2205": { label: "Vermutes", color: "text-red-400", lei: "Lei 10.833/03", pisCofinsNote: "Tributação monofásica" },
  "2206": { label: "Bebidas Fermentadas", color: "text-red-400", lei: "Lei 10.833/03", pisCofinsNote: "Tributação monofásica" },
  "2207": { label: "Álcool Etílico", color: "text-amber-400", lei: "Lei 10.833/03", pisCofinsNote: "Tributação monofásica" },
  "2208": { label: "Destilados", color: "text-amber-400", lei: "Lei 10.833/03", pisCofinsNote: "Tributação monofásica" },
  "4011": { label: "Pneus Novos", color: "text-zinc-300", lei: "Lei 10.485/02", pisCofinsNote: "Substituição tributária autopeças" },
  "4013": { label: "Câmaras de Ar", color: "text-zinc-300", lei: "Lei 10.485/02", pisCofinsNote: "Substituição tributária autopeças" },
  "7009": { label: "Espelhos p/ Veículos", color: "text-zinc-400", lei: "Lei 10.485/02", pisCofinsNote: "Substituição tributária autopeças" },
  "7011": { label: "Vidros p/ Veículos", color: "text-zinc-400", lei: "Lei 10.485/02", pisCofinsNote: "Substituição tributária autopeças" },
  "8407": { label: "Motores", color: "text-zinc-300", lei: "Lei 10.485/02", pisCofinsNote: "Substituição tributária autopeças" },
  "8408": { label: "Motores Diesel", color: "text-zinc-300", lei: "Lei 10.485/02", pisCofinsNote: "Substituição tributária autopeças" },
  "8409": { label: "Partes de Motores", color: "text-zinc-400", lei: "Lei 10.485/02", pisCofinsNote: "Substituição tributária autopeças" },
  "8413": { label: "Bombas de Combustível", color: "text-zinc-400", lei: "Lei 10.485/02", pisCofinsNote: "Substituição tributária autopeças" },
  "8421": { label: "Filtros", color: "text-zinc-400", lei: "Lei 10.485/02", pisCofinsNote: "Substituição tributária autopeças" },
  "8481": { label: "Válvulas", color: "text-zinc-400", lei: "Lei 10.485/02", pisCofinsNote: "Substituição tributária autopeças" },
  "8482": { label: "Rolamentos", color: "text-zinc-400", lei: "Lei 10.485/02", pisCofinsNote: "Substituição tributária autopeças" },
  "8483": { label: "Transmissões", color: "text-zinc-400", lei: "Lei 10.485/02", pisCofinsNote: "Substituição tributária autopeças" },
  "8511": { label: "Ignição Elétrica", color: "text-zinc-400", lei: "Lei 10.485/02", pisCofinsNote: "Substituição tributária autopeças" },
  "8512": { label: "Iluminação Veicular", color: "text-zinc-400", lei: "Lei 10.485/02", pisCofinsNote: "Substituição tributária autopeças" },
  "8544": { label: "Fios e Cabos", color: "text-zinc-400", lei: "Lei 10.485/02", pisCofinsNote: "Substituição tributária autopeças" },
  "8708": { label: "Autopeças", color: "text-zinc-300", lei: "Lei 10.485/02", pisCofinsNote: "Substituição tributária — principal categoria" },
};

export function getNCMCategory(ncm: string): NCMCategory | null {
  const clean = ncm.replace(/\D/g, "").substring(0, 4);
  return NCM_CATEGORIES[clean] || null;
}

export function isMonophasicNCM(ncm: string): boolean {
  const clean = ncm.replace(/\D/g, "");
  return Object.keys(NCM_CATEGORIES).some((prefix) =>
    clean.startsWith(prefix)
  );
}

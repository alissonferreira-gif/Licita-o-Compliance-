/**
 * Fallback TypeScript — mesma lógica do processor.cpp.
 * Usado enquanto o WASM não está compilado.
 * Para compilar o WASM: cd wasm-src && ./build.sh (requer Emscripten)
 */

import type { NFeAnalysisResult, NFeItemResult } from "./types";

const NCM_MONOFASICO: Record<string, { categoria: string; lei: string }> = {
  "2710": { categoria: "Combustíveis", lei: "Lei 9.718/98" },
  "2711": { categoria: "Gás Natural", lei: "Lei 9.718/98" },
  "2712": { categoria: "Ceras Minerais", lei: "Lei 9.718/98" },
  "3001": { categoria: "Farmacêuticos", lei: "Lei 10.147/00" },
  "3002": { categoria: "Farmacêuticos", lei: "Lei 10.147/00" },
  "3003": { categoria: "Medicamentos", lei: "Lei 10.147/00" },
  "3004": { categoria: "Medicamentos", lei: "Lei 10.147/00" },
  "3301": { categoria: "Perfumaria", lei: "Lei 10.147/00" },
  "3302": { categoria: "Perfumaria", lei: "Lei 10.147/00" },
  "3303": { categoria: "Perfumes", lei: "Lei 10.147/00" },
  "3304": { categoria: "Cosméticos", lei: "Lei 10.147/00" },
  "3305": { categoria: "Xampus", lei: "Lei 10.147/00" },
  "3306": { categoria: "Higiene Bucal", lei: "Lei 10.147/00" },
  "3307": { categoria: "Higiene Pessoal", lei: "Lei 10.147/00" },
  "2201": { categoria: "Águas Minerais", lei: "Lei 10.833/03" },
  "2202": { categoria: "Bebidas Não-alcoólicas", lei: "Lei 10.833/03" },
  "2203": { categoria: "Cervejas", lei: "Lei 10.833/03" },
  "2204": { categoria: "Vinhos", lei: "Lei 10.833/03" },
  "2205": { categoria: "Vermutes", lei: "Lei 10.833/03" },
  "2206": { categoria: "Bebidas Fermentadas", lei: "Lei 10.833/03" },
  "2207": { categoria: "Álcool Etílico", lei: "Lei 10.833/03" },
  "2208": { categoria: "Destilados", lei: "Lei 10.833/03" },
  "4011": { categoria: "Pneus Novos", lei: "Lei 10.485/02" },
  "4013": { categoria: "Câmaras de Ar", lei: "Lei 10.485/02" },
  "7009": { categoria: "Espelhos Veiculares", lei: "Lei 10.485/02" },
  "7011": { categoria: "Vidros Veiculares", lei: "Lei 10.485/02" },
  "8407": { categoria: "Motores", lei: "Lei 10.485/02" },
  "8408": { categoria: "Motores Diesel", lei: "Lei 10.485/02" },
  "8409": { categoria: "Partes de Motores", lei: "Lei 10.485/02" },
  "8413": { categoria: "Bombas Combustível", lei: "Lei 10.485/02" },
  "8421": { categoria: "Filtros", lei: "Lei 10.485/02" },
  "8481": { categoria: "Válvulas", lei: "Lei 10.485/02" },
  "8482": { categoria: "Rolamentos", lei: "Lei 10.485/02" },
  "8483": { categoria: "Transmissões", lei: "Lei 10.485/02" },
  "8511": { categoria: "Ignição Elétrica", lei: "Lei 10.485/02" },
  "8512": { categoria: "Iluminação Veicular", lei: "Lei 10.485/02" },
  "8544": { categoria: "Fios e Cabos", lei: "Lei 10.485/02" },
  "8708": { categoria: "Autopeças Gerais", lei: "Lei 10.485/02" },
};

const PIS_STD = 0.0165;
const COFINS_STD = 0.076;

function cleanNCM(ncm: string): string {
  return ncm.replace(/\D/g, "");
}

export function isMonofasico(ncm: string): boolean {
  const clean = cleanNCM(ncm);
  if (clean.length < 4) return false;
  return !!NCM_MONOFASICO[clean.substring(0, 4)];
}

export function getNCMInfo(ncm: string): { monofasico: boolean; categoria?: string; lei?: string } {
  const clean = cleanNCM(ncm);
  if (clean.length < 4) return { monofasico: false };
  const rule = NCM_MONOFASICO[clean.substring(0, 4)];
  if (!rule) return { monofasico: false };
  return { monofasico: true, ...rule };
}

function extractTag(xml: string, tag: string, startPos = 0): string {
  const openTag = `<${tag}>`;
  const openTagAlt = `<${tag} `;
  const closeTag = `</${tag}>`;

  let tagEnd: number;
  const pos1 = xml.indexOf(openTag, startPos);
  const pos2 = xml.indexOf(openTagAlt, startPos);

  if (pos1 === -1 && pos2 === -1) return "";

  if (pos1 === -1 || (pos2 !== -1 && pos2 < pos1)) {
    const gtPos = xml.indexOf(">", pos2);
    if (gtPos === -1) return "";
    tagEnd = gtPos + 1;
  } else {
    tagEnd = pos1 + openTag.length;
  }

  const end = xml.indexOf(closeTag, tagEnd);
  if (end === -1) return "";
  return xml.substring(tagEnd, end);
}

function findAllBlocks(xml: string, tag: string): Array<[number, number]> {
  const blocks: Array<[number, number]> = [];
  const openTag = `<${tag}`;
  const closeTag = `</${tag}>`;
  let pos = 0;

  while (true) {
    const found = xml.indexOf(openTag, pos);
    if (found === -1) break;
    const gtPos = xml.indexOf(">", found);
    if (gtPos === -1) break;
    const end = xml.indexOf(closeTag, gtPos);
    if (end === -1) break;
    blocks.push([found, end + closeTag.length]);
    pos = end + closeTag.length;
  }
  return blocks;
}

export function analyzeNFeXML(xmlContent: string): NFeAnalysisResult {
  const result: NFeAnalysisResult = {
    cnpj_emitente: "",
    cnpj_destinatario: "",
    chave_acesso: "",
    data_emissao: "",
    numero_nfe: "",
    total_nfe: 0,
    total_recuperavel_pis: 0,
    total_recuperavel_cofins: 0,
    total_recuperavel: 0,
    itens_monofasicos: 0,
    total_itens: 0,
    status: "OK",
    itens: [],
  };

  result.chave_acesso = extractTag(xmlContent, "chNFe");
  result.numero_nfe = extractTag(xmlContent, "nNF");
  result.data_emissao = extractTag(xmlContent, "dhEmi") || extractTag(xmlContent, "dEmi");
  result.cnpj_emitente = extractTag(xmlContent, "CNPJ");
  result.total_nfe = parseFloat(extractTag(xmlContent, "vNF")) || 0;

  const destStart = xmlContent.indexOf("<dest");
  if (destStart !== -1) {
    const destEnd = xmlContent.indexOf("</dest>", destStart);
    if (destEnd !== -1) {
      result.cnpj_destinatario = extractTag(
        xmlContent.substring(destStart, destEnd),
        "CNPJ"
      );
    }
  }

  const detBlocks = findAllBlocks(xmlContent, "det");
  result.total_itens = detBlocks.length;

  if (detBlocks.length === 0) {
    result.status = "PARSE_ERROR";
    return result;
  }

  for (const [start, end] of detBlocks) {
    const det = xmlContent.substring(start, end);
    const item: NFeItemResult = {
      ncm: extractTag(det, "NCM"),
      descricao: extractTag(det, "xProd"),
      valor_produto: parseFloat(extractTag(det, "vProd")) || 0,
      pis_cobrado: 0,
      cofins_cobrado: 0,
      is_monofasico: false,
      recuperavel_pis: 0,
      recuperavel_cofins: 0,
      categoria: "",
      lei: "",
    };

    // PIS
    item.pis_cobrado = parseFloat(extractTag(det, "vPIS")) || 0;
    if (!item.pis_cobrado) {
      const pisBlock = det.substring(det.indexOf("<PIS"));
      if (pisBlock) item.pis_cobrado = parseFloat(extractTag(pisBlock, "vPIS")) || 0;
    }

    // COFINS
    item.cofins_cobrado = parseFloat(extractTag(det, "vCOFINS")) || 0;
    if (!item.cofins_cobrado) {
      const cofinsIdx = det.indexOf("<COFINS");
      if (cofinsIdx !== -1) {
        item.cofins_cobrado = parseFloat(extractTag(det.substring(cofinsIdx), "vCOFINS")) || 0;
      }
    }

    item.is_monofasico = isMonofasico(item.ncm);

    if (item.is_monofasico) {
      const clean = cleanNCM(item.ncm);
      const rule = NCM_MONOFASICO[clean.substring(0, 4)];
      if (rule) {
        item.categoria = rule.categoria;
        item.lei = rule.lei;
      }

      item.recuperavel_pis = item.pis_cobrado;
      item.recuperavel_cofins = item.cofins_cobrado;

      if (!item.recuperavel_pis && !item.recuperavel_cofins && item.valor_produto > 0) {
        item.recuperavel_pis = Math.round(item.valor_produto * PIS_STD * 100) / 100;
        item.recuperavel_cofins = Math.round(item.valor_produto * COFINS_STD * 100) / 100;
      }

      result.total_recuperavel_pis += item.recuperavel_pis;
      result.total_recuperavel_cofins += item.recuperavel_cofins;
      result.itens_monofasicos++;
    }

    result.itens.push(item);
  }

  result.total_recuperavel = result.total_recuperavel_pis + result.total_recuperavel_cofins;

  if (result.itens_monofasicos === 0) {
    result.status = "NO_MONOPHASIC";
  }

  return result;
}

export function estimateCredit(valorProduto: number, ncm: string) {
  if (!isMonofasico(ncm)) return { monofasico: false, pis: 0, cofins: 0, total: 0 };
  const pis = Math.round(valorProduto * PIS_STD * 100) / 100;
  const cofins = Math.round(valorProduto * COFINS_STD * 100) / 100;
  return { monofasico: true, pis, cofins, total: pis + cofins };
}

// ─────────────────────────────────────────────────────────────
// MÓDULO REVISOR BANCÁRIO
// ─────────────────────────────────────────────────────────────

// Taxas médias BACEN 2024/2025 (% a.m.)
const BACEN_RATES_MONTHLY: Record<string, number> = {
  capital_giro: 1.62,
  cheque_especial_pj: 6.84,
  antecipacao_recebiveis: 1.22,
  cdc_pj: 1.88,
  financiamento_equipamentos: 1.25,
  credito_pessoal_pf: 3.50,
  consignado_pf: 1.73,
};

export function toAnnualRate(monthlyPct: number): number {
  return (Math.pow(1 + monthlyPct / 100, 12) - 1) * 100;
}

export function calcParcelaTabelaPrice(
  pv: number,
  rPct: number,
  n: number
): number {
  if (n <= 0 || pv <= 0) return 0;
  const r = rPct / 100;
  if (r < 1e-9) return pv / n;
  const factor = Math.pow(1 + r, n);
  return pv * (r * factor) / (factor - 1);
}

export interface LoanAnalysisResult {
  parcela_cobrada: number;
  parcela_justa: number;
  excesso_por_parcela: number;
  excesso_total: number;
  total_pago_contrato: number;
  total_justo_contrato: number;
  taxa_mensal_contrato: number;
  taxa_anual_contrato: number;
  taxa_cet_anual: number;
  taxa_bacen_referencia: number;
  taxa_bacen_anual: number;
  has_anatocismo: boolean;
  taxa_abusiva: boolean;
  tipo_credito: string;
  status: string;
}

export interface AmortizationRow {
  mes: number;
  parcela: number;
  juros: number;
  amortizacao: number;
  saldo: number;
}

export function analyzeLoan(
  valorEmprestimo: number,
  taxaMensalPct: number,
  prazoMeses: number,
  taxaCetAnualPct: number,
  tipoCredito: string
): LoanAnalysisResult {
  const bacenMonthly = BACEN_RATES_MONTHLY[tipoCredito] ?? 1.62;
  const bacenAnual = toAnnualRate(bacenMonthly);
  const taxaAnualContrato = toAnnualRate(taxaMensalPct);
  const taxaCet = taxaCetAnualPct > 0 ? taxaCetAnualPct : taxaAnualContrato;

  const parcelaCobrada = calcParcelaTabelaPrice(valorEmprestimo, taxaMensalPct, prazoMeses);
  const parcelaJusta = calcParcelaTabelaPrice(valorEmprestimo, bacenMonthly, prazoMeses);
  const excessoPorParcela = Math.max(0, parcelaCobrada - parcelaJusta);

  // Anatocismo: CET anual > taxa composta esperada da taxa mensal em > 2 p.p.
  const expectedAnnual = taxaAnualContrato;
  const hasAnatocismo = taxaCetAnualPct > 0 && (taxaCetAnualPct - expectedAnnual) > 2.0;

  // Taxa abusiva: > 50% acima da taxa BACEN
  const taxaAbusiva = taxaAnualContrato > bacenAnual * 1.5;

  return {
    parcela_cobrada: Math.round(parcelaCobrada * 100) / 100,
    parcela_justa: Math.round(parcelaJusta * 100) / 100,
    excesso_por_parcela: Math.round(excessoPorParcela * 100) / 100,
    excesso_total: Math.round(excessoPorParcela * prazoMeses * 100) / 100,
    total_pago_contrato: Math.round(parcelaCobrada * prazoMeses * 100) / 100,
    total_justo_contrato: Math.round(parcelaJusta * prazoMeses * 100) / 100,
    taxa_mensal_contrato: taxaMensalPct,
    taxa_anual_contrato: Math.round(taxaAnualContrato * 100) / 100,
    taxa_cet_anual: Math.round(taxaCet * 100) / 100,
    taxa_bacen_referencia: bacenMonthly,
    taxa_bacen_anual: Math.round(bacenAnual * 100) / 100,
    has_anatocismo: hasAnatocismo,
    taxa_abusiva: taxaAbusiva,
    tipo_credito: tipoCredito,
    status: prazoMeses <= 0 || valorEmprestimo <= 0 ? "INVALID_PARAMS" : "OK",
  };
}

export function buildAmortizationTable(
  pv: number,
  rPct: number,
  n: number,
  maxRows = 12
): AmortizationRow[] {
  const r = rPct / 100;
  const parcela = calcParcelaTabelaPrice(pv, rPct, n);
  let saldo = pv;
  const rows: AmortizationRow[] = [];
  const limit = Math.min(n, maxRows);

  for (let i = 1; i <= limit; i++) {
    const juros = saldo * r;
    const amortizacao = parcela - juros;
    saldo -= amortizacao;
    rows.push({
      mes: i,
      parcela: Math.round(parcela * 100) / 100,
      juros: Math.round(juros * 100) / 100,
      amortizacao: Math.round(amortizacao * 100) / 100,
      saldo: Math.round(Math.max(0, saldo) * 100) / 100,
    });
  }
  return rows;
}

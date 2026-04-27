export interface NFeItemResult {
  ncm: string;
  descricao: string;
  valor_produto: number;
  pis_cobrado: number;
  cofins_cobrado: number;
  is_monofasico: boolean;
  recuperavel_pis: number;
  recuperavel_cofins: number;
  categoria: string;
  lei: string;
}

export interface NFeAnalysisResult {
  cnpj_emitente: string;
  cnpj_destinatario: string;
  chave_acesso: string;
  data_emissao: string;
  numero_nfe: string;
  total_nfe: number;
  total_recuperavel_pis: number;
  total_recuperavel_cofins: number;
  total_recuperavel: number;
  itens_monofasicos: number;
  total_itens: number;
  status: "OK" | "PARSE_ERROR" | "NO_MONOPHASIC" | "ERROR";
  itens: NFeItemResult[];
}

export interface BatchNFeResult {
  analyses: NFeAnalysisResult[];
  total_recuperavel: number;
  total_recuperavel_pis: number;
  total_recuperavel_cofins: number;
  total_nfes: number;
  nfes_com_monofasico: number;
}

// ─── Módulo Revisor Bancário ───────────────────────────────
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

export type TipoCredito =
  | "capital_giro"
  | "cheque_especial_pj"
  | "antecipacao_recebiveis"
  | "cdc_pj"
  | "financiamento_equipamentos"
  | "credito_pessoal_pf"
  | "consignado_pf";

export const TIPO_CREDITO_LABELS: Record<TipoCredito, string> = {
  capital_giro: "Capital de Giro",
  cheque_especial_pj: "Cheque Especial PJ",
  antecipacao_recebiveis: "Antecipação de Recebíveis",
  cdc_pj: "CDC Empresarial",
  financiamento_equipamentos: "Financiamento de Equipamentos",
  credito_pessoal_pf: "Crédito Pessoal PF",
  consignado_pf: "Consignado PF",
};

export interface WasmModule {
  analyzeNFeXML: (xml: string) => string;
  checkNCM: (ncm: string) => boolean;
  getNCMInfo: (ncm: string) => string;
  estimateCredit: (valor: number, ncm: string) => string;
  analyzeLoan: (pv: number, r: number, n: number, cet: number, tipo: string) => string;
  buildAmortizationTable: (pv: number, r: number, n: number, maxRows: number) => string;
  calcParcelaTabelaPrice: (pv: number, r: number, n: number) => number;
}

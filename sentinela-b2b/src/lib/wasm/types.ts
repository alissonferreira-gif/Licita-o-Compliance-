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

export interface WasmModule {
  analyzeNFeXML: (xml: string) => string;
  checkNCM: (ncm: string) => boolean;
  getNCMInfo: (ncm: string) => string;
  estimateCredit: (valor: number, ncm: string) => string;
}

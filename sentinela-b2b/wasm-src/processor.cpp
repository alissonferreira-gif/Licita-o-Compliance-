/**
 * SENTINELA B2B — NFe XML Processor
 * Compila para WebAssembly via Emscripten.
 * Detecta NCMs sujeitos ao regime monofásico de PIS/COFINS e calcula
 * o crédito recuperável conforme leis 9.718/98, 10.147/00, 10.485/02
 * e 10.833/03.
 */

#include <emscripten/bind.h>
#include <string>
#include <vector>
#include <map>
#include <set>
#include <sstream>
#include <algorithm>
#include <cmath>
#include <stdexcept>

// ─────────────────────────────────────────────────────────────
// 1. TABELA NCM MONOFÁSICO
// Prefixos de 4 dígitos do NCM que identificam o regime.
// ─────────────────────────────────────────────────────────────
struct NCMRule {
  std::string categoria;
  std::string lei;
  // Alíquotas concentradas típicas para referência. Na prática, o valor
  // recuperável é o que foi cobrado indevidamente na nota fiscal.
  double pis_rate;
  double cofins_rate;
};

const std::map<std::string, NCMRule> NCM_MONOFASICO = {
  // Combustíveis — Lei 9.718/1998
  {"2710", {"Combustíveis", "Lei 9.718/98", 0.0, 0.0}},
  {"2711", {"Gás Natural",  "Lei 9.718/98", 0.0, 0.0}},
  {"2712", {"Ceras Minerais","Lei 9.718/98", 0.0, 0.0}},
  {"2713", {"Coque de Petróleo","Lei 9.718/98", 0.0, 0.0}},

  // Farmacêuticos e Cosméticos — Lei 10.147/2000
  {"3001", {"Farmacêuticos", "Lei 10.147/00", 0.0, 0.0}},
  {"3002", {"Farmacêuticos", "Lei 10.147/00", 0.0, 0.0}},
  {"3003", {"Medicamentos",  "Lei 10.147/00", 0.0, 0.0}},
  {"3004", {"Medicamentos",  "Lei 10.147/00", 0.0, 0.0}},
  {"3005", {"Farmacêuticos", "Lei 10.147/00", 0.0, 0.0}},
  {"3301", {"Perfumaria",    "Lei 10.147/00", 0.0, 0.0}},
  {"3302", {"Perfumaria",    "Lei 10.147/00", 0.0, 0.0}},
  {"3303", {"Perfumes",      "Lei 10.147/00", 0.0, 0.0}},
  {"3304", {"Cosméticos",    "Lei 10.147/00", 0.0, 0.0}},
  {"3305", {"Xampus",        "Lei 10.147/00", 0.0, 0.0}},
  {"3306", {"Higiene Bucal", "Lei 10.147/00", 0.0, 0.0}},
  {"3307", {"Higiene Pessoal","Lei 10.147/00", 0.0, 0.0}},

  // Bebidas — Lei 10.833/2003, art. 58-A
  {"2201", {"Águas Minerais",       "Lei 10.833/03", 0.0, 0.0}},
  {"2202", {"Bebidas Não-alcoólicas","Lei 10.833/03", 0.0, 0.0}},
  {"2203", {"Cervejas",             "Lei 10.833/03", 0.0, 0.0}},
  {"2204", {"Vinhos",               "Lei 10.833/03", 0.0, 0.0}},
  {"2205", {"Vermutes",             "Lei 10.833/03", 0.0, 0.0}},
  {"2206", {"Bebidas Fermentadas",  "Lei 10.833/03", 0.0, 0.0}},
  {"2207", {"Álcool Etílico",       "Lei 10.833/03", 0.0, 0.0}},
  {"2208", {"Destilados",           "Lei 10.833/03", 0.0, 0.0}},

  // Autopeças e Pneus — Lei 10.485/2002
  {"4011", {"Pneus Novos",         "Lei 10.485/02", 0.0, 0.0}},
  {"4013", {"Câmaras de Ar",       "Lei 10.485/02", 0.0, 0.0}},
  {"7009", {"Espelhos Veiculares", "Lei 10.485/02", 0.0, 0.0}},
  {"7011", {"Vidros Veiculares",   "Lei 10.485/02", 0.0, 0.0}},
  {"8407", {"Motores",             "Lei 10.485/02", 0.0, 0.0}},
  {"8408", {"Motores Diesel",      "Lei 10.485/02", 0.0, 0.0}},
  {"8409", {"Partes de Motores",   "Lei 10.485/02", 0.0, 0.0}},
  {"8413", {"Bombas Combustível",  "Lei 10.485/02", 0.0, 0.0}},
  {"8421", {"Filtros",             "Lei 10.485/02", 0.0, 0.0}},
  {"8431", {"Partes de Guindastes","Lei 10.485/02", 0.0, 0.0}},
  {"8481", {"Válvulas",            "Lei 10.485/02", 0.0, 0.0}},
  {"8482", {"Rolamentos",          "Lei 10.485/02", 0.0, 0.0}},
  {"8483", {"Transmissões",        "Lei 10.485/02", 0.0, 0.0}},
  {"8511", {"Ignição Elétrica",    "Lei 10.485/02", 0.0, 0.0}},
  {"8512", {"Iluminação Veicular", "Lei 10.485/02", 0.0, 0.0}},
  {"8519", {"Aparelhos de Som",    "Lei 10.485/02", 0.0, 0.0}},
  {"8527", {"Rádios Veiculares",   "Lei 10.485/02", 0.0, 0.0}},
  {"8536", {"Aparelhos Elétricos", "Lei 10.485/02", 0.0, 0.0}},
  {"8544", {"Fios e Cabos",        "Lei 10.485/02", 0.0, 0.0}},
  {"8708", {"Autopeças Gerais",    "Lei 10.485/02", 0.0, 0.0}},
  {"9401", {"Assentos Veiculares", "Lei 10.485/02", 0.0, 0.0}},
  {"9403", {"Móveis p/ Veículos",  "Lei 10.485/02", 0.0, 0.0}},
};

// Alíquotas padrão PIS/COFINS no regime não-cumulativo (Lucro Real)
static const double PIS_STD  = 0.0165;  // 1,65%
static const double COFINS_STD = 0.076;  // 7,60%

// ─────────────────────────────────────────────────────────────
// 2. ESTRUTURAS DE DADOS
// ─────────────────────────────────────────────────────────────
struct NFeItem {
  std::string ncm;
  std::string descricao;
  double valor_produto    = 0.0;
  double pis_cobrado      = 0.0;
  double cofins_cobrado   = 0.0;
  bool   is_monofasico    = false;
  double recuperavel_pis  = 0.0;
  double recuperavel_cofins = 0.0;
  std::string categoria;
  std::string lei;
};

struct NFeResult {
  std::string cnpj_emitente;
  std::string cnpj_destinatario;
  std::string chave_acesso;
  std::string data_emissao;
  std::string numero_nfe;
  double total_recuperavel_pis    = 0.0;
  double total_recuperavel_cofins = 0.0;
  double total_recuperavel        = 0.0;
  double total_nfe                = 0.0;
  int    itens_monofasicos        = 0;
  int    total_itens              = 0;
  std::string status;
  std::vector<NFeItem> itens;
};

// ─────────────────────────────────────────────────────────────
// 3. FUNÇÕES AUXILIARES
// ─────────────────────────────────────────────────────────────

// Verifica se o NCM pertence ao regime monofásico
bool isMonofasico(const std::string& ncm) {
  std::string clean;
  for (char c : ncm) {
    if (std::isdigit(c)) clean += c;
  }
  if (clean.size() < 4) return false;
  std::string prefix = clean.substr(0, 4);
  return NCM_MONOFASICO.count(prefix) > 0;
}

// Extrai texto entre tags XML (primeira ocorrência a partir de startPos)
std::string extractTag(const std::string& xml,
                       const std::string& tag,
                       size_t startPos = 0) {
  std::string openTag  = "<" + tag + ">";
  std::string closeTag = "</" + tag + ">";
  // Também aceita tags com atributos: <tag nItem="1">
  std::string openTagAlt = "<" + tag + " ";

  size_t start = xml.find(openTag, startPos);
  size_t startAlt = xml.find(openTagAlt, startPos);

  // Usa a posição mais próxima
  if (start == std::string::npos && startAlt == std::string::npos) return "";

  size_t tagEnd;
  if (start == std::string::npos || (startAlt != std::string::npos && startAlt < start)) {
    // Encontrou a tag com atributo; precisa avançar até o '>'
    size_t gtPos = xml.find('>', startAlt);
    if (gtPos == std::string::npos) return "";
    tagEnd = gtPos + 1;
  } else {
    tagEnd = start + openTag.size();
  }

  size_t end = xml.find(closeTag, tagEnd);
  if (end == std::string::npos) return "";
  return xml.substr(tagEnd, end - tagEnd);
}

// Converte string para double com segurança
double toDouble(const std::string& s) {
  if (s.empty()) return 0.0;
  try {
    return std::stod(s);
  } catch (...) {
    return 0.0;
  }
}

// Encontra todos os blocos <tag>...</tag> no XML
std::vector<std::pair<size_t, size_t>> findAllBlocks(
    const std::string& xml,
    const std::string& tag) {
  std::vector<std::pair<size_t, size_t>> blocks;
  std::string openTag  = "<" + tag;
  std::string closeTag = "</" + tag + ">";
  size_t pos = 0;

  while ((pos = xml.find(openTag, pos)) != std::string::npos) {
    // Avança para o '>' da abertura
    size_t gtPos = xml.find('>', pos);
    if (gtPos == std::string::npos) break;

    size_t end = xml.find(closeTag, gtPos);
    if (end == std::string::npos) break;

    blocks.push_back({pos, end + closeTag.size()});
    pos = end + closeTag.size();
  }
  return blocks;
}

// Escapa string para JSON
std::string jsonEscape(const std::string& s) {
  std::string result;
  result.reserve(s.size());
  for (unsigned char c : s) {
    switch (c) {
      case '"':  result += "\\\""; break;
      case '\\': result += "\\\\"; break;
      case '\n': result += "\\n"; break;
      case '\r': result += "\\r"; break;
      case '\t': result += "\\t"; break;
      default:
        if (c < 0x20) {
          char buf[8];
          snprintf(buf, sizeof(buf), "\\u%04x", c);
          result += buf;
        } else {
          result += (char)c;
        }
    }
  }
  return result;
}

// Formata double com 2 casas decimais
std::string fmtDouble(double v) {
  char buf[64];
  snprintf(buf, sizeof(buf), "%.2f", v);
  return buf;
}

// ─────────────────────────────────────────────────────────────
// 4. ANÁLISE PRINCIPAL DE UMA NFe
// ─────────────────────────────────────────────────────────────
NFeResult analyzeNFe(const std::string& xmlContent) {
  NFeResult result;
  result.status = "OK";

  // Extrai dados do cabeçalho
  result.chave_acesso  = extractTag(xmlContent, "chNFe");
  result.numero_nfe    = extractTag(xmlContent, "nNF");
  result.data_emissao  = extractTag(xmlContent, "dhEmi");
  if (result.data_emissao.empty())
    result.data_emissao = extractTag(xmlContent, "dEmi");

  // CNPJ emitente (primeiro CNPJ no XML)
  result.cnpj_emitente = extractTag(xmlContent, "CNPJ");

  // CNPJ destinatário (dentro da tag <dest>)
  size_t destPos = xmlContent.find("<dest");
  if (destPos != std::string::npos) {
    size_t destEnd = xmlContent.find("</dest>", destPos);
    if (destEnd != std::string::npos) {
      std::string destBlock = xmlContent.substr(destPos, destEnd - destPos);
      result.cnpj_destinatario = extractTag(destBlock, "CNPJ");
    }
  }

  // Valor total da NF
  result.total_nfe = toDouble(extractTag(xmlContent, "vNF"));

  // Processa cada item <det>
  auto detBlocks = findAllBlocks(xmlContent, "det");
  result.total_itens = (int)detBlocks.size();

  if (detBlocks.empty()) {
    result.status = "PARSE_ERROR";
    return result;
  }

  for (auto& [start, end] : detBlocks) {
    std::string det = xmlContent.substr(start, end - start);
    NFeItem item;

    item.ncm          = extractTag(det, "NCM");
    item.descricao    = extractTag(det, "xProd");
    item.valor_produto = toDouble(extractTag(det, "vProd"));

    // PIS
    item.pis_cobrado = toDouble(extractTag(det, "vPIS"));
    if (item.pis_cobrado == 0.0) {
      // Tenta dentro do bloco PIS especificamente
      size_t pisPos = det.find("<PIS");
      if (pisPos != std::string::npos) {
        std::string pisBlock = det.substr(pisPos);
        item.pis_cobrado = toDouble(extractTag(pisBlock, "vPIS"));
      }
    }

    // COFINS
    item.cofins_cobrado = toDouble(extractTag(det, "vCOFINS"));
    if (item.cofins_cobrado == 0.0) {
      size_t cofinsPos = det.find("<COFINS");
      if (cofinsPos != std::string::npos) {
        std::string cofinsBlock = det.substr(cofinsPos);
        item.cofins_cobrado = toDouble(extractTag(cofinsBlock, "vCOFINS"));
      }
    }

    // Verifica regime monofásico
    item.is_monofasico = isMonofasico(item.ncm);

    if (item.is_monofasico) {
      std::string cleanNcm;
      for (char c : item.ncm) {
        if (std::isdigit(c)) cleanNcm += c;
      }
      std::string prefix = cleanNcm.size() >= 4 ? cleanNcm.substr(0, 4) : cleanNcm;

      auto it = NCM_MONOFASICO.find(prefix);
      if (it != NCM_MONOFASICO.end()) {
        item.categoria = it->second.categoria;
        item.lei       = it->second.lei;
      }

      // O crédito recuperável é o PIS/COFINS cobrado indevidamente.
      // No regime monofásico, a tributação já ocorreu na origem; o
      // distribuidor/varejista NÃO deveria pagar novamente.
      item.recuperavel_pis    = item.pis_cobrado;
      item.recuperavel_cofins = item.cofins_cobrado;

      // Se a nota não destacou os valores mas usou alíquotas standard,
      // estimamos com base nas alíquotas do Lucro Real como floor.
      if (item.recuperavel_pis == 0.0 && item.recuperavel_cofins == 0.0
          && item.valor_produto > 0.0) {
        item.recuperavel_pis    = std::round(item.valor_produto * PIS_STD * 100.0) / 100.0;
        item.recuperavel_cofins = std::round(item.valor_produto * COFINS_STD * 100.0) / 100.0;
      }

      result.total_recuperavel_pis    += item.recuperavel_pis;
      result.total_recuperavel_cofins += item.recuperavel_cofins;
      result.itens_monofasicos++;
    }

    result.itens.push_back(item);
  }

  result.total_recuperavel =
    result.total_recuperavel_pis + result.total_recuperavel_cofins;

  if (result.itens_monofasicos == 0) {
    result.status = "NO_MONOPHASIC";
  }

  return result;
}

// ─────────────────────────────────────────────────────────────
// 5. SERIALIZAÇÃO JSON
// ─────────────────────────────────────────────────────────────
std::string resultToJSON(const NFeResult& r) {
  std::ostringstream j;
  j << "{";
  j << "\"cnpj_emitente\":\""      << jsonEscape(r.cnpj_emitente) << "\",";
  j << "\"cnpj_destinatario\":\""  << jsonEscape(r.cnpj_destinatario) << "\",";
  j << "\"chave_acesso\":\""       << jsonEscape(r.chave_acesso) << "\",";
  j << "\"data_emissao\":\""       << jsonEscape(r.data_emissao) << "\",";
  j << "\"numero_nfe\":\""         << jsonEscape(r.numero_nfe) << "\",";
  j << "\"total_nfe\":"            << fmtDouble(r.total_nfe) << ",";
  j << "\"total_recuperavel_pis\":" << fmtDouble(r.total_recuperavel_pis) << ",";
  j << "\"total_recuperavel_cofins\":" << fmtDouble(r.total_recuperavel_cofins) << ",";
  j << "\"total_recuperavel\":"    << fmtDouble(r.total_recuperavel) << ",";
  j << "\"itens_monofasicos\":"    << r.itens_monofasicos << ",";
  j << "\"total_itens\":"          << r.total_itens << ",";
  j << "\"status\":\""             << jsonEscape(r.status) << "\",";
  j << "\"itens\":[";

  bool first = true;
  for (const auto& item : r.itens) {
    if (!first) j << ",";
    first = false;
    j << "{";
    j << "\"ncm\":\""          << jsonEscape(item.ncm) << "\",";
    j << "\"descricao\":\""    << jsonEscape(item.descricao) << "\",";
    j << "\"valor_produto\":"  << fmtDouble(item.valor_produto) << ",";
    j << "\"pis_cobrado\":"    << fmtDouble(item.pis_cobrado) << ",";
    j << "\"cofins_cobrado\":" << fmtDouble(item.cofins_cobrado) << ",";
    j << "\"is_monofasico\":"  << (item.is_monofasico ? "true" : "false") << ",";
    j << "\"recuperavel_pis\":" << fmtDouble(item.recuperavel_pis) << ",";
    j << "\"recuperavel_cofins\":" << fmtDouble(item.recuperavel_cofins) << ",";
    j << "\"categoria\":\""    << jsonEscape(item.categoria) << "\",";
    j << "\"lei\":\""          << jsonEscape(item.lei) << "\"";
    j << "}";
  }

  j << "]}";
  return j.str();
}

// ─────────────────────────────────────────────────────────────
// 6. FUNÇÕES EXPORTADAS PARA JAVASCRIPT
// ─────────────────────────────────────────────────────────────

// Analisa um único XML de NFe e retorna JSON
std::string analyzeNFeXML(const std::string& xmlContent) {
  try {
    NFeResult r = analyzeNFe(xmlContent);
    return resultToJSON(r);
  } catch (const std::exception& e) {
    return std::string("{\"status\":\"ERROR\",\"error\":\"") +
           jsonEscape(e.what()) + "\"}";
  }
}

// Verifica se um NCM é monofásico (utilitário para UI)
bool checkNCM(const std::string& ncm) {
  return isMonofasico(ncm);
}

// Retorna a categoria do NCM como JSON
std::string getNCMInfo(const std::string& ncm) {
  std::string clean;
  for (char c : ncm) {
    if (std::isdigit(c)) clean += c;
  }
  if (clean.size() < 4) return "{\"monofasico\":false}";
  std::string prefix = clean.substr(0, 4);

  auto it = NCM_MONOFASICO.find(prefix);
  if (it == NCM_MONOFASICO.end()) return "{\"monofasico\":false}";

  std::ostringstream j;
  j << "{";
  j << "\"monofasico\":true,";
  j << "\"categoria\":\"" << jsonEscape(it->second.categoria) << "\",";
  j << "\"lei\":\"" << jsonEscape(it->second.lei) << "\"";
  j << "}";
  return j.str();
}

// Calcula estimativa de crédito para um único item
std::string estimateCredit(double valorProduto, const std::string& ncm) {
  bool mono = isMonofasico(ncm);
  if (!mono) {
    return "{\"monofasico\":false,\"pis\":0,\"cofins\":0,\"total\":0}";
  }
  double pis    = std::round(valorProduto * PIS_STD * 100.0) / 100.0;
  double cofins = std::round(valorProduto * COFINS_STD * 100.0) / 100.0;
  std::ostringstream j;
  j << "{\"monofasico\":true";
  j << ",\"pis\":"    << fmtDouble(pis);
  j << ",\"cofins\":" << fmtDouble(cofins);
  j << ",\"total\":"  << fmtDouble(pis + cofins);
  j << "}";
  return j.str();
}

// ─────────────────────────────────────────────────────────────
// 7. EMSCRIPTEN BINDINGS
// ─────────────────────────────────────────────────────────────
EMSCRIPTEN_BINDINGS(sentinela_processor) {
  emscripten::function("analyzeNFeXML",   &analyzeNFeXML);
  emscripten::function("checkNCM",        &checkNCM);
  emscripten::function("getNCMInfo",      &getNCMInfo);
  emscripten::function("estimateCredit",  &estimateCredit);
}

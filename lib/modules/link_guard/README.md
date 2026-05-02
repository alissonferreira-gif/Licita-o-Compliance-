# Link Guard (v1.2)

Este módulo será adicionado na versão v1.2 e conterá:

- Detector de golpe em links recebidos via SMS, WhatsApp e outros apps
- Verificação em tempo real contra bases de phishing (Google Safe Browsing, etc.)
- Análise de domínio suspeito (typosquatting, domínios recentes)
- Integração com AI Engine para análise semântica do conteúdo do link
- Compartilhamento de links suspeitos para a comunidade

## Fluxo planejado

1. Usuário recebe mensagem com link suspeito
2. Copia o link e cola no SemSpam
3. Link Guard verifica em múltiplas bases e retorna classificação
4. Se confirmado phishing, opção de reportar para a comunidade

## Estrutura planejada

```
link_guard/
  data/
    models/
      link_analysis.dart
      safe_browsing_result.dart
    datasources/
      safe_browsing_source.dart
      link_guard_firestore_source.dart
  domain/
    usecases/
      analyze_link_usecase.dart
      report_link_usecase.dart
  presentation/
    pages/
      link_check_page.dart
    widgets/
      link_result_card.dart
```

> ⚠️ NÃO implementar nessa versão (v1.0). Apenas estrutura de pastas.

# AI Engine (v1.1+)

Este módulo será adicionado nas versões futuras (v1.1+) e conterá:

- Integração com Google Gemini API (Flash, Pro, Vision)
- Classificação inteligente de reportes (texto livre → categoria)
- Análise de SMS/WhatsApp suspeito
- Análise de print de mensagem (Vision)
- Chatbot de orientação pós-detecção de golpe
- Recomendações personalizadas

## Estratégia de chave API

- **Plano gratuito:** chave Gemini do desenvolvedor (com cap de uso)
- **Plano PRO:** BYOK (Bring Your Own Key) opcional para análises ilimitadas

## Estrutura planejada

```
ai_engine/
  data/
    models/
      ai_classification.dart
      gemini_request.dart
    datasources/
      gemini_api_source.dart
  domain/
    usecases/
      classify_report_usecase.dart
      analyze_message_usecase.dart
      chat_usecase.dart
  presentation/
    widgets/
      ai_suggestion_card.dart
    pages/
      ai_chat_page.dart
```

> ⚠️ NÃO implementar nessa versão (v1.0). Apenas estrutura de pastas.

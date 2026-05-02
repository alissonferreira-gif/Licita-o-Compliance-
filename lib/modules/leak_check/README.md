# Leak Check (v1.3)

Este módulo será adicionado na versão v1.3 e conterá:

- Verificador de vazamento de dados pessoais (e-mail, CPF, telefone)
- Integração com APIs de breach detection (Have I Been Pwned e similares BR)
- Alertas proativos quando novos vazamentos forem detectados
- Orientações práticas sobre o que fazer após um vazamento
- Registro local seguro dos dados monitorados (nunca enviados ao servidor)

## Considerações de privacidade (LGPD)

- CPF e e-mail são verificados via hash antes de serem consultados
- Nenhum dado sensível é armazenado nos servidores SemSpam
- O usuário tem controle total sobre o que é monitorado
- Conformidade total com LGPD — dados tratados localmente

## Estrutura planejada

```
leak_check/
  data/
    models/
      leak_result.dart
      monitored_item.dart
    datasources/
      hibp_source.dart          # Have I Been Pwned
      br_leak_source.dart       # Bases brasileiras
    repositories/
      leak_check_repository.dart
  domain/
    usecases/
      check_email_usecase.dart
      check_cpf_hash_usecase.dart
      monitor_data_usecase.dart
  presentation/
    pages/
      leak_check_page.dart
      monitored_data_page.dart
    widgets/
      leak_result_card.dart
      monitored_item_tile.dart
```

> ⚠️ NÃO implementar nessa versão (v1.0). Apenas estrutura de pastas.

# Play Store Listing — SemSpam

## Título (máx. 30 caracteres)
```
SemSpam — Bloqueio de Spam BR
```
*(29 caracteres)*

---

## Descrição curta (máx. 80 caracteres)
```
Bloqueie telemarketing e ligações chatas. Comunidade brasileira contra spam.
```
*(76 caracteres)*

---

## Descrição longa (máx. 4000 caracteres)

```
🛡️ CHEGA DE LIGAÇÕES CHATAS! O SemSpam é o aplicativo brasileiro que bloqueia telemarketing, golpes e robôchamadas automaticamente — antes de você precisar atender.

━━━━━━━━━━━━━━━━━━━━━━━━
🚀 COMO FUNCIONA
━━━━━━━━━━━━━━━━━━━━━━━━

Quando alguém liga para você, o SemSpam consulta instantaneamente nosso banco de dados colaborativo com milhares de números denunciados por brasileiros. Em menos de 1,5 segundos você sabe se é spam — e pode bloquear automaticamente.

━━━━━━━━━━━━━━━━━━━━━━━━
✅ RECURSOS PRINCIPAIS
━━━━━━━━━━━━━━━━━━━━━━━━

🔍 Verificação automática de chamadas recebidas
🚫 Bloqueio automático de números com muitas denúncias
⚠️ Alerta visual durante chamadas suspeitas
📋 Histórico de todas as chamadas verificadas
📝 Denuncie números chatos em segundos
👥 Banco colaborativo — quanto mais usuários, mais inteligente fica
📊 Estatísticas de proteção mensal

━━━━━━━━━━━━━━━━━━━━━━━━
🔒 SUA PRIVACIDADE É PRIORIDADE
━━━━━━━━━━━━━━━━━━━━━━━━

✓ Login anônimo — nunca pedimos seu nome ou e-mail
✓ Não acessamos seus contatos
✓ Não lemos suas mensagens
✓ Não rastreamos sua localização
✓ Conformidade total com a LGPD
✓ Dados armazenados em servidores brasileiros (Google Cloud SP)

━━━━━━━━━━━━━━━━━━━━━━━━
🇧🇷 FEITO PARA O BRASIL
━━━━━━━━━━━━━━━━━━━━━━━━

Reconhece prefixos brasileiros, DDDs e padrões de números como operadoras. Interface 100% em português brasileiro.

━━━━━━━━━━━━━━━━━━━━━━━━
💡 POR QUE O SEMSPAM É DIFERENTE
━━━━━━━━━━━━━━━━━━━━━━━━

Diferente de outros bloqueadores, o SemSpam é colaborativo e focado no Brasil. Cada denúncia que você faz protege outros brasileiros em tempo real. Juntos somos mais fortes contra o spam.

━━━━━━━━━━━━━━━━━━━━━━━━
📱 COMPATIBILIDADE
━━━━━━━━━━━━━━━━━━━━━━━━

• Android 7.0 ou superior
• Requer permissão de telefone para funcionar
• Funciona em segundo plano sem consumir bateria

━━━━━━━━━━━━━━━━━━━━━━━━

Dúvidas? Fale com a gente: suporte@semspam.com.br
```

*(Aprox. 2.100 caracteres — bem dentro do limite)*

---

## Sugestões de screenshots (8 telas)

### Screenshot 1 — Tela Inicial
**Texto sugerido na imagem:** "🛡️ Protegido de 47 ligações esse mês"  
**Contexto:** App aberto na home mostrando o card de proteção e lista de chamadas recentes com badges coloridas

### Screenshot 2 — Bloqueio em Ação
**Texto sugerido:** "🚨 Spam bloqueado automaticamente"  
**Contexto:** Notificação de chamada bloqueada com número e score de spam

### Screenshot 3 — Verificar Número
**Texto sugerido:** "🔍 Verifique qualquer número antes de atender"  
**Contexto:** Tela de verificação com resultado mostrando "Spam confirmado — 1.247 reportes"

### Screenshot 4 — Denunciar Spam
**Texto sugerido:** "📝 Denuncie em segundos. Ajude outros brasileiros"  
**Contexto:** Formulário de reporte preenchido com tipo "Telemarketing"

### Screenshot 5 — Onboarding
**Texto sugerido:** "👥 Comunidade de +1M brasileiros protegidos"  
**Contexto:** Segunda tela do onboarding explicando o banco colaborativo

### Screenshot 6 — Estatísticas
**Texto sugerido:** "📊 Veja quanto spam você desviou esse mês"  
**Contexto:** Tela de stats com números pessoais e da comunidade

### Screenshot 7 — Configurações
**Texto sugerido:** "⚙️ Controle total nas suas mãos"  
**Contexto:** Tela de configurações com toggles de proteção

### Screenshot 8 — Modo Escuro
**Texto sugerido:** "🌙 Tema escuro automático"  
**Contexto:** Home em tema escuro, mostrando responsividade visual

---

## Justificativa para permissão sensível — CallScreeningService

**Para a revisão do Google Play (colhear na seção "Declaração de permissões sensíveis"):**

```
JUSTIFICATIVA PARA USO DE CallScreeningService / BIND_SCREENING_SERVICE

O SemSpam é um aplicativo de proteção contra chamadas spam no Brasil. 
A permissão BIND_SCREENING_SERVICE (CallScreeningService) é 
INDISPENSÁVEL para a função principal do aplicativo, que é identificar 
e bloquear chamadas indesejadas em tempo real.

COMO USAMOS:
1. Quando uma chamada entra, nosso CallScreeningServiceImpl consulta 
   nosso banco de dados Firestore de números reportados (timeout 1.5s)
2. Se o número tiver score de spam ≥ 5 E o usuário tiver ativado 
   "bloquear automaticamente", a chamada é rejeitada silenciosamente
3. Se o número tiver score ≥ 5 mas o usuário NÃO ativou o bloqueio 
   automático, exibimos apenas uma notificação de alerta
4. O resultado é registrado no histórico local do usuário

O que NÃO fazemos:
- Não gravamos o conteúdo da chamada
- Não acessamos contatos do usuário
- Não transmitimos dados de voz
- Não identificamos o usuário real (login anônimo)

ALTERNATIVAS CONSIDERADAS E DESCARTADAS:
- READ_CALL_LOG: não permite ação em tempo real durante a chamada
- Notificação pós-chamada: não previne o incômodo da chamada spam
- Sem permissão nativa: o app perderia sua funcionalidade principal

A CallScreeningService é o mecanismo OFICIAL do Android para apps de 
proteção contra spam, conforme documentação do Google em 
developer.android.com/reference/android/telecom/CallScreeningService

Categoria do app: Ferramentas / Proteção e Segurança
Função principal declarada: Identificação e bloqueio de chamadas spam
```

---

## Categoria
**Categoria principal:** Ferramentas  
**Categoria secundária:** Produtividade

## Classificação de conteúdo
**Classificação indicativa:** Livre (todos os públicos)  
**Sem conteúdo sensível**

## Palavras-chave sugeridas (ASO)
bloqueador de chamadas, spam, telemarketing, bloqueio spam brasil, anti spam celular, bloquear ligação, chamada indesejada, proteção contra spam, bloqueador telemarketing, sem spam

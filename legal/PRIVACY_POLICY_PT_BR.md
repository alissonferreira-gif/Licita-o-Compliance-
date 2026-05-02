# Política de Privacidade — SemSpam

**Versão:** 1.0  
**Data de vigência:** 01/05/2025  
**Controlador:** SemSpam Tecnologia Ltda. (CNPJ a ser cadastrado)  
**DPO/Contato:** privacidade@semspam.com.br

---

## 1. Quem somos

O SemSpam é um aplicativo brasileiro de proteção digital contra chamadas indesejadas (spam, telemarketing, golpes). Operamos o banco de dados colaborativo de números reportados que alimenta o serviço de bloqueio automático.

---

## 2. Quais dados coletamos

### 2.1 Dados coletados automaticamente

| Dado | Finalidade | Retenção |
|------|-----------|----------|
| ID anônimo (Firebase UID) | Identificar o usuário sem revelar identidade | Até exclusão da conta |
| Números de telefone recebidos | Verificar se são spam no banco colaborativo | 7 dias no cache local |
| Eventos de uso (analytics) | Melhorar o aplicativo | 24 meses no Firebase |
| Token FCM | Enviar notificações | Até desinstalação |

### 2.2 Dados fornecidos pelo usuário

| Dado | Finalidade | Retenção |
|------|-----------|----------|
| Número reportado | Alimentar o banco colaborativo | Indefinido (bem público) |
| Tipo de reporte (telemarketing, golpe, etc.) | Classificar o número | Indefinido |
| Comentário opcional | Contexto do reporte | Indefinido |

### 2.3 O que **NÃO** coletamos

- ❌ Nome ou qualquer identificação pessoal
- ❌ Lista de contatos do celular
- ❌ Conteúdo de mensagens ou SMS
- ❌ Localização geográfica
- ❌ Dados biométricos
- ❌ Histórico de navegação

---

## 3. Por que coletamos

Tratamos os dados com base nas seguintes hipóteses legais da LGPD:

1. **Legítimo interesse** (Art. 7º, IX): verificar se números recebidos são spam, protegendo o usuário de fraudes e perturbações.
2. **Consentimento** (Art. 7º, I): para reportar números e participar do banco colaborativo — o usuário escolhe ativamente enviar o reporte.
3. **Cumprimento de obrigação legal** (Art. 7º, II): quando exigido por autoridades competentes.

---

## 4. Como usamos os dados

- **Verificação de números:** consultamos nosso banco colaborativo para classificar chamadas recebidas como spam, suspeitas ou seguras.
- **Banco colaborativo:** reportes enviados pelos usuários são agregados e anonimizados para beneficiar toda a comunidade.
- **Melhoria do serviço:** dados de analytics (sem PII) ajudam a entender como o app é usado e onde melhorar.
- **Notificações:** enviamos alertas quando chamadas são bloqueadas (se habilitado pelo usuário).

---

## 5. Compartilhamento de dados

**Não vendemos, não alugamos e não comercializamos seus dados.**

Compartilhamos apenas com:

- **Firebase/Google:** infraestrutura do serviço. Os dados são processados nos termos do DPA do Google.
- **Google AdMob:** exibição de anúncios. Conforme configurado pelo UMP Consent, os anúncios podem ser personalizados (com consentimento) ou não personalizados (sem consentimento).
- **Autoridades legais:** somente mediante ordem judicial ou obrigação legal.

---

## 6. Transferência internacional

Os dados são armazenados em servidores do Google Cloud Platform, com servidores na região `southamerica-east1` (São Paulo, Brasil) para dados de usuários brasileiros, garantindo conformidade com a LGPD.

---

## 7. Segurança

Adotamos as seguintes medidas:

- Autenticação anônima — nunca sabemos quem é o usuário real
- Regras de segurança no Firestore (usuário só escreve seus próprios reportes)
- Cloud Functions validam e sanitizam todos os dados antes de persistir
- Comunicação exclusivamente via HTTPS/TLS
- Sem armazenamento de senhas (login anônimo)

---

## 8. Seus direitos como titular (LGPD)

Você tem direito a:

| Direito | Como exercer |
|---------|-------------|
| Acesso | Solicitar via e-mail listando seus dados |
| Correção | Solicitar correção de dados incorretos |
| Exclusão | Excluir conta e dados associados |
| Portabilidade | Receber seus dados em formato estruturado |
| Revogação de consentimento | Desativar na tela de configurações |
| Oposição | Manifestar-se contra tratamento específico |
| Informação sobre compartilhamento | Solicitar lista de parceiros |

Para exercer seus direitos: **privacidade@semspam.com.br** — respondemos em até 15 dias.

---

## 9. Dados de menores

O SemSpam não é destinado a menores de 13 anos. Não coletamos conscientemente dados de crianças. Se identificarmos que um menor nos enviou dados, excluiremos imediatamente.

---

## 10. Cookies e tecnologias similares

O SemSpam é um aplicativo móvel e não usa cookies tradicionais. Usamos o ID de instalação do Firebase e SharedPreferences locais para funcionalidades do app.

---

## 11. Anúncios e consentimento UMP

Na primeira abertura, apresentamos o formulário de consentimento do Google UMP (Plataforma de Gerenciamento de Consentimento). Sem consentimento para anúncios personalizados, exibimos apenas anúncios não personalizados.

---

## 12. Alterações nesta política

Informaremos sobre alterações significativas através de notificação no app. A versão vigente sempre estará disponível em: `https://semspam.com.br/privacidade`

---

## 13. Contato

**DPO (Encarregado de Proteção de Dados):** a ser nomeado  
**E-mail:** privacidade@semspam.com.br  
**Endereço:** a ser cadastrado no CNPJ

*Esta política está em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018) e o Marco Civil da Internet (Lei nº 12.965/2014).*

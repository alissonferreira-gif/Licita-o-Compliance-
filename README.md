# 🛡️ SemSpam v1.0

**Bloqueio inteligente de chamadas spam no Brasil**

Aplicativo Android colaborativo que identifica e bloqueia telemarketing, golpes e robôchamadas automaticamente, usando um banco de dados construído pela própria comunidade brasileira.

---

## Visão do projeto

O SemSpam é uma suíte brasileira de proteção digital. Esta é a **v1.0 — MVP de bloqueio de chamadas spam**.

| Versão | Status | Funcionalidade |
|--------|--------|---------------|
| **v1.0** | ✅ Este repositório | Bloqueio de chamadas spam |
| v1.1 | 📋 Planejado | IA Gemini para classificação de reportes |
| v1.2 | 📋 Planejado | Link Guard — detector de golpe em links/SMS/WhatsApp |
| v1.3 | 📋 Planejado | Verificador de vazamento de dados pessoais |
| v2.0 | 📋 Planejado | Plano PRO + BYOK Gemini + chatbot |

---

## Stack técnica

| Camada | Tecnologia |
|--------|-----------|
| UI / Lógica | Flutter (Dart 3+) |
| Nativo Android | Kotlin (CallScreeningService) |
| Auth | Firebase Auth (anônimo) |
| Banco de dados | Cloud Firestore |
| Backend | Firebase Cloud Functions (TypeScript) |
| Notificações | Firebase Cloud Messaging |
| Analytics | Firebase Analytics |
| Cache local | SQLite via `sqflite` |
| State management | Riverpod |
| Monetização | Google AdMob |
| Min SDK | Android 24 (7.0) |

---

## Estrutura de pastas

```
lib/
  main.dart                     # Entry point + inicializações
  app.dart                      # MaterialApp + roteamento raiz
  core/
    constants.dart              # Constantes globais
    theme/                      # Cores, tipografia, temas claro/escuro
    utils/                      # PhoneFormatter, ResultClassifier, Analytics
    widgets/                    # ClassificationBadge, AdBannerWidget
  shared/
    services/                   # Auth, Firestore, SQLite, AdMob, Analytics
  modules/
    call_protection/            # Módulo principal do MVP
      data/                     # Models, repositories, datasources
      domain/                   # Use cases
      presentation/             # Pages, widgets, Riverpod providers
    onboarding/                 # Onboarding + permissões
    link_guard/                 # 📋 Placeholder v1.2
    leak_check/                 # 📋 Placeholder v1.3
    ai_engine/                  # 📋 Placeholder v1.1+

android/
  app/src/main/kotlin/com/semspam/app/
    MainActivity.kt             # FlutterActivity + MethodChannel
    CallScreeningServiceImpl.kt # Bloqueio nativo em tempo real
    CallReceiver.kt             # Fallback Android < 10
    MethodChannelHandler.kt     # Bridge Kotlin ↔ Flutter
    NotificationHelper.kt       # Canais e notificações
    BootReceiver.kt             # Reregistra serviços após boot
    models/IncomingCall.kt

functions/src/index.ts          # Cloud Functions TypeScript
firestore.rules                 # Regras de segurança Firestore
l10n/app_pt_BR.arb             # Strings localizadas PT-BR
legal/                          # Documentos legais (LGPD)
```

---

## Setup local — passo a passo

### Pré-requisitos

- Flutter SDK (estável, ≥ 3.x): https://flutter.dev/docs/get-started/install
- Android Studio ou VS Code com extensões Flutter/Dart
- Node.js 20+ (para Cloud Functions)
- Firebase CLI: `npm install -g firebase-tools`
- Uma conta Google com projeto Firebase criado

### 1. Clone e instale dependências

```bash
git clone https://github.com/seu-usuario/semspam.git
cd semspam
flutter pub get
```

### 2. Configure o Firebase

```bash
# Login no Firebase
firebase login

# Inicialize o projeto (se ainda não fez)
firebase init

# Configure o FlutterFire
dart pub global activate flutterfire_cli
flutterfire configure --project=SEU_PROJETO_ID
```

Isso gera o arquivo `lib/firebase_options.dart` automaticamente.

> ⚠️ **Obrigatório:** o arquivo `lib/firebase_options.dart` deve existir antes do primeiro build. Sem ele, `Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform)` em `main.dart` falhará com erro de compilação. Rode `flutterfire configure` sempre que trocar de projeto Firebase.

Coloque o `google-services.json` (baixado do Firebase Console) em:
```
android/app/google-services.json
```

### 3. Configure variáveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env` com seus valores reais:
```
FIREBASE_PROJECT_ID=seu-projeto
FIREBASE_API_KEY_ANDROID=sua-chave
FIREBASE_APP_ID_ANDROID=1:123:android:abc
ADMOB_APP_ID=ca-app-pub-XXX~XXX
ADMOB_BANNER_ID_HOME=ca-app-pub-XXX/XXX
ADMOB_INTERSTITIAL_ID_VERIFY=ca-app-pub-XXX/XXX
PRIVACY_POLICY_URL=https://semspam.com.br/privacidade
TERMS_URL=https://semspam.com.br/termos
SUPPORT_EMAIL=suporte@semspam.com.br
```

> Em desenvolvimento, os IDs de teste do AdMob são usados automaticamente.

### 4. Configure as Cloud Functions

```bash
cd functions
npm install
cd ..
```

### 5. Deploy das regras e functions

```bash
# Deploy das regras de segurança
firebase deploy --only firestore:rules,firestore:indexes

# Deploy das Cloud Functions
firebase deploy --only functions
```

### 6. Rode em modo desenvolvimento

```bash
flutter run
```

---

## Como gerar o APK release

### 1. Configure a assinatura

Crie o arquivo `android/key.properties` (não commitar):
```properties
storePassword=sua_senha
keyPassword=sua_senha
keyAlias=upload
storeFile=../upload-keystore.jks
```

Gere o keystore:
```bash
keytool -genkey -v -keystore android/upload-keystore.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias upload
```

### 2. Configure android/key.properties e o build.gradle já está pronto

O `android/app/build.gradle` já tem a configuração de signing completa. Basta criar o `android/key.properties` com os valores corretos e o `upload-keystore.jks` no lugar indicado. O arquivo de properties **nunca deve ser commitado** (está no `.gitignore`).

### 3. Gere o APK/AAB

```bash
# APK para teste
flutter build apk --release

# App Bundle para Play Store (recomendado)
flutter build appbundle --release
```

O AAB estará em: `build/app/outputs/bundle/release/app-release.aab`

---

## Como fazer upload na Play Console

1. Acesse https://play.google.com/console
2. Crie um novo aplicativo
3. Preencha as informações usando `legal/PLAY_STORE_LISTING.md`
4. Vá em **Produção → Releases → Criar nova versão**
5. Faça upload do `app-release.aab`
6. Preencha as notas da versão em PT-BR
7. Responda o questionário de classificação de conteúdo
8. Configure os anúncios no AdMob e vincule ao app
9. Envie para revisão

---

## Solicitação de aprovação do CallScreeningService

O Google exige justificativa especial para apps que usam `CallScreeningService`. Use o texto em `legal/PLAY_STORE_LISTING.md` (seção "Justificativa para permissão sensível").

**Onde preencher na Play Console:**
1. Conteúdo do app → Permissões sensíveis e de alto risco
2. Selecione `BIND_SCREENING_SERVICE`
3. Cole a justificativa
4. Forneça um vídeo demonstrativo (2-3 min mostrando a função de bloqueio)

**Dicas para aprovação:**
- Demonstre claramente que a permissão é necessária para a funcionalidade principal
- Mostre o fluxo completo: receber chamada → verificar → bloquear/alertar
- Evidencie que não há gravação de áudio
- Mencione que segue as diretrizes do Android para apps de proteção contra spam
- Inclua link para a política de privacidade

---

## Aprovação como Call Screening (Android 10+)

O `CallScreeningService` só funciona se o usuário conceder o papel (Role) de "app de proteção de chamadas". Esse fluxo é implementado automaticamente:

1. No onboarding (última tela), o app chama `RoleManager.createRequestRoleIntent(ROLE_CALL_SCREENING)` via `RoleHandler.kt`
2. O Android exibe um diálogo nativo pedindo confirmação ao usuário
3. A resposta retorna via `onActivityResult` → `RoleHandler.handleActivityResult`

Em dispositivos com Android < 10, a tela é pulada automaticamente e o `CallReceiver` (BroadcastReceiver) atua como fallback.

Para verificar / reativar o role manualmente, o usuário pode acessar **Configurações → Status de proteção → Ativar agora**.

---

## Seed inicial (primeira vez)

Após o primeiro deploy das Functions, popule o banco com padrões de spam conhecidos:

```bash
# Configurar a chave secreta (fazer uma vez)
firebase functions:config:set admin.seed_key="SUA_CHAVE_SECRETA"

# Ou via variável de ambiente no .env das functions:
# ADMIN_SEED_KEY=SUA_CHAVE_SECRETA

# Fazer o deploy
firebase deploy --only functions

# Chamar o endpoint de seed
curl -X POST \
  -H "x-admin-key: SUA_CHAVE_SECRETA" \
  https://southamerica-east1-SEU-PROJETO.cloudfunctions.net/seedKnownSpam
```

Adicione mais entradas em `functions/src/seed.ts` conforme dados públicos do Procon/Anatel.

---

## Como rodar os emuladores Firebase localmente

```bash
firebase emulators:start
```

Acesse o Emulator UI em http://localhost:4000

Para conectar o app Flutter aos emuladores, adicione em `main.dart`:
```dart
// Apenas em modo debug
if (kDebugMode) {
  FirebaseFirestore.instance.useFirestoreEmulator('localhost', 8080);
  await FirebaseAuth.instance.useAuthEmulator('localhost', 9099);
}
```

---

## Roadmap

### v1.1 — IA Engine
- Classificação inteligente de reportes com Gemini Flash
- Análise semântica de comentários

### v1.2 — Link Guard
- Verificador de links suspeitos em SMS/WhatsApp
- Integração Google Safe Browsing
- Análise de domínios suspeitos

### v1.3 — Leak Check
- Verificador de vazamento de dados pessoais
- Integração com bases de breach detection brasileiras
- Alertas proativos

### v2.0 — PRO
- Plano recorrente via Google Play Billing
- BYOK (Bring Your Own Key) para Gemini ilimitado
- Chatbot de orientação pós-golpe
- Dashboard avançado

---

## Licença

Copyright © 2025 SemSpam Tecnologia Ltda. Todos os direitos reservados.

---

*Feito com ❤️ no Brasil. Protegendo brasileiros contra spam.*

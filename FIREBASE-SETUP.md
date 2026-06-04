# 🔥 Firebase Cloud Sync - GameVault

## ✅ Configuração Completa

Seu GameVault agora tem **sincronização em tempo real com Firebase!**

---

## 🚀 Como Usar

### 1. **Fazer Login**
- Clique em **🔴 Google** ou **⚫ GitHub** no header
- Você será autenticado automaticamente
- Seus dados começarão a sincronizar

### 2. **Dados Sincronizados**
✅ **Games** - Adições, edições, deletagens
✅ **Platforms** - Suas plataformas customizadas
✅ **Timestamps** - Data de atualização

### 3. **Sincronização Automática**
- Toda vez que você adiciona/edita/deleta um jogo → Firebase atualiza
- Múltiplos dispositivos → Sincronizam em tempo real
- Offline → Sincroniza quando voltar online

---

## 📱 Multi-Device Sync

**Agora você pode:**
```
PC (Chrome)           iPad (Safari)        Celular (Android)
     ↓                      ↓                     ↓
     └──────────→ Firebase Firestore ←──────────┘
                    (banco em nuvem)
                          ↓
           Sincronização bidirecional em tempo real
```

---

## 🔐 Regras de Segurança Firebase

Se você quer testar localmente, adicione essas regras no Firebase Console:

```javascript
// Firestore Rules (Copiar no Firebase Console > Rules)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuário pode ler/escrever seus próprios dados
    match /users/{uid}/{document=**} {
      allow read, write: if request.auth.uid == uid;
    }
    
    // Dados públicos (opcional)
    match /public/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

## 📊 Estrutura do Banco Firebase

```
Firestore Database (game-historia-2026)
├── users/
│   ├── {userId}/
│   │   ├── games/
│   │   │   ├── 1780583345003
│   │   │   │   ├── name: "Elden Ring"
│   │   │   │   ├── platform: "PC"
│   │   │   │   ├── hours: "120"
│   │   │   │   ├── rating: 10
│   │   │   │   ├── status: "zerado"
│   │   │   │   ├── lastUpdated: 1717420000
│   │   │   │   └── syncedAt: [server timestamp]
│   │   │   └── 1780583359223
│   │   │       └── ... (Baldur's Gate 3)
│   │   │
│   │   └── platforms/
│   │       ├── 0: { name: "PC", icon: "🖥️" }
│   │       ├── 1: { name: "PS5", icon: "🎮" }
│   │       └── ... (outras plataformas)
```

---

## 🔄 Fluxo de Sincronização

### Ao Adicionar um Jogo:
```
1. Usuário clica "Salvar Jogo"
2. Dado salvo no IndexedDB (local)
3. Função uploadGameToFirebase() executa
4. Firebase recebe o dado
5. Outros dispositivos recebem atualização (real-time listener)
6. Toast: "✅ Game sincronizado"
```

### Ao Editar Jogo:
```
1. Modal abre com dados
2. Usuário edita e salva
3. saveGame() → uploadGameToFirebase()
4. Firebase atualiza
5. Outro dispositivo vê mudança instantaneamente
```

### Ao Deletar Jogo:
```
1. Usuário confirma deleção
2. deleteGame() remove localmente
3. deleteGameFromFirebase() remove no Firebase
4. Outro dispositivo sincroniza automaticamente
```

---

## 💾 Funções Principais

### Login
```javascript
signInWithGoogle()   // Login com Google
signInWithGitHub()   // Login com GitHub
signOut()            // Logout
```

### Sincronização Manual
```javascript
syncAllDataToFirebase()      // Forçar sync de todos os dados
uploadGameToFirebase(id)     // Sincronizar um jogo específico
deleteGameFromFirebase(id)   // Deletar jogo no Firebase
downloadBackupFromFirebase() // Baixar backup JSON do Firebase
```

---

## 🛡️ Segurança & Privacidade

✅ **Seus dados são privados**
- Apenas VOCÊ pode ver seus dados
- Autenticação via Google/GitHub
- Criptografia em trânsito (HTTPS)

✅ **Sem compartilhamento**
- Nenhum dado é compartilhado publicamente
- Outros usuários não veem sua coleção

✅ **Controle Total**
- Você pode deletar tudo em qualquer momento
- Logs de acesso disponíveis

---

## 📲 Testando no Celular

### Android
1. Abrir em Chrome
2. Autenticar com Google/GitHub
3. Adicionar/editar um jogo
4. Abrir em outro dispositivo
5. ✅ Dados aparecem automaticamente!

### iPhone
1. Abrir em Safari
2. Autenticar
3. Mesmo fluxo
4. Sincronização automática

---

## ⚠️ Troubleshooting

### "Erro ao autenticar"
- Verificar conexão internet
- Limpar cookies/cache
- Tentar outro método (Google vs GitHub)

### "Dados não sincronizam"
- Verificar se está logado (avatar deve aparecer)
- Recarregar a página
- Verificar console (F12) para erros

### "Dados duplicados"
- Merge automático resolveu
- Versão mais recente vence sempre

---

## 🚀 Próximas Features

- [ ] Compartilhamento de coleção (link público)
- [ ] Sincronização com múltiplas contas
- [ ] Histórico de edições
- [ ] Sincronização seletiva
- [ ] Exportação agendada para Google Drive

---

## 📞 Precisa de Ajuda?

**Console Debug:**
```javascript
// Ver usuário atual
console.log(window.currentUser);

// Ver se está sincronizando
console.log(window.isSyncEnabled);

// Forçar resync
syncAllDataToFirebase();
```

---

**🎮 Agora seus dados estão sempre seguros e sincronizados na nuvem! ☁️**

**Última atualização:** 4 de junho de 2026  
**Versão:** 2.0.0 (com Firebase)

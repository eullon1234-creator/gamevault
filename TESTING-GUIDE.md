# 🧪 Guia de Teste - Firebase + GameVault

## ✅ Checklist Rápido

Siga esses passos para validar se tudo está funcionando:

---

## 1️⃣ Verificar Carregamento (F12 - Console)

Abra o navegador com **F12** e vá para a aba **Console**.

Digite:
```javascript
console.log('Firebase App:', firebaseApp);
console.log('Auth:', auth);
console.log('Firestore:', db);
```

**Resultado esperado:**
```
Firebase App: {…}  (objeto Firebase)
Auth: Auth {…}     (objeto Auth)
Firestore: {…}     (objeto Firestore)
```

Se tudo aparecer, ✅ **Firebase carregou corretamente!**

---

## 2️⃣ Testar Login com Google

1. Abrir o app
2. No header, clicar no botão **🔴 Google**
3. Popup de login do Google deve aparecer
4. Entrar com sua conta Google
5. Voltar para o app

**Verificar:**
```javascript
console.log(currentUser);  // Deve mostrar seu usuário
```

---

## 3️⃣ Testar Adicionar Jogo & Sincronizar

1. Com a conta Google logada
2. Clicar **➕ Adicionar Jogo**
3. Preencher dados:
   - Nome: **Persona 5**
   - Plataforma: **PS5**
   - Status: **jogando**
   - Rating: **9**
4. Clicar **Salvar**

**Verificar no Firebase Console:**
1. Ir para https://console.firebase.google.com
2. Projeto: **game-historia-2026**
3. Firestore Database
4. Collection: `users` → seu **UID** → `games`
5. ✅ Deve ter o documento com "Persona 5"

---

## 4️⃣ Testar Multi-Device Sync

**Setup:**
- Abrir app em 2 abas diferentes (Ctrl+T)
- Ambas autenticadas com a mesma conta Google

**Teste:**
1. **Aba 1:** Clique **➕ Adicionar Jogo**
2. **Aba 1:** Adicione "Hades" com Rating 8
3. **Aba 1:** Salve
4. **Aba 2:** Aguarde 1-2 segundos
5. ✅ **Aba 2:** "Hades" deve aparecer automaticamente!

---

## 5️⃣ Testar Editar & Confirmar Update

1. **Aba 1:** Clique em "Hades"
2. **Aba 1:** Altere o Rating de 8 → 10
3. **Aba 1:** Salve
4. **Aba 2:** Observe a mudança em tempo real
5. ✅ Rating atualizado para 10

---

## 6️⃣ Testar Deletar

1. **Aba 1:** Clique no botão ❌ do jogo "Persona 5"
2. **Aba 1:** Confirme a deleção
3. **Aba 2:** Aguarde 1-2 segundos
4. ✅ "Persona 5" desaparece de ambas as abas

---

## 7️⃣ Testar Offline → Online

1. Abrir **DevTools** (F12)
2. Ir para a aba **Network**
3. Procurar por checkbox **Offline**
4. ✅ Marcar "Offline"

**Agora offline:**
1. Clicar **➕ Adicionar Jogo**
2. Adicionar "Kirby"
3. Salvar

**Verificar:**
```javascript
console.log(db.app.firestore().enablePersistence);  // Persistence ativo
```

**Agora reconectar:**
1. Desmarcar checkbox **Offline**
2. ✅ Após 2-3 segundos, verá toast "✅ Sincronizado"
3. Firebase Console: "Kirby" deve estar lá

---

## 8️⃣ Testar Logout

1. Encontrar o botão de Logout (avatar no header ou menu)
2. Clicar **Sair**
3. ✅ Botões "🔴 Google" e "⚫ GitHub" devem voltar

---

## 🔍 Verificação Completa (Console)

Copie e execute isso no Console (F12):

```javascript
console.log('=== GAME VAULT - FIREBASE STATUS ===');
console.log('Firebase iniciado:', !!firebaseApp);
console.log('Auth iniciado:', !!auth);
console.log('Firestore iniciado:', !!db);
console.log('Usuário logado:', currentUser?.email || 'Não');
console.log('Sync habilitado:', isSyncEnabled);
console.log('IndexedDB:', typeof indexedDB !== 'undefined' ? 'Disponível' : 'Não disponível');
console.log('Service Worker:', 'serviceWorker' in navigator ? 'Suportado' : 'Não suportado');
```

**Resultado esperado:**
```
=== GAME VAULT - FIREBASE STATUS ===
Firebase iniciado: true
Auth iniciado: true
Firestore iniciado: true
Usuário logado: seu@email.com  (ou 'Não' se logout)
Sync habilitado: true
IndexedDB: Disponível
Service Worker: Suportado
```

---

## 📊 Métricas de Sucesso

| Teste | Status | Notas |
|-------|--------|-------|
| Firebase carrega | ✅ | Deve aparecer no Console |
| Google login | ✅ | Popup deve abrir |
| Jogo salvo no Firebase | ✅ | Visível no Firebase Console |
| Multi-device sync | ✅ | Mudanças aparecem em tempo real |
| Offline → online | ✅ | Sincroniza após reconectar |
| Logout | ✅ | Botões de login reaparecem |

---

## 🚀 Status Geral

Se todos os 8 testes passarem:

```
✅ Firebase configurado corretamente
✅ Autenticação funcionando
✅ Sincronização em tempo real ok
✅ Offline support ok
✅ App pronto para produção
```

---

## 💡 Dicas de Debug

### Se algo não funcionar:

1. **Abra F12 e procure por erros vermelhos**
   ```
   ❌ Se ver erro de CORS → Adicionar domínio no Firebase
   ❌ Se ver erro 403 → Verificar Firestore Rules
   ❌ Se ver erro de rede → Verificar conexão internet
   ```

2. **Limpe cache do navegador**
   ```
   F12 → Application → Storage → Clear site data
   ```

3. **Recarregue a página**
   ```
   Ctrl+Shift+R (força reload sem cache)
   ```

4. **Verifique o Firebase Console**
   ```
   https://console.firebase.google.com
   Projeto: game-historia-2026
   Abas: Firestore, Authentication, Realtime Database
   ```

---

## 📞 Rastreando Erros

Se encontrar erro, procure por isso no Console:

```javascript
// Ver todos os erros
console.log(window.errors || 'Nenhum erro registrado');

// Forçar resync
syncAllDataToFirebase().then(() => console.log('Resync completo!'));

// Verificar dados locais (IndexedDB)
db.games.toArray().then(games => console.log('Jogos locais:', games));
```

---

## ✨ Próximas Features (Não Testadas Ainda)

- [ ] Avatar do usuário no header
- [ ] Indicador de status "Online/Offline/Sincronizando"
- [ ] Compartilhamento de coleção (link público)
- [ ] Histórico de edições
- [ ] Sincronização seletiva

---

**Boa sorte nos testes! 🎮☁️**

Se algo não funcionar, verifique se todas as mudanças foram salvas e recarregue a página.

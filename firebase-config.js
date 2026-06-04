// ==========================================
// FIREBASE CONFIG
// ==========================================

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBFT-w8XVq7w9N7WlOIsWXSI15bM2T1HiM",
  authDomain: "game-historia-2026.firebaseapp.com",
  projectId: "game-historia-2026",
  storageBucket: "game-historia-2026.firebasestorage.app",
  messagingSenderId: "285111086961",
  appId: "1:285111086961:web:75c8de7d4ca1696f7650d0",
  measurementId: "G-4EEDWTGLYZ"
};

// Initialize Firebase
let firebaseApp;
let db;
let auth;
let currentUser = null;
let isSyncEnabled = false;

function initFirebase() {
  try {
    // Initialize Firebase
    firebaseApp = firebase.initializeApp(firebaseConfig);
    
    // Initialize Firebase Authentication and get a reference to the service
    auth = firebase.auth(firebaseApp);
    
    // Initialize Cloud Firestore and get a reference to the service
    db = firebase.firestore(firebaseApp);
    
    // Enable persistence
    db.enablePersistence()
      .catch((err) => {
        if (err.code == 'failed-precondition') {
          console.log('📴 Múltiplas abas abertas, persistence desativado');
        } else if (err.code == 'unimplemented') {
          console.log('⚠️ Browser não suporta persistence');
        }
      });

    // Listen to auth changes
    auth.onAuthStateChanged((user) => {
      currentUser = user;
      updateAuthUI();
      if (user) {
        console.log('✅ Usuário autenticado:', user.email);
        isSyncEnabled = true;
        setupFirebaseSync();
      } else {
        console.log('❌ Usuário desconectado');
        isSyncEnabled = false;
      }
    });

    console.log('🔥 Firebase inicializado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao inicializar Firebase:', error);
  }
}

// ==========================================
// AUTHENTICATION
// ==========================================

function signInWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  
  auth.signInWithPopup(provider)
    .then((result) => {
      const user = result.user;
      showToast(`👋 Bem-vindo, ${user.displayName}!`, 'success');
      syncAllDataToFirebase();
    })
    .catch((error) => {
      console.error('❌ Erro de autenticação:', error);
      showToast('❌ Erro ao autenticar com Google', 'error');
    });
}

function signInWithGitHub() {
  const provider = new firebase.auth.GithubAuthProvider();
  
  auth.signInWithPopup(provider)
    .then((result) => {
      const user = result.user;
      showToast(`👋 Bem-vindo, ${user.displayName || user.email}!`, 'success');
      syncAllDataToFirebase();
    })
    .catch((error) => {
      console.error('❌ Erro de autenticação:', error);
      showToast('❌ Erro ao autenticar com GitHub', 'error');
    });
}

function signOut() {
  if (confirm('Tem certeza que deseja sair?')) {
    auth.signOut()
      .then(() => {
        currentUser = null;
        isSyncEnabled = false;
        showToast('👋 Desconectado com sucesso!', 'info');
        updateAuthUI();
      })
      .catch((error) => {
        console.error('❌ Erro ao desconectar:', error);
      });
  }
}

function updateAuthUI() {
  const authContainer = document.getElementById('authContainer');
  
  if (currentUser) {
    authContainer.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;color:var(--text2);">
        <img src="${currentUser.photoURL || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22%3E%3Ccircle cx=%2212%22 cy=%2212%22 r=%2210%22 fill=%22%23999%22/%3E%3C/svg%3E'}" 
             alt="Avatar" 
             style="width:32px;height:32px;border-radius:50%;border:2px solid var(--neon);">
        <div style="font-size:.85rem;">
          <div style="font-weight:600;color:var(--text);">${currentUser.displayName || currentUser.email}</div>
          <div style="font-size:.75rem;color:var(--text3);">☁️ Sincronizando</div>
        </div>
        <button class="btn btn-sm btn-outline" onclick="signOut()" style="margin-left:8px">Sair</button>
      </div>
    `;
  } else {
    authContainer.innerHTML = `
      <div style="display:flex;gap:6px;flex-wrap:wrap;">
        <button class="btn btn-sm btn-primary" onclick="signInWithGoogle()" style="background:linear-gradient(135deg, #4285F4, #34A853);">
          🔴 Google
        </button>
        <button class="btn btn-sm btn-primary" onclick="signInWithGitHub()" style="background:#333;">
          ⚫ GitHub
        </button>
      </div>
    `;
  }
}

// ==========================================
// FIREBASE SYNC
// ==========================================

function setupFirebaseSync() {
  if (!currentUser || !db) return;

  const userGamesRef = db.collection('users').doc(currentUser.uid).collection('games');
  const userPlatformsRef = db.collection('users').doc(currentUser.uid).collection('platforms');

  // Real-time listener para games
  userGamesRef.onSnapshot((querySnapshot) => {
    const firebaseGames = [];
    querySnapshot.forEach((doc) => {
      firebaseGames.push({ ...doc.data(), firebaseId: doc.id });
    });

    // Mesclar com dados locais (Firebase tem prioridade)
    mergeGamesData(firebaseGames);
  }, (error) => {
    console.error('❌ Erro ao sincronizar games:', error);
  });

  // Real-time listener para platforms
  userPlatformsRef.onSnapshot((querySnapshot) => {
    const firebasePlatforms = [];
    querySnapshot.forEach((doc) => {
      firebasePlatforms.push(doc.data());
    });

    if (firebasePlatforms.length > 0) {
      platforms = firebasePlatforms;
      populatePlatformDropdowns();
      updateDashboard();
      renderGames();
    }
  }, (error) => {
    console.error('❌ Erro ao sincronizar plataformas:', error);
  });
}

function mergeGamesData(firebaseGames) {
  // Sincronizar com dados locais
  const localGameIds = games.map(g => g.id);
  const firebaseGameIds = firebaseGames.map(g => g.id);

  // Adicionar games do Firebase que não existem localmente
  firebaseGames.forEach(fgame => {
    const exists = games.find(g => g.id === fgame.id);
    if (!exists) {
      games.push(fgame);
    } else {
      // Atualizar com versão do Firebase (mais recente)
      const idx = games.findIndex(g => g.id === fgame.id);
      if (idx !== -1) {
        // Comparar timestamp
        if ((fgame.lastUpdated || 0) > (games[idx].lastUpdated || 0)) {
          games[idx] = fgame;
        }
      }
    }
  });

  // Remover games locais que foram deletados no Firebase
  games = games.filter(g => firebaseGameIds.includes(g.id) || !g.firebaseId);

  saveData().then(() => {
    updateDashboard();
    populateGenreFilter();
    renderGames();
  });
}

function syncAllDataToFirebase() {
  if (!currentUser || !db) return;

  console.log('🔄 Sincronizando todos os dados com Firebase...');

  // Upload games
  const userGamesRef = db.collection('users').doc(currentUser.uid).collection('games');
  games.forEach(game => {
    const gameData = {
      ...game,
      lastUpdated: Date.now(),
      syncedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    userGamesRef.doc(String(game.id)).set(gameData, { merge: true })
      .catch(err => console.error('❌ Erro ao sync game:', err));
  });

  // Upload platforms
  const userPlatformsRef = db.collection('users').doc(currentUser.uid).collection('platforms');
  platforms.forEach((platform, idx) => {
    userPlatformsRef.doc(String(idx)).set(platform, { merge: true })
      .catch(err => console.error('❌ Erro ao sync platform:', err));
  });

  showToast('☁️ Dados sincronizados com sucesso!', 'success');
}

function uploadGameToFirebase(gameId) {
  if (!currentUser || !db || !isSyncEnabled) return;

  const game = games.find(g => g.id === gameId);
  if (!game) return;

  const gameData = {
    ...game,
    lastUpdated: Date.now(),
    syncedAt: firebase.firestore.FieldValue.serverTimestamp()
  };

  db.collection('users')
    .doc(currentUser.uid)
    .collection('games')
    .doc(String(gameId))
    .set(gameData, { merge: true })
    .then(() => console.log('✅ Game sincronizado:', game.name))
    .catch(err => console.error('❌ Erro ao sync game:', err));
}

function deleteGameFromFirebase(gameId) {
  if (!currentUser || !db || !isSyncEnabled) return;

  db.collection('users')
    .doc(currentUser.uid)
    .collection('games')
    .doc(String(gameId))
    .delete()
    .then(() => console.log('✅ Game deletado do Firebase'))
    .catch(err => console.error('❌ Erro ao deletar:', err));
}

function downloadBackupFromFirebase() {
  if (!currentUser || !db) {
    showToast('❌ Você precisa estar autenticado!', 'error');
    return;
  }

  const userRef = db.collection('users').doc(currentUser.uid);

  Promise.all([
    userRef.collection('games').get(),
    userRef.collection('platforms').get()
  ]).then(([gamesSnap, platformsSnap]) => {
    const backupData = {
      games: [],
      platforms: [],
      backup_date: new Date().toISOString(),
      user: currentUser.email
    };

    gamesSnap.forEach(doc => {
      backupData.games.push(doc.data());
    });

    platformsSnap.forEach(doc => {
      backupData.platforms.push(doc.data());
    });

    // Download JSON
    const dataStr = JSON.stringify(backupData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gamevault_backup_firebase_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);

    showToast('📥 Backup baixado com sucesso!', 'success');
  }).catch(err => {
    console.error('❌ Erro ao baixar backup:', err);
    showToast('❌ Erro ao baixar backup', 'error');
  });
}

// ==========================================
// SYNC HOOKS (chamar após cada alteração)
// ==========================================

// Interceptar saveGame
const originalSaveGame = window.saveGame;
window.saveGame = function() {
  originalSaveGame.call(this);
  
  if (currentUser && editingId) {
    uploadGameToFirebase(editingId);
  }
};

// Interceptar deleteGame
const originalDeleteGame = window.deleteGame;
window.deleteGame = function(id) {
  if (currentUser) {
    deleteGameFromFirebase(id);
  }
  originalDeleteGame.call(this, id);
};

// Interceptar toggleFav
const originalToggleFav = window.toggleFav;
window.toggleFav = function(id) {
  originalToggleFav.call(this, id);
  
  if (currentUser) {
    uploadGameToFirebase(id);
  }
};

// Interceptar markComplete
const originalMarkComplete = window.markComplete;
window.markComplete = function(id) {
  originalMarkComplete.call(this, id);
  
  if (currentUser) {
    uploadGameToFirebase(id);
  }
};

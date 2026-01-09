import { useState, useEffect, useRef, useCallback } from 'react';

const AdminDashboard = () => {
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [token, setToken] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  
  // ✅ MODALE SUPPRESSION
  const [deleteModal, setDeleteModal] = useState({ show: false, messageId: null, messageData: null });
  
  // ✅ MODALE INACTIVITÉ
  const [idleModal, setIdleModal] = useState(false);

  // ✅ SUPPRIME ADMIN_EMAIL/PASSWORD inutilisés
  // const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;
  // const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;
  
  // ✅ TIMERS INACTIVITÉ - FIX MULTIPLES TIMERS
  const idleWarningRef = useRef();
  const idleLogoutRef = useRef();
  const IDLE_WARNING = 1 * 60 * 1000;
  const IDLE_LOGOUT = 1.5 * 60 * 1000;

  // ✅ handleAutoLogout stable
  const handleAutoLogout = useCallback(() => {
    sessionStorage.removeItem('adminToken');
    setToken('');
    setIsLoggedIn(false);
    setMessages([]);
    setIdleModal(false);
  }, []);

  // ✅ resetTimer CORRIGÉ - un seul endroit pour les timers
  const resetTimer = useCallback(() => {
    // Clear tous les timers existants
    clearTimeout(idleWarningRef.current);
    clearTimeout(idleLogoutRef.current);

    // Nouveau timer warning
    idleWarningRef.current = setTimeout(() => {
      setIdleModal(true);
    }, IDLE_WARNING);
    
    // Nouveau timer logout
    idleLogoutRef.current = setTimeout(() => {
      handleAutoLogout();
    }, IDLE_LOGOUT);
  }, [IDLE_WARNING, IDLE_LOGOUT, handleAutoLogout]);

  // ✅ useEffect INACTIVITÉ - SIMPLIFIÉ
  useEffect(() => {
    if (!isLoggedIn) return;

    const handleActivity = () => {
      setIdleModal(false);
      resetTimer(); // ✅ Un seul reset
    };

    // Ajout listeners
    ['mousemove', 'keydown', 'click', 'scroll'].forEach(event =>
      window.addEventListener(event, handleActivity, true)
    );

    // Premier reset
    resetTimer();

    return () => {
      clearTimeout(idleWarningRef.current);
      clearTimeout(idleLogoutRef.current);
      ['mousemove', 'keydown', 'click', 'scroll'].forEach(event =>
        window.removeEventListener(event, handleActivity, true)
      );
    };
  }, [isLoggedIn, resetTimer]);

  // ✅ fetchMessages CORRIGÉ - loadingMessages dédié
  const fetchMessages = useCallback(async (authToken) => {
    setLoadingMessages(true);
    try {
      const response = await fetch('http://localhost:5000/api/admin/messages', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      if (response.status === 401) {
        sessionStorage.removeItem('adminToken');
        setIsLoggedIn(false);
        setMessages([]);
        return;
      }
      
      if (!response.ok) throw new Error('Backend erreur');
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Admin fetch error:', error);
      sessionStorage.removeItem('adminToken');
      setIsLoggedIn(false);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  // ✅ useEffect token
  useEffect(() => {
    const savedToken = sessionStorage.getItem('adminToken');
    if (savedToken) {
      setToken(savedToken);
      setIsLoggedIn(true);
      fetchMessages(savedToken);
    }
  }, [fetchMessages]);

  const closeIdleModal = useCallback(() => {
    setIdleModal(false);
    resetTimer(); // ✅ Reset timers en fermant
  }, [resetTimer]);

  const handleLogout = useCallback(() => {
    sessionStorage.removeItem('adminToken');
    setToken('');
    setIsLoggedIn(false);
    setMessages([]);
    setIdleModal(false);
  }, []);

  const handleLogin = useCallback(async (e) => {
    e.preventDefault();
    setLoadingLogin(true);
    setLoginError('');
    try {
      const response = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });
      const data = await response.json();
      
      if (data.token) {
        sessionStorage.setItem('adminToken', data.token);
        setToken(data.token);
        setIsLoggedIn(true);
        setLoginData({ email: '', password: '' });
        fetchMessages(data.token);
      } else {
        setLoginError('❌ ' + (data.error || 'Erreur login'));
      }
    } catch {
      setLoginError('❌ Erreur serveur');
    } finally {
      setLoadingLogin(false);
    }
  }, [loginData, fetchMessages]);

  const openDeleteModal = useCallback((message) => {
    setDeleteModal({ 
      show: true, 
      messageId: message.id, 
      messageData: message 
    });
  }, []);

  const closeDeleteModal = useCallback(() => {
    setDeleteModal({ show: false, messageId: null, messageData: null });
  }, []);

  // ✅ FIX PRINCIPAL: confirmDeleteMessage ROBUSTE
  const confirmDeleteMessage = useCallback(async () => {
    if (!deleteModal.messageId || !token) return;
    
    const messageIdToDelete = deleteModal.messageId;
    
    // SUPPRESSION OPTIMISTE
    setMessages(prevMessages => prevMessages.filter(msg => msg.id !== messageIdToDelete));
    
    try {
      const response = await fetch(`http://localhost:5000/api/contact/${messageIdToDelete}`, {
        method: 'DELETE',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // ✅ FIX: Accepte TOUS les 2xx (200, 204, 202...)
      if (response.status >= 400) {
        const errorText = await response.text();
        console.error('❌ Backend delete failed:', response.status, errorText);
        
        // ROLLBACK
        fetchMessages(token);
        alert(`❌ Erreur ${response.status} - message restauré`);
        return;
      }

      // ✅ SUCCÈS (tous les 2xx)
      console.log('✅ Message supprimé avec succès:', response.status);
      
    } catch (error) {
      console.error('❌ Delete network error:', error);
      fetchMessages(token);
      alert('❌ Erreur réseau - message restauré');
      return;
    }
    
    closeDeleteModal();
  }, [deleteModal.messageId, token, fetchMessages, closeDeleteModal]);

  const replyToMessage = useCallback((message) => {
    const subject = `Re: Message de ${message.firstname} ${message.lastname}`;
    const body = `Bonjour ${message.firstname},\n\nConcernant votre message:\n"${message.message}"\n\n`;
    window.open(`mailto:${message.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  }, []);

  if (!isLoggedIn) {
    return (
      <div className="admin-login">
        <div className="login-card">
          <h2>🔐 Admin Login</h2>
          <form onSubmit={handleLogin} className="login-form">
            <input
              type="email"
              placeholder="Email admin"
              value={loginData.email}
              onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
              required
              disabled={loadingLogin}
            />
            <input
              type="password"
              placeholder="Mot de passe"
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              required
              disabled={loadingLogin}
            />
            {loginError && <p className="login-error">{loginError}</p>}
            <button type="submit" className="btn-primary" disabled={loadingLogin}>
              {loadingLogin ? '⏳ Connexion...' : 'Se connecter'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="admin-dashboard">
        <div className="admin-header">
          <h1>📊 Admin Dashboard ({messages.length} messages)</h1>
          <button onClick={handleLogout} className="btn-secondary">🚪 Déconnexion</button>
        </div>
        
        {loadingMessages ? (
          <div className="admin-loading">
            <div>⏳ Chargement des messages...</div>
            <div className="spinner"></div>
          </div>
        ) : (
          <>
            <div className="messages-grid">
              {messages.map((msg) => (
                <div key={msg.id} className="message-card">
                  <div className="message-header">
                    <h3>{msg.firstname} {msg.lastname}</h3>
                    <span className="message-date">
                      {new Date(msg.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <p className="message-email">{msg.email}</p>
                  <p className="message-text">{msg.message}</p>
                  <div className="message-actions">
                    <button 
                      onClick={() => replyToMessage(msg)}
                      className="btn-reply"
                      title="Répondre"
                    >
                      📧 Répondre
                    </button>
                    <button 
                      onClick={() => openDeleteModal(msg)}
                      className="btn-danger"
                      title="Supprimer"
                    >
                      🗑️ Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {messages.length === 0 && (
              <div className="no-messages">
                <p>📭 Aucun message pour le moment</p>
                <button onClick={() => fetchMessages(token)} className="btn-primary">
                  🔁 Recharger
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* MODALE SUPPRESSION */}
      {deleteModal.show && (
        <div className="modal-overlay" onClick={closeDeleteModal}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <h3>⚠️ Confirmer suppression</h3>
            <p>Supprimer le message de <strong>{deleteModal.messageData?.firstname} {deleteModal.messageData?.lastname}</strong> ?</p>
            <p className="modal-message-preview">
              {deleteModal.messageData?.message?.substring(0, 100)}...
            </p>
            <div className="modal-actions">
              <button onClick={closeDeleteModal} className="btn-secondary">Annuler</button>
              <button onClick={confirmDeleteMessage} className="btn-danger">🗑️ Supprimer</button>
            </div>
          </div>
        </div>
      )}

      {/* MODALE INACTIVITÉ */}
      {idleModal && (
        <div className="modal-overlay" onClick={closeIdleModal}>
          <div className="idle-modal" onClick={(e) => e.stopPropagation()}>
            <h3>⏰ Inactivité détectée</h3>
            <p>Vous serez déconnecté dans <strong>30 secondes</strong>.</p>
            <p className="idle-hint">Bougez la souris ou appuyez sur une touche pour continuer...</p>
            <div className="modal-actions">
              <button onClick={handleLogout} className="btn-secondary">Se déconnecter</button>
              <button onClick={closeIdleModal} className="btn-primary">Rester connecté</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminDashboard;

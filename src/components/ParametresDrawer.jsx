import { useState } from 'react';
import { toast } from 'react-toastify';
import { themes, applyTheme } from '../themes';
import api from '../services/api';
import './ParametresDrawer.css';

const ParametresDrawer = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('boutique');
  const [darkMode, setDarkMode] = useState(false);
  const [activeTheme, setActiveTheme] = useState(
    localStorage.getItem('theme') || 'rose'
  );
  const [boutique, setBoutique] = useState(() => {
    const saved = localStorage.getItem('boutique');
    return saved ? JSON.parse(saved) : {
      nom: "KANDIOU'S Fashion",
      adresse: 'Conakry, Guinée',
      telephone: '+224 622 000 000',
      email: 'kandious@fashion.gn',
      devise: 'GNF',
      tva: '18',
      description: 'Boutique de vêtements féminins'
    };
  });

  const [pwdForm, setPwdForm] = useState({
    nouveau: '', confirmer: ''
  });
  const [pwdLoading, setPwdLoading] = useState(false);
  const [showNouveau, setShowNouveau] = useState(false);
  const [showConfirmer, setShowConfirmer] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleSaveBoutique = (e) => {
    e.preventDefault();
    localStorage.setItem('boutique', JSON.stringify(boutique));
    toast.success('✅ Informations sauvegardées !');
  };

  const handleTheme = (themeKey) => {
    setActiveTheme(themeKey);
    applyTheme(themeKey);
    toast.success(`${themes[themeKey].name} appliqué !`);
  };

  const handleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.body.style.filter = 'invert(1) hue-rotate(180deg)';
      document.querySelectorAll('img').forEach(img => {
        img.style.filter = 'invert(1) hue-rotate(180deg)';
      });
    } else {
      document.body.style.filter = '';
      document.querySelectorAll('img').forEach(img => {
        img.style.filter = '';
      });
    }
    toast.info(newMode ? '🌙 Mode sombre activé' : '☀️ Mode clair activé');
  };

  const handleChangerMotDePasse = async (e) => {
    e.preventDefault();

    if (pwdForm.nouveau.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    if (pwdForm.nouveau !== pwdForm.confirmer) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    setPwdLoading(true);
    try {
      await api.put(`/utilisateurs/${user.id}/mot-de-passe`, {
        motDePasse: pwdForm.nouveau
      });
      toast.success('✅ Mot de passe modifié avec succès !');
      setPwdForm({ nouveau: '', confirmer: '' });
    } catch {
      toast.error('Erreur lors du changement de mot de passe');
    } finally {
      setPwdLoading(false);
    }
  };

  const tabs = [
    { id: 'boutique', icon: '🏪', label: 'Boutique' },
    { id: 'apparence', icon: '🎨', label: 'Apparence' },
    { id: 'compte', icon: '👤', label: 'Mon compte' },
    { id: 'notifications', icon: '🔔', label: 'Notifications' },
    { id: 'securite', icon: '🔒', label: 'Sécurité' },
    { id: 'donnees', icon: '💾', label: 'Données' },
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className="drawer-overlay" onClick={onClose} />
      )}

      {/* Drawer */}
      <div className={`drawer ${isOpen ? 'open' : ''}`}>

        {/* Header drawer */}
        <div className="drawer-header">
          <div>
            <h2>⚙️ Paramètres</h2>
            <p>Configurez votre application</p>
          </div>
          <button className="drawer-close" onClick={onClose}>✕</button>
        </div>

        <div className="drawer-layout">

          {/* Tabs sidebar */}
          <div className="drawer-tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`drawer-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-label">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Contenu */}
          <div className="drawer-content">

            {/* Boutique */}
            {activeTab === 'boutique' && (
              <div className="drawer-section">
                <h3>🏪 Informations de la boutique</h3>
                <p className="section-desc">
                  Apparaissent sur vos factures PDF
                </p>
                <form onSubmit={handleSaveBoutique}>
                  <div className="field-group">
                    <label>Nom de la boutique</label>
                    <input type="text" value={boutique.nom}
                      onChange={e => setBoutique({
                        ...boutique, nom: e.target.value
                      })} />
                  </div>
                  <div className="field-row">
                    <div className="field-group">
                      <label>Téléphone</label>
                      <input type="text" value={boutique.telephone}
                        onChange={e => setBoutique({
                          ...boutique, telephone: e.target.value
                        })} />
                    </div>
                    <div className="field-group">
                      <label>Email</label>
                      <input type="email" value={boutique.email}
                        onChange={e => setBoutique({
                          ...boutique, email: e.target.value
                        })} />
                    </div>
                  </div>
                  <div className="field-group">
                    <label>Adresse</label>
                    <input type="text" value={boutique.adresse}
                      onChange={e => setBoutique({
                        ...boutique, adresse: e.target.value
                      })} />
                  </div>
                  <div className="field-row">
                    <div className="field-group">
                      <label>Devise</label>
                      <select value={boutique.devise}
                        onChange={e => setBoutique({
                          ...boutique, devise: e.target.value
                        })}>
                        <option value="GNF">GNF — Franc Guinéen</option>
                        <option value="EUR">EUR — Euro</option>
                        <option value="USD">USD — Dollar</option>
                        <option value="XOF">XOF — Franc CFA</option>
                      </select>
                    </div>
                    <div className="field-group">
                      <label>TVA par défaut (%)</label>
                      <input type="number" value={boutique.tva}
                        onChange={e => setBoutique({
                          ...boutique, tva: e.target.value
                        })} />
                    </div>
                  </div>
                  <button type="submit" className="save-btn">
                    💾 Sauvegarder
                  </button>
                </form>
              </div>
            )}

            {/* Apparence */}
            {activeTab === 'apparence' && (
              <div className="drawer-section">
                <h3>🎨 Thèmes</h3>
                <p className="section-desc">
                  Choisissez un thème pour toute l'application
                </p>

                <div className="themes-grid">
                  {Object.entries(themes).map(([key, theme]) => (
                    <div
                      key={key}
                      className={`theme-card ${activeTheme === key
                        ? 'active' : ''}`}
                      onClick={() => handleTheme(key)}
                    >
                      <div className="theme-preview">
                        <div className="theme-bar"
                          style={{ background: theme.navbar }} />
                        <div className="theme-btn"
                          style={{ background: theme.primary }} />
                        <div className="theme-bg"
                          style={{ background: theme.background }} />
                      </div>
                      <p>{theme.name}</p>
                      {activeTheme === key && (
                        <span className="theme-check">✓</span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="divider" />

                <h3>🌙 Mode d'affichage</h3>
                <div className="toggle-row">
                  <div>
                    <p className="toggle-title">
                      {darkMode ? '🌙 Mode sombre' : '☀️ Mode clair'}
                    </p>
                    <p className="toggle-desc">
                      {darkMode
                        ? 'Interface sombre activée'
                        : 'Interface claire activée'}
                    </p>
                  </div>
                  <div
                    className={`toggle-switch ${darkMode ? 'on' : ''}`}
                    onClick={handleDarkMode}
                  >
                    <div className="toggle-knob" />
                  </div>
                </div>
              </div>
            )}

            {/* Mon compte */}
            {activeTab === 'compte' && (
              <div className="drawer-section">
                <h3>👤 Mon compte</h3>
                <div className="profile-card">
                  <div className="profile-avatar">
                    {user.prenom?.[0]}{user.nom?.[0]}
                  </div>
                  <div className="profile-info">
                    <h4>{user.prenom} {user.nom}</h4>
                    <p>{user.email}</p>
                    <span className="role-pill">{user.role}</span>
                  </div>
                </div>

                <div className="divider" />

                <h3>🔑 Changer le mot de passe</h3>
                <p className="section-desc">
                  Choisissez un nouveau mot de passe sécurisé
                </p>

                <form onSubmit={handleChangerMotDePasse}>
                  <div className="field-group">
                    <label>Nouveau mot de passe</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showNouveau ? 'text' : 'password'}
                        value={pwdForm.nouveau}
                        onChange={e => setPwdForm({
                          ...pwdForm, nouveau: e.target.value
                        })}
                        placeholder="Au moins 6 caractères"
                        required
                        style={{ paddingRight: '40px', width: '100%' }}
                      />
                      <span
                        onClick={() => setShowNouveau(!showNouveau)}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          cursor: 'pointer',
                          fontSize: '16px',
                          userSelect: 'none',
                        }}
                      >
                        {showNouveau ? '🙈' : '👁️'}
                      </span>
                    </div>
                  </div>

                  <div className="field-group">
                    <label>Confirmer le mot de passe</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showConfirmer ? 'text' : 'password'}
                        value={pwdForm.confirmer}
                        onChange={e => setPwdForm({
                          ...pwdForm, confirmer: e.target.value
                        })}
                        placeholder="Retapez le mot de passe"
                        required
                        style={{ paddingRight: '40px', width: '100%' }}
                      />
                      <span
                        onClick={() => setShowConfirmer(!showConfirmer)}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          cursor: 'pointer',
                          fontSize: '16px',
                          userSelect: 'none',
                        }}
                      >
                        {showConfirmer ? '🙈' : '👁️'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="save-btn"
                    disabled={pwdLoading}
                  >
                    {pwdLoading
                      ? '⏳ Modification...'
                      : '🔑 Changer le mot de passe'}
                  </button>
                </form>
              </div>
            )}

            {/* Notifications */}
            {activeTab === 'notifications' && (
              <div className="drawer-section">
                <h3>🔔 Notifications</h3>
                <p className="section-desc">
                  Configurez vos alertes
                </p>
                {[
                  { label: 'Alerte rupture de stock', desc: 'Notifier quand stock = 0', default: true },
                  { label: 'Alerte stock bas', desc: 'Notifier quand stock ≤ seuil minimum', default: true },
                  { label: 'Nouvelle vente', desc: 'Notification à chaque vente validée', default: false },
                  { label: 'Nouveau client', desc: 'Notification à chaque nouveau client', default: false },
                ].map((notif, i) => (
                  <NotifToggle key={i} {...notif} />
                ))}
              </div>
            )}

            {/* Sécurité */}
            {activeTab === 'securite' && (
              <div className="drawer-section">
                <h3>🔒 Sécurité</h3>
                <p className="section-desc">
                  Gérez la sécurité de votre compte
                </p>
                <div className="security-info">
                  <div className="security-item">
                    <span>🔑</span>
                    <div>
                      <p>Authentification JWT</p>
                      <small>Token expire dans 24h</small>
                    </div>
                    <span className="badge-green">Actif</span>
                  </div>
                  <div className="security-item">
                    <span>🛡️</span>
                    <div>
                      <p>Chiffrement BCrypt</p>
                      <small>Mots de passe hashés</small>
                    </div>
                    <span className="badge-green">Actif</span>
                  </div>
                  <div className="security-item">
                    <span>🔐</span>
                    <div>
                      <p>CORS configuré</p>
                      <small>Origines autorisées seulement</small>
                    </div>
                    <span className="badge-green">Actif</span>
                  </div>
                </div>
              </div>
            )}

            {/* Données */}
            {activeTab === 'donnees' && (
              <div className="drawer-section">
                <h3>💾 Gestion des données</h3>
                <p className="section-desc">
                  Exportez et sauvegardez vos données
                </p>
                <div className="data-actions">
                  <div className="data-card">
                    <span>📊</span>
                    <div>
                      <p>Export Excel</p>
                      <small>Disponible depuis la page Ventes</small>
                    </div>
                    <button className="save-btn small" onClick={() =>
                      toast.info("Cliquez sur 'Exporter Excel' dans la page Ventes")}>
                      Voir
                    </button>
                  </div>
                  <div className="data-card">
                    <span>🗄️</span>
                    <div>
                      <p>Sauvegarde SQL</p>
                      <small>Export de la base de données</small>
                    </div>
                    <button className="save-btn small" onClick={() =>
                      toast.info('Faites un dump depuis DBeaver')}>
                      Exporter
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
};

// Composant toggle notification
const NotifToggle = ({ label, desc, default: defaultVal }) => {
  const [active, setActive] = useState(defaultVal);
  return (
    <div className="toggle-row">
      <div>
        <p className="toggle-title">{label}</p>
        <p className="toggle-desc">{desc}</p>
      </div>
      <div
        className={`toggle-switch ${active ? 'on' : ''}`}
        onClick={() => {
          setActive(!active);
          toast.info(`${label} ${!active ? 'activé' : 'désactivé'}`);
        }}
      >
        <div className="toggle-knob" />
      </div>
    </div>
  );
};

export default ParametresDrawer;
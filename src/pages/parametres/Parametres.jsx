import { useState } from 'react';
import { toast } from 'react-toastify';
import Navbar from '../../components/Navbar';


const Parametres = () => {
  const [activeTab, setActiveTab] = useState('boutique');
  const [darkMode, setDarkMode] = useState(false);
  const [boutique, setBoutique] = useState({
    nom: "KANDIOU'S Fashion",
    adresse: 'Conakry, Guinée',
    telephone: '+224 622 000 000',
    email: 'kandious@fashion.gn',
    devise: 'GNF',
    tva: '18',
    description: 'Boutique de vêtements féminins'
  });

  const handleSaveBoutique = (e) => {
    e.preventDefault();
    localStorage.setItem('boutique', JSON.stringify(boutique));
    toast.success('Informations sauvegardées !');
  };

  const handleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.style.background = !darkMode ? '#1a1a2e' : '#f5f5f5';
    document.body.style.color = !darkMode ? '#ffffff' : '#333333';
    toast.info(!darkMode ? '🌙 Mode sombre activé' : '☀️ Mode clair activé');
  };

  const tabs = [
    { id: 'boutique', label: '🏪 Boutique', },
    { id: 'apparence', label: '🎨 Apparence', },
    { id: 'compte', label: '👤 Mon compte', },
  ];

  return (
    <div className="page-container">
      <Navbar />

      <div className="page-content">
        <div className="page-header">
          <div>
            <h1>⚙️ Paramètres</h1>
            <p>Configurez votre application</p>
          </div>
        </div>

        <div className="parametres-layout">

          {/* Sidebar tabs */}
          <div className="param-sidebar">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`param-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Contenu */}
          <div className="param-content">

            {/* Tab Boutique */}
            {activeTab === 'boutique' && (
              <div className="param-card">
                <h2>🏪 Informations de la boutique</h2>
                <p className="param-subtitle">
                  Ces informations apparaîtront sur vos factures PDF
                </p>

                <form onSubmit={handleSaveBoutique} className="modal-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Nom de la boutique</label>
                      <input
                        type="text"
                        value={boutique.nom}
                        onChange={e => setBoutique({
                          ...boutique, nom: e.target.value
                        })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Devise</label>
                      <select
                        value={boutique.devise}
                        onChange={e => setBoutique({
                          ...boutique, devise: e.target.value
                        })}
                      >
                        <option value="GNF">GNF — Franc Guinéen</option>
                        <option value="EUR">EUR — Euro</option>
                        <option value="USD">USD — Dollar</option>
                        <option value="XOF">XOF — Franc CFA</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Téléphone</label>
                      <input
                        type="text"
                        value={boutique.telephone}
                        onChange={e => setBoutique({
                          ...boutique, telephone: e.target.value
                        })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        value={boutique.email}
                        onChange={e => setBoutique({
                          ...boutique, email: e.target.value
                        })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Adresse</label>
                    <input
                      type="text"
                      value={boutique.adresse}
                      onChange={e => setBoutique({
                        ...boutique, adresse: e.target.value
                      })}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>TVA par défaut (%)</label>
                      <input
                        type="number"
                        value={boutique.tva}
                        onChange={e => setBoutique({
                          ...boutique, tva: e.target.value
                        })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Description</label>
                      <input
                        type="text"
                        value={boutique.description}
                        onChange={e => setBoutique({
                          ...boutique, description: e.target.value
                        })}
                      />
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button type="submit" className="btn-primary">
                      💾 Sauvegarder
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Tab Apparence */}
            {activeTab === 'apparence' && (
              <div className="param-card">
                <h2>🎨 Apparence</h2>
                <p className="param-subtitle">
                  Personnalisez l'apparence de votre application
                </p>

                <div className="apparence-options">
                  {/* Dark Mode */}
                  <div className="option-card">
                    <div className="option-info">
                      <h3>{darkMode ? '🌙' : '☀️'} Mode d'affichage</h3>
                      <p>{darkMode
                        ? 'Mode sombre activé'
                        : 'Mode clair activé'}
                      </p>
                    </div>
                    <div
                      className={`toggle ${darkMode ? 'active' : ''}`}
                      onClick={handleDarkMode}
                    >
                      <div className="toggle-btn"></div>
                    </div>
                  </div>

                  {/* Couleurs thème */}
                  <div className="option-card">
                    <div className="option-info">
                      <h3>🎨 Couleur principale</h3>
                      <p>Couleur actuelle : Rose (#c2185b)</p>
                    </div>
                    <div className="color-options">
                      {[
                        { color: '#c2185b', label: 'Rose' },
                        { color: '#1565c0', label: 'Bleu' },
                        { color: '#2e7d32', label: 'Vert' },
                        { color: '#6a1b9a', label: 'Violet' },
                        { color: '#e65100', label: 'Orange' },
                      ].map(theme => (
                        <div
                          key={theme.color}
                          className="color-circle"
                          style={{ background: theme.color }}
                          title={theme.label}
                          onClick={() => {
                            document.documentElement.style
                              .setProperty('--primary', theme.color);
                            toast.success(
                              `Thème ${theme.label} appliqué !`
                            );
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Mon compte */}
            {activeTab === 'compte' && (
              <div className="param-card">
                <h2>👤 Mon compte</h2>
                <p className="param-subtitle">
                  Gérez vos informations personnelles
                </p>

                <div className="compte-info">
                  <div className="avatar">
                    👤
                  </div>
                  <div className="compte-details">
                    <h3>
                      {JSON.parse(localStorage.getItem('user') || '{}').prenom}
                      {' '}
                      {JSON.parse(localStorage.getItem('user') || '{}').nom}
                    </h3>
                    <p>
                      {JSON.parse(localStorage.getItem('user') || '{}').email}
                    </p>
                    <span className="role-badge">
                      {JSON.parse(localStorage.getItem('user') || '{}').role}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Parametres;
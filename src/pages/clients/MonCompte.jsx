import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';

const MonCompte = () => {
  const navigate = useNavigate();
  const [historique, setHistorique] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('profil');

  const user = JSON.parse(localStorage.getItem('clientUser') || '{}');
  const token = localStorage.getItem('clientToken');

  useEffect(() => {
    if (!token) {
      navigate('/connexion-client');
      return;
    }
    fetchHistorique();
  }, []);

  const fetchHistorique = async () => {
    try {
      const r = await api.get('/client/historique', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistorique(Array.isArray(r.data) ? r.data : []);
    } catch {
      toast.error('Erreur chargement historique');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('clientToken');
    localStorage.removeItem('clientUser');
    toast.info('Déconnexion réussie');
    navigate('/');
  };

  const formatMontant = (m) => {
    if (!m) return '0 GNF';
    return Math.round(m).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' GNF';
  };

  const getNiveauFidelite = (points) => {
    if (points >= 100) return { label: 'VIP', icon: '👑', color: '#d4af37' };
    if (points >= 50) return { label: 'Gold', icon: '🥇', color: '#d4af37' };
    if (points >= 20) return { label: 'Silver', icon: '🥈', color: '#aaa' };
    return { label: 'Nouveau', icon: '🆕', color: '#888' };
  };

  const niveau = getNiveauFidelite(user.pointsFidelite || 0);

  return (
    <div style={pageStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={logoBoxStyle}>
            <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '17px', fontWeight: 900, color: '#d4af37', fontStyle: 'italic' }}>K</span>
          </div>
          <span style={{ color: '#fff', fontSize: '12.5px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>
            Kandiou's Fashion
          </span>
        </div>
        <button onClick={handleLogout} style={logoutBtnStyle}>
          <i className="ti ti-logout" style={{ fontSize: '15px' }} />
          <span className="hide-mobile">Déconnexion</span>
        </button>
      </div>

      <div style={contentStyle}>

        {/* Carte profil */}
        <div style={profileCardStyle}>
          <div style={avatarStyle}>
            {user.prenom?.[0]}{user.nom?.[0]}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '20px', color: '#fff', margin: 0, fontWeight: 700 }}>
              {user.prenom} {user.nom}
            </h1>
            <p style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.45)', marginTop: '4px' }}>
              {user.email}
            </p>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'rgba(212,175,55,0.1)', border: `1px solid ${niveau.color}40`,
            borderRadius: '20px', padding: '6px 14px', flexShrink: 0,
          }}>
            <span style={{ fontSize: '15px' }}>{niveau.icon}</span>
            <span style={{ fontSize: '11.5px', fontWeight: 700, color: niveau.color }}>{niveau.label}</span>
          </div>
        </div>

        {/* KPIs */}
        <div style={kpiGridStyle}>
          <div style={kpiCardStyle}>
            <div style={{ fontSize: '10px', color: 'rgba(212,175,55,0.65)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
              Points fidélité
            </div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '26px', fontWeight: 700, color: '#fff' }}>
              {user.pointsFidelite || 0}
            </div>
          </div>
          <div style={kpiCardStyle}>
            <div style={{ fontSize: '10px', color: 'rgba(212,175,55,0.65)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
              Commandes
            </div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '26px', fontWeight: 700, color: '#fff' }}>
              {historique.length}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={tabsRowStyle}>
          <button onClick={() => setTab('profil')} style={tabBtnStyle(tab === 'profil')}>
            Mon profil
          </button>
          <button onClick={() => setTab('historique')} style={tabBtnStyle(tab === 'historique')}>
            Historique
          </button>
        </div>

        {/* Contenu Tab Profil */}
        {tab === 'profil' && (
          <div style={cardStyle}>
            {[
              { label: 'Nom', val: user.nom },
              { label: 'Prénom', val: user.prenom || '-' },
              { label: 'Email', val: user.email },
            ].map((r, i) => (
              <div key={i} style={rowInfoStyle}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {r.label}
                </span>
                <span style={{ fontSize: '13px', color: '#fff', fontWeight: 600 }}>
                  {r.val}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Contenu Tab Historique */}
        {tab === 'historique' && (
          <div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.4)' }}>
                Chargement...
              </div>
            ) : historique.length === 0 ? (
              <div style={{ ...cardStyle, textAlign: 'center', padding: '40px 20px' }}>
                <i className="ti ti-shopping-bag" style={{ fontSize: '36px', color: 'rgba(212,175,55,0.3)', display: 'block', marginBottom: '10px' }} />
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
                  Aucune commande pour le moment
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {historique.map((v) => (
                  <div key={v.id} style={venteCardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>
                          Vente #{v.id}
                        </div>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
                          {new Date(v.dateVente).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                      <span style={{
                        background: v.statut === 'VALIDEE' ? 'rgba(76,175,80,0.15)' : 'rgba(229,115,115,0.15)',
                        color: v.statut === 'VALIDEE' ? '#81c784' : '#e57373',
                        padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 700,
                      }}>
                        {v.statut === 'VALIDEE' ? 'Validée' : 'Annulée'}
                      </span>
                    </div>
                    <div style={{ marginTop: '10px', fontFamily: 'Playfair Display, serif', fontSize: '17px', fontWeight: 700, color: '#d4af37' }}>
                      {formatMontant(v.montantTotal)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

const pageStyle = {
  minHeight: '100vh', background: '#0a0a0a', fontFamily: 'Inter, sans-serif',
  backgroundImage: `radial-gradient(circle at 15% 15%, rgba(212,175,55,0.10) 0%, transparent 35%)`,
};

const headerStyle = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  padding: '16px 20px', background: 'rgba(0,0,0,0.4)',
  borderBottom: '1px solid rgba(212,175,55,0.2)',
};

const logoBoxStyle = {
  width: '34px', height: '34px', border: '1.5px solid #d4af37', borderRadius: '8px',
  display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(212,175,55,0.08)',
};

const logoutBtnStyle = {
  display: 'flex', alignItems: 'center', gap: '6px',
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
  color: 'rgba(255,255,255,0.6)', padding: '8px 14px', borderRadius: '8px',
  fontSize: '12px', fontWeight: 600, cursor: 'pointer',
};

const contentStyle = {
  maxWidth: '720px', margin: '0 auto', padding: '24px 16px 60px',
};

const profileCardStyle = {
  display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
  background: 'linear-gradient(160deg, rgba(212,175,55,0.08), rgba(20,20,20,0.7))',
  border: '1px solid rgba(212,175,55,0.2)', borderRadius: '16px', padding: '20px',
  marginBottom: '18px',
};

const avatarStyle = {
  width: '52px', height: '52px', borderRadius: '12px', flexShrink: 0,
  background: 'linear-gradient(135deg, #b8960c, #d4af37)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: '18px', fontWeight: 800, color: '#0d0d0d',
};

const kpiGridStyle = {
  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px',
};

const kpiCardStyle = {
  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212,175,55,0.15)',
  borderRadius: '14px', padding: '16px',
};

const tabsRowStyle = {
  display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)',
};

const tabBtnStyle = (active) => ({
  padding: '10px 4px', background: 'none', border: 'none',
  borderBottom: active ? '2px solid #d4af37' : '2px solid transparent',
  color: active ? '#d4af37' : 'rgba(255,255,255,0.4)',
  fontSize: '13px', fontWeight: 700, cursor: 'pointer', marginRight: '20px',
});

const cardStyle = {
  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212,175,55,0.15)',
  borderRadius: '14px', padding: '18px',
};

const rowInfoStyle = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  padding: '11px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap', gap: '4px',
};

const venteCardStyle = {
  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212,175,55,0.15)',
  borderRadius: '12px', padding: '14px 16px',
};

export default MonCompte;
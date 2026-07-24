import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { usePanier } from '../../context/PanierContext';
import api from '../../services/api';

const Checkout = () => {
  const navigate = useNavigate();
  const { articles, totalMontant, viderPanier } = usePanier();
  const [modeLivraison, setModeLivraison] = useState('RETRAIT_BOUTIQUE');
  const [adresseLivraison, setAdresseLivraison] = useState('');
  const [modePaiement, setModePaiement] = useState('MOBILE_MONEY');
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('clientToken');

  const formatMontant = (m) => {
    if (!m) return '0 GNF';
    return Math.round(m).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' GNF';
  };

  const handleConfirmer = async () => {
    if (modeLivraison === 'LIVRAISON' && !adresseLivraison.trim()) {
      toast.error('Veuillez indiquer une adresse de livraison');
      return;
    }

    setLoading(true);
    try {
      await api.post('/client/commandes', {
        articles: articles.map(a => ({ produitId: a.produitId, quantite: a.quantite })),
        modeLivraison,
        adresseLivraison: modeLivraison === 'LIVRAISON' ? adresseLivraison : '',
        modePaiement,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Commande passée avec succès !');
      viderPanier();
      navigate('/mon-compte');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la commande');
    } finally {
      setLoading(false);
    }
  };

  if (articles.length === 0) {
    return (
      <div style={{ ...pageStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '16px' }}>Votre panier est vide</p>
          <button onClick={() => navigate('/catalogue')} style={primaryBtnStyle}>Voir le catalogue</button>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <span style={{ color: '#fff', fontSize: '15px', fontWeight: 700 }}>Finaliser ma commande</span>
      </div>

      <div style={contentStyle}>

        {/* Récapitulatif */}
        <div style={cardStyle}>
          <h3 style={sectionTitleStyle}>Récapitulatif</h3>
          {articles.map(a => (
            <div key={a.produitId} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
              <span>{a.quantite} × {a.nom}</span>
              <span>{formatMontant(a.prixVente * a.quantite)}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', marginTop: '8px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <span style={{ color: '#fff', fontWeight: 700 }}>Total</span>
            <span style={{ color: '#d4af37', fontWeight: 700, fontFamily: 'Playfair Display, serif', fontSize: '18px' }}>
              {formatMontant(totalMontant)}
            </span>
          </div>
        </div>

        {/* Mode de livraison */}
        <div style={cardStyle}>
          <h3 style={sectionTitleStyle}>Mode de réception</h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setModeLivraison('RETRAIT_BOUTIQUE')}
              style={choiceBtnStyle(modeLivraison === 'RETRAIT_BOUTIQUE')}
            >
              <i className="ti ti-building-store" /> Retrait boutique
            </button>
            <button
              onClick={() => setModeLivraison('LIVRAISON')}
              style={choiceBtnStyle(modeLivraison === 'LIVRAISON')}
            >
              <i className="ti ti-truck-delivery" /> Livraison
            </button>
          </div>
          {modeLivraison === 'LIVRAISON' && (
            <input
              type="text"
              placeholder="Votre adresse complète"
              value={adresseLivraison}
              onChange={e => setAdresseLivraison(e.target.value)}
              style={inputStyle}
            />
          )}
        </div>

        {/* Mode de paiement */}
        <div style={cardStyle}>
          <h3 style={sectionTitleStyle}>Mode de paiement</h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setModePaiement('MOBILE_MONEY')}
              style={choiceBtnStyle(modePaiement === 'MOBILE_MONEY')}
            >
              <i className="ti ti-device-mobile" /> Mobile Money
            </button>
            <button
              onClick={() => setModePaiement('ESPECES')}
              style={choiceBtnStyle(modePaiement === 'ESPECES')}
            >
              <i className="ti ti-cash" /> Espèces (à la réception)
            </button>
          </div>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '10px', fontStyle: 'italic' }}>
            Le paiement Mobile Money est simulé à des fins de démonstration. Votre commande sera confirmée manuellement par notre équipe.
          </p>
        </div>

        <button
          onClick={handleConfirmer}
          disabled={loading}
          style={{ ...primaryBtnStyle, width: '100%', opacity: loading ? 0.6 : 1 }}
        >
          {loading ? 'Traitement...' : 'Confirmer ma commande'}
        </button>

      </div>
    </div>
  );
};

const pageStyle = {
  minHeight: '100vh', background: '#0a0a0a', fontFamily: 'Inter, sans-serif',
};

const headerStyle = {
  padding: '16px 20px', borderBottom: '1px solid rgba(212,175,55,0.2)',
};

const contentStyle = {
  maxWidth: '520px', margin: '0 auto', padding: '24px 16px 60px',
  display: 'flex', flexDirection: 'column', gap: '16px',
};

const cardStyle = {
  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212,175,55,0.15)',
  borderRadius: '14px', padding: '18px',
};

const sectionTitleStyle = {
  fontSize: '13px', fontWeight: 700, color: '#d4af37',
  textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', marginTop: 0,
};

const choiceBtnStyle = (active) => ({
  display: 'flex', alignItems: 'center', gap: '7px',
  padding: '10px 14px', borderRadius: '9px',
  background: active ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.03)',
  border: active ? '1.5px solid #d4af37' : '1.5px solid rgba(255,255,255,0.1)',
  color: active ? '#d4af37' : 'rgba(255,255,255,0.6)',
  fontSize: '12.5px', fontWeight: 600, cursor: 'pointer',
});

const inputStyle = {
  width: '100%', marginTop: '12px', padding: '11px 13px',
  background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(212,175,55,0.2)',
  borderRadius: '9px', color: '#fff', fontSize: '13px', outline: 'none',
  fontFamily: 'inherit', boxSizing: 'border-box',
};

const primaryBtnStyle = {
  padding: '13px 24px',
  background: 'linear-gradient(135deg, #e8c659, #d4af37, #b8960c)',
  color: '#0d0d0d', border: 'none', borderRadius: '10px',
  fontSize: '13px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase',
  cursor: 'pointer',
};

export default Checkout;
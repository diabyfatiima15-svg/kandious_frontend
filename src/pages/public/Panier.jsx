import { useNavigate, Link } from 'react-router-dom';
import { usePanier } from '../../context/PanierContext';

const Panier = () => {
  const navigate = useNavigate();
  const { articles, modifierQuantite, retirerDuPanier, totalMontant } = usePanier();

  const clientToken = localStorage.getItem('clientToken');

  const formatMontant = (m) => {
    if (!m) return '0 GNF';
    return Math.round(m).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' GNF';
  };

  const handleValider = () => {
    if (!clientToken) {
      navigate('/connexion-client');
      return;
    }
    navigate('/checkout');
  };

  const getDefaultImage = (categorie) => {
    const cat = categorie?.toLowerCase() || '';
    if (cat.includes('robe')) return 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=200&q=80';
    if (cat.includes('jean')) return 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=200&q=80';
    if (cat.includes('voile')) return 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=200&q=80';
    return 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=200&q=80';
  };

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <Link to="/catalogue" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>
          <i className="ti ti-arrow-left" />
          Continuer mes achats
        </Link>
        <span style={{ color: '#fff', fontSize: '14px', fontWeight: 700 }}>Mon Panier</span>
      </div>

      <div style={contentStyle}>
        {articles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <i className="ti ti-shopping-cart-off" style={{ fontSize: '48px', color: 'rgba(212,175,55,0.3)', display: 'block', marginBottom: '14px' }} />
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginBottom: '20px' }}>
              Votre panier est vide
            </p>
            <button onClick={() => navigate('/catalogue')} style={primaryBtnStyle}>
              Voir le catalogue
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              {articles.map(a => (
                <div key={a.produitId} style={articleCardStyle}>
                  <img
                    src={a.photo || getDefaultImage(a.categorie)}
                    alt={a.nom}
                    style={{ width: '64px', height: '64px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }}
                    onError={e => { e.target.src = getDefaultImage(a.categorie); }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#fff' }}>{a.nom}</div>
                    <div style={{ fontSize: '12.5px', color: '#d4af37', fontWeight: 700, marginTop: '4px' }}>
                      {formatMontant(a.prixVente)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button onClick={() => modifierQuantite(a.produitId, a.quantite - 1)} style={qtyBtnStyle}>−</button>
                    <span style={{ color: '#fff', fontSize: '13px', fontWeight: 700, minWidth: '20px', textAlign: 'center' }}>{a.quantite}</span>
                    <button onClick={() => modifierQuantite(a.produitId, a.quantite + 1)} style={qtyBtnStyle}>+</button>
                  </div>
                  <button onClick={() => retirerDuPanier(a.produitId)} style={removeBtnStyle}>
                    <i className="ti ti-trash" />
                  </button>
                </div>
              ))}
            </div>

            <div style={totalCardStyle}>
              <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>Total</span>
              <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '22px', fontWeight: 700, color: '#d4af37' }}>
                {formatMontant(totalMontant)}
              </span>
            </div>

            <button onClick={handleValider} style={{ ...primaryBtnStyle, width: '100%', marginTop: '16px' }}>
              Valider ma commande
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const pageStyle = {
  minHeight: '100vh', background: '#0a0a0a', fontFamily: 'Inter, sans-serif',
};

const headerStyle = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  padding: '16px 20px', borderBottom: '1px solid rgba(212,175,55,0.2)',
};

const contentStyle = {
  maxWidth: '600px', margin: '0 auto', padding: '24px 16px 60px',
};

const articleCardStyle = {
  display: 'flex', alignItems: 'center', gap: '12px',
  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212,175,55,0.15)',
  borderRadius: '12px', padding: '12px', flexWrap: 'wrap',
};

const qtyBtnStyle = {
  width: '26px', height: '26px', borderRadius: '7px',
  background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)',
  color: '#d4af37', fontSize: '15px', fontWeight: 700, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};

const removeBtnStyle = {
  background: 'rgba(229,115,115,0.1)', border: '1px solid rgba(229,115,115,0.25)',
  color: '#e57373', width: '30px', height: '30px', borderRadius: '8px',
  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
};

const totalCardStyle = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.2)',
  borderRadius: '12px', padding: '16px 18px',
};

const primaryBtnStyle = {
  padding: '13px 24px',
  background: 'linear-gradient(135deg, #e8c659, #d4af37, #b8960c)',
  color: '#0d0d0d', border: 'none', borderRadius: '10px',
  fontSize: '13px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase',
  cursor: 'pointer',
};

export default Panier;
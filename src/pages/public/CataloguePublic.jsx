import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';

const CataloguePublic = () => {
  const navigate = useNavigate();
  const [produits, setProduits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categorieFiltre, setCategorieFiltre] = useState('');

  const clientToken = localStorage.getItem('clientToken');
  const clientUser = JSON.parse(localStorage.getItem('clientUser') || 'null');

  useEffect(() => {
    fetchProduits();
    fetchCategories();
  }, []);

  const fetchProduits = async () => {
    try {
      const r = await api.get('/public/produits');
      setProduits(Array.isArray(r.data) ? r.data : []);
    } catch {
      toast.error('Erreur chargement catalogue');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const r = await api.get('/categories');
      setCategories(Array.isArray(r.data) ? r.data : []);
    } catch { /* silencieux */ }
  };

  const formatMontant = (m) => {
    if (!m) return '0 GNF';
    return Math.round(m).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' GNF';
  };

  const produitsFiltres = produits.filter(p => {
    const matchSearch = p.nom?.toLowerCase().includes(search.toLowerCase());
    const matchCat = !categorieFiltre || p.categorie?.id === parseInt(categorieFiltre);
    return matchSearch && matchCat;
  });

  const getDefaultImage = (produit) => {
    const cat = produit.categorie?.nom?.toLowerCase() || '';
    if (cat.includes('robe')) return 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&q=80';
    if (cat.includes('jean')) return 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80';
    if (cat.includes('voile')) return 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&q=80';
    return 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=80';
  };

  const handleVoirProduit = () => {
    if (!clientToken) {
      toast.info('Connectez-vous pour ajouter au panier');
      navigate('/connexion-client');
    }
  };

  return (
    <div style={pageStyle}>

      {/* Header */}
      <div style={headerStyle}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={logoBoxStyle}>
            <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '17px', fontWeight: 900, color: '#d4af37', fontStyle: 'italic' }}>K</span>
          </div>
          <span style={{ color: '#fff', fontSize: '12.5px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>
            Kandiou's Fashion
          </span>
        </Link>

        {clientUser ? (
          <button onClick={() => navigate('/mon-compte')} style={accountBtnStyle}>
            <i className="ti ti-user-circle" style={{ fontSize: '16px' }} />
            <span className="hide-mobile">{clientUser.prenom}</span>
          </button>
        ) : (
          <button onClick={() => navigate('/connexion-client')} style={accountBtnStyle}>
            <i className="ti ti-login-2" style={{ fontSize: '15px' }} />
            <span className="hide-mobile">Se connecter</span>
          </button>
        )}
      </div>

      <div style={contentStyle}>

        {/* Titre */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '10px', color: '#d4af37', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '8px' }}>
            Élégance · Qualité · Exclusivité
          </div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '26px', color: '#fff', fontWeight: 700, margin: 0 }}>
            Notre <span style={{ color: '#d4af37', fontStyle: 'italic' }}>Collection</span>
          </h1>
        </div>

        {/* Recherche + filtres */}
        <div style={filtersRowStyle}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <i className="ti ti-search" style={searchIconStyle} />
            <input
              type="text"
              placeholder="Rechercher un article..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={searchInputStyle}
            />
          </div>
          <select
            value={categorieFiltre}
            onChange={e => setCategorieFiltre(e.target.value)}
            style={selectStyle}
          >
            <option value="">Toutes catégories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.nom}</option>
            ))}
          </select>
        </div>

        {/* Grille produits */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.4)' }}>
            Chargement du catalogue...
          </div>
        ) : produitsFiltres.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.4)' }}>
            <i className="ti ti-hanger" style={{ fontSize: '40px', opacity: 0.3, display: 'block', marginBottom: '10px' }} />
            Aucun article trouvé
          </div>
        ) : (
          <div style={gridStyle}>
            {produitsFiltres.map(p => (
              <div key={p.id} style={productCardStyle} onClick={handleVoirProduit}>
                <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '12px 12px 0 0' }}>
                  <img
                    src={p.photo || getDefaultImage(p)}
                    alt={p.nom}
                    style={productImgStyle}
                    onError={e => { e.target.src = getDefaultImage(p); }}
                  />
                  <div style={catBadgeStyle}>{p.categorie?.nom}</div>
                </div>
                <div style={{ padding: '14px' }}>
                  <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
                    {p.nom}
                  </div>
                  <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '17px', fontWeight: 700, color: '#d4af37' }}>
                    {formatMontant(p.prixVente)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

const pageStyle = {
  minHeight: '100vh', background: '#0a0a0a', fontFamily: 'Inter, sans-serif',
  backgroundImage: `radial-gradient(circle at 15% 15%, rgba(212,175,55,0.08) 0%, transparent 35%)`,
};

const headerStyle = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  padding: '16px 20px', background: 'rgba(0,0,0,0.4)',
  borderBottom: '1px solid rgba(212,175,55,0.2)', position: 'sticky', top: 0, zIndex: 100,
  backdropFilter: 'blur(8px)',
};

const logoBoxStyle = {
  width: '32px', height: '32px', border: '1.5px solid #d4af37', borderRadius: '7px',
  display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(212,175,55,0.08)',
};

const accountBtnStyle = {
  display: 'flex', alignItems: 'center', gap: '7px',
  background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)',
  color: '#d4af37', padding: '9px 14px', borderRadius: '9px',
  fontSize: '12px', fontWeight: 700, cursor: 'pointer',
};

const contentStyle = {
  maxWidth: '1100px', margin: '0 auto', padding: '28px 16px 60px',
};

const filtersRowStyle = {
  display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap',
};

const searchIconStyle = {
  position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)',
  color: 'rgba(255,255,255,0.35)', fontSize: '15px',
};

const searchInputStyle = {
  width: '100%', padding: '11px 14px 11px 38px',
  background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(212,175,55,0.2)',
  borderRadius: '10px', color: '#fff', fontSize: '13px', outline: 'none',
  fontFamily: 'inherit', boxSizing: 'border-box',
};

const selectStyle = {
  padding: '11px 14px',
  background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(212,175,55,0.2)',
  borderRadius: '10px', color: '#fff', fontSize: '13px', outline: 'none',
  fontFamily: 'inherit', minWidth: '160px',
};

const gridStyle = {
  display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px',
};

const productCardStyle = {
  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212,175,55,0.15)',
  borderRadius: '12px', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.2s',
};

const productImgStyle = {
  width: '100%', height: '180px', objectFit: 'cover', display: 'block',
};

const catBadgeStyle = {
  position: 'absolute', top: '10px', right: '10px',
  background: 'rgba(13,13,13,0.85)', color: '#d4af37',
  fontSize: '9px', fontWeight: 700, padding: '4px 10px',
  borderRadius: '20px', border: '1px solid rgba(212,175,55,0.3)',
};

export default CataloguePublic;
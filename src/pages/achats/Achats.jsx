import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Navbar from '../../components/Navbar';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Achats = () => {
  const { user, hasRole } = useAuth();
  const [achats, setAchats] = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewAchat, setViewAchat] = useState(null);
  const [search, setSearch] = useState('');
  const [panier, setPanier] = useState([]);
  const [form, setForm] = useState({
    fournisseur:{ id:'' },
    statut:'EN_ATTENTE'
  });

  useEffect(() => {
    fetchAchats();
    fetchFournisseurs();
    fetchProduits();
  }, []);

  const fetchAchats = async () => {
    try {
      const r = await api.get('/achats');
      const data = Array.isArray(r.data) ? r.data : [];
      setAchats(data);
    } catch {
      toast.error('Erreur chargement achats');
      setAchats([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFournisseurs = async () => {
    try {
      const r = await api.get('/fournisseurs');
      const data = Array.isArray(r.data) ? r.data : [];
      setFournisseurs(data);
    } catch {
      toast.error('Erreur chargement fournisseurs');
    }
  };

  const fetchProduits = async () => {
    try {
      const r = await api.get('/produits');
      const data = Array.isArray(r.data) ? r.data : [];
      setProduits(data);
    } catch {
      toast.error('Erreur chargement produits');
    }
  };

  const ajouterAuPanier = (produitId) => {
    const produit = produits.find(p => p.id === parseInt(produitId));
    if (!produit) return;
    const existant = panier.find(item => item.produit.id === produit.id);
    if (existant) {
      setPanier(panier.map(item =>
        item.produit.id === produit.id
          ? { ...item, quantite: item.quantite + 1 }
          : item
      ));
    } else {
      setPanier([...panier, {
        produit, quantite:1, prixUnitaire:produit.prixAchat || 0
      }]);
    }
  };

  const modifierQuantite = (produitId, quantite) => {
    if (quantite <= 0) {
      setPanier(panier.filter(item => item.produit.id !== produitId));
    } else {
      setPanier(panier.map(item =>
        item.produit.id === produitId
          ? { ...item, quantite:parseInt(quantite) }
          : item
      ));
    }
  };

  const modifierPrix = (produitId, prix) => {
    setPanier(panier.map(item =>
      item.produit.id === produitId
        ? { ...item, prixUnitaire:parseFloat(prix) || 0 }
        : item
    ));
  };

  const calculerTotal = () => {
    return panier.reduce(
      (t, item) => t + (item.prixUnitaire * item.quantite), 0
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (panier.length === 0) {
      toast.error('Le panier est vide !');
      return;
    }
    if (!form.fournisseur.id) {
      toast.error('Sélectionnez un fournisseur !');
      return;
    }
    try {
      const total = calculerTotal();
      const achat = {
        fournisseur:{ id:parseInt(form.fournisseur.id) },
        utilisateur:{ id:user.id },
        montantTotal: total,
        statut: 'EN_ATTENTE',
      };
      const details = panier.map(item => ({
        produit:{ id:item.produit.id },
        quantite:item.quantite,
        prixUnitaire:item.prixUnitaire,
        sousTotal:item.prixUnitaire * item.quantite
      }));
      await api.post('/achats', { achat, details });
      toast.success('Achat créé avec succès !');
      fetchAchats();
      handleCloseModal();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de l'achat");
    }
  };

  const handleReceptionner = async (id) => {
    if (!window.confirm('Confirmer la réception ? Le stock sera mis à jour.')) return;
    try {
      await api.put(`/achats/${id}/receptionner`);
      toast.success('Achat réceptionné ! Stock mis à jour.');
      fetchAchats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la réception');
    }
  };

  const handleAnnuler = async (id) => {
    if (!window.confirm('Annuler cet achat ?')) return;
    try {
      await api.put(`/achats/${id}/annuler`);
      toast.success('Achat annulé !');
      fetchAchats();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de l'annulation");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer définitivement cet achat ?')) return;
    try {
      await api.delete(`/achats/${id}`);
      toast.success('Achat supprimé !');
      fetchAchats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setPanier([]);
    setForm({ fournisseur:{ id:'' }, statut:'EN_ATTENTE' });
  };

  const formatMontant = (m) => {
    if (!m) return '0 GNF';
    return Math.round(m).toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' GNF';
  };

  const getStatut = (statut) => {
    if (statut === 'RECU') return { label:'Réceptionné', bg:'#e8f5e9', color:'#2e7d32' };
    if (statut === 'ANNULE') return { label:'Annulé', bg:'#ffebee', color:'#c62828' };
    return { label:'En attente', bg:'rgba(212,175,55,0.1)', color:'#b8960c' };
  };

  const achatsFiltres = achats.filter(a => {
    const terme = search.toLowerCase();
    if (!terme) return true;
    return a.fournisseur?.nom?.toLowerCase().includes(terme)
      || String(a.id).includes(terme)
      || getStatut(a.statut).label.toLowerCase().includes(terme);
  });

  return (
    <div className="page-container">
      <Navbar />
      <div className="page-content">

        {/* HEADER */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'24px' }}>
          <div>
            <h1 style={{ fontFamily:'Playfair Display,serif', fontSize:'26px', fontWeight:700, color:'var(--noir)' }}>
              Gestion des Achats
            </h1>
            <p style={{ fontSize:'13px', color:'var(--text-light)', marginTop:'3px' }}>
              {achats.length} achat{achats.length > 1 ? 's' : ''} au total
            </p>
          </div>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <i className="ti ti-plus" style={{ fontSize:'16px' }} />
            Nouvel Achat
          </button>
        </div>

        {/* STATS */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'14px', marginBottom:'22px' }}>
          {[
            { label:'Total achats', val:achats.length, icon:'ti-package', color:'var(--primary)' },
            { label:'En attente', val:achats.filter(a => a.statut === 'EN_ATTENTE').length, icon:'ti-clock', color:'#b8960c' },
            { label:'Réceptionnés', val:achats.filter(a => a.statut === 'RECU').length, icon:'ti-check', color:'#2e7d32' },
            { label:'Montant total', val:formatMontant(achats.reduce((s,a) => s + (a.montantTotal||0), 0)), icon:'ti-cash', color:'#b8960c' },
          ].map((s, i) => (
            <div key={i} style={{ background:'var(--white)', borderRadius:'14px', padding:'18px 20px', border:'1px solid var(--border)', boxShadow:'var(--shadow)', display:'flex', alignItems:'center', gap:'14px' }}>
              <div style={{ width:'42px', height:'42px', background: i === 0 ? 'var(--noir)' : `${s.color}18`, borderRadius:'11px', display:'flex', alignItems:'center', justifyContent:'center', border: i === 0 ? '1px solid rgba(212,175,55,0.3)' : 'none' }}>
                <i className={`ti ${s.icon}`} style={{ fontSize:'20px', color:s.color }} />
              </div>
              <div>
                <div style={{ fontFamily:'Playfair Display,serif', fontSize: i === 3 ? '13px' : '24px', fontWeight:700, color:'var(--noir)', lineHeight:1 }}>{s.val}</div>
                <div style={{ fontSize:'11px', color:'var(--text-light)', marginTop:'3px' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* SEARCH */}
        <div style={{ marginBottom:'16px' }}>
          <div style={{ position:'relative', display:'inline-block' }}>
            <i className="ti ti-search" style={{ position:'absolute', left:'13px', top:'50%', transform:'translateY(-50%)', color:'var(--text-light)', fontSize:'16px', zIndex:1 }} />
            <input
              type="text"
              placeholder="Rechercher par fournisseur, N°, statut..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ padding:'10px 16px 10px 40px', border:'1.5px solid var(--border)', borderRadius:'10px', fontSize:'13px', outline:'none', width:'360px', fontFamily:'Inter,sans-serif', background:'var(--white)', color:'var(--text-dark)' }}
              onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(212,175,55,0.1)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
            />
          </div>
        </div>

        {/* TABLE */}
        {loading ? (
          <div className="loading-container"><div className="loading-spinner" /></div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>N°</th>
                  <th>Date</th>
                  <th>Fournisseur</th>
                  <th>Montant total</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {achatsFiltres.map(a => {
                  const st = getStatut(a.statut);
                  return (
                    <tr key={a.id}>
                      <td style={{ color:'var(--primary)', fontWeight:800 }}>#{a.id}</td>
                      <td style={{ fontSize:'12px', color:'var(--text-mid)' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                          <i className="ti ti-calendar" style={{ fontSize:'13px', color:'var(--primary)' }} />
                          {new Date(a.dateAchat).toLocaleDateString('fr-FR')}
                        </div>
                      </td>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                          <div style={{ width:'32px', height:'32px', background:'var(--noir)', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'10px', fontWeight:800, color:'var(--primary)', border:'1px solid rgba(212,175,55,0.2)' }}>
                            {a.fournisseur?.nom?.[0] || 'F'}
                          </div>
                          <span style={{ fontSize:'13px', color:'var(--text-dark)' }}>{a.fournisseur?.nom || '-'}</span>
                        </div>
                      </td>
                      <td style={{ fontWeight:800, color:'var(--noir)' }}>{formatMontant(a.montantTotal)}</td>
                      <td>
                        <span style={{ background:st.bg, color:st.color, padding:'4px 10px', borderRadius:'20px', fontSize:'10px', fontWeight:800 }}>
                          {st.label}
                        </span>
                      </td>
                      <td>
                        <div style={{ display:'flex', gap:'6px', alignItems:'center' }}>

                          {/* Voir — tout le monde */}
                          <button
                            onClick={() => setViewAchat(a)}
                            title="Voir le détail"
                            className="btn-icon"
                            style={{ background:'rgba(21,101,192,0.08)', color:'#1565c0', border:'1px solid rgba(21,101,192,0.2)' }}
                          >
                            <i className="ti ti-eye" />
                          </button>

                          {/* Réceptionner + Annuler — EN_ATTENTE, tout le monde autorisé */}
                          {a.statut === 'EN_ATTENTE' && (
                            <>
                              <button
                                onClick={() => handleReceptionner(a.id)}
                                style={{ display:'flex', alignItems:'center', gap:'4px', background:'#e8f5e9', color:'#2e7d32', border:'1px solid #c8e6c9', padding:'6px 12px', borderRadius:'8px', fontSize:'11px', fontWeight:600, cursor:'pointer' }}
                              >
                                <i className="ti ti-check" style={{ fontSize:'13px' }} />
                                Réceptionner
                              </button>
                              <button
                                onClick={() => handleAnnuler(a.id)}
                                style={{ display:'flex', alignItems:'center', gap:'4px', background:'#ffebee', color:'#c62828', border:'1px solid #ffcdd2', padding:'6px 12px', borderRadius:'8px', fontSize:'11px', fontWeight:600, cursor:'pointer' }}
                              >
                                <i className="ti ti-x" style={{ fontSize:'13px' }} />
                                Annuler
                              </button>
                            </>
                          )}

                          {/* Réceptionné */}
                          {a.statut === 'RECU' && (
                            <span style={{ fontSize:'12px', color:'#2e7d32', fontWeight:600 }}>
                              ✅ Réceptionné
                            </span>
                          )}

                          {/* Annulé — badge + bouton supprimer ADMIN seulement */}
                          {a.statut === 'ANNULE' && (
                            <>
                              <span style={{ fontSize:'12px', color:'#c62828', fontWeight:600 }}>
                                ❌ Annulé
                              </span>
                              {hasRole('ADMIN') && (
                                <button
                                  onClick={() => handleDelete(a.id)}
                                  title="Supprimer définitivement"
                                  className="btn-icon btn-delete"
                                >
                                  <i className="ti ti-trash" />
                                </button>
                              )}
                            </>
                          )}

                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {achatsFiltres.length === 0 && (
              <div style={{ textAlign:'center', padding:'60px', color:'var(--text-light)' }}>
                <i className="ti ti-package" style={{ fontSize:'48px', opacity:0.2, display:'block', marginBottom:'12px' }} />
                {search ? 'Aucun achat ne correspond à la recherche' : 'Aucun achat enregistré'}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL NOUVEL ACHAT */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth:'700px' }}>
            <div className="modal-header">
              <h2>📦 Nouvel <span>Achat</span></h2>
              <button className="modal-close" onClick={handleCloseModal}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">

              <div className="form-group">
                <label>Fournisseur *</label>
                <select value={form.fournisseur.id} onChange={e => setForm({ ...form, fournisseur:{ id:e.target.value } })} required>
                  <option value="">Sélectionner un fournisseur...</option>
                  {fournisseurs.map(f => (
                    <option key={f.id} value={f.id}>{f.nom}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Ajouter un produit</label>
                <select onChange={e => { ajouterAuPanier(e.target.value); e.target.value=''; }} defaultValue="">
                  <option value="">Sélectionner un produit...</option>
                  {produits.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nom} — Prix achat: {formatMontant(p.prixAchat)}
                    </option>
                  ))}
                </select>
              </div>

              {panier.length > 0 && (
                <div style={{ background:'var(--creme)', borderRadius:'12px', padding:'16px', border:'1px solid var(--border)' }}>
                  <div style={{ fontFamily:'Playfair Display,serif', fontSize:'14px', fontWeight:700, color:'var(--noir)', marginBottom:'12px' }}>
                    📦 Produits ({panier.length})
                  </div>
                  <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'13px' }}>
                    <thead>
                      <tr>
                        {['Produit','Prix achat','Qté','Sous-total',''].map((h,i) => (
                          <th key={i} style={{ background:'var(--noir)', color:'rgba(255,255,255,0.5)', padding:'8px 12px', textAlign:'left', fontSize:'10px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.8px' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {panier.map(item => (
                        <tr key={item.produit.id}>
                          <td style={{ padding:'10px 12px', borderBottom:'1px solid var(--border)', fontWeight:600 }}>{item.produit.nom}</td>
                          <td style={{ padding:'10px 12px', borderBottom:'1px solid var(--border)' }}>
                            <input
                              type="number"
                              value={item.prixUnitaire}
                              onChange={e => modifierPrix(item.produit.id, e.target.value)}
                              style={{ width:'100px', padding:'4px 8px', border:'1.5px solid var(--border)', borderRadius:'6px', fontSize:'13px', outline:'none' }}
                            />
                          </td>
                          <td style={{ padding:'10px 12px', borderBottom:'1px solid var(--border)' }}>
                            <input
                              type="number"
                              value={item.quantite}
                              min="1"
                              onChange={e => modifierQuantite(item.produit.id, e.target.value)}
                              style={{ width:'60px', padding:'4px 8px', border:'1.5px solid var(--border)', borderRadius:'6px', textAlign:'center', fontSize:'13px', outline:'none' }}
                            />
                          </td>
                          <td style={{ padding:'10px 12px', borderBottom:'1px solid var(--border)', fontWeight:700, color:'var(--noir)' }}>
                            {formatMontant(item.prixUnitaire * item.quantite)}
                          </td>
                          <td style={{ padding:'10px 12px', borderBottom:'1px solid var(--border)' }}>
                            <button
                              type="button"
                              onClick={() => modifierQuantite(item.produit.id, 0)}
                              style={{ background:'#ffebee', color:'#c62828', border:'none', padding:'4px 8px', borderRadius:'6px', cursor:'pointer', fontSize:'12px' }}
                            >✕</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{ display:'flex', justifyContent:'flex-end', marginTop:'12px' }}>
                    <div style={{ background:'var(--noir)', borderRadius:'10px', padding:'12px 20px', border:'1px solid rgba(212,175,55,0.2)' }}>
                      <span style={{ fontFamily:'Playfair Display,serif', fontSize:'15px', fontWeight:700, color:'#fff', marginRight:'12px' }}>TOTAL</span>
                      <span style={{ fontFamily:'Playfair Display,serif', fontSize:'17px', fontWeight:800, color:'var(--primary)' }}>{formatMontant(calculerTotal())}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>Annuler</button>
                <button type="submit" className="btn-primary" disabled={panier.length === 0}>
                  <i className="ti ti-check" style={{ fontSize:'15px' }} />
                  Créer l'achat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL VOIR ACHAT */}
      {viewAchat && (
        <div className="modal-overlay" onClick={() => setViewAchat(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>👁️ Détail <span>Achat #{viewAchat.id}</span></h2>
              <button className="modal-close" onClick={() => setViewAchat(null)}>✕</button>
            </div>
            <div className="modal-form">
              {[
                { label:'Date', val:viewAchat.dateAchat ? new Date(viewAchat.dateAchat).toLocaleString('fr-FR') : '-' },
                { label:'Fournisseur', val:viewAchat.fournisseur?.nom || '-' },
                { label:'Montant total', val:formatMontant(viewAchat.montantTotal) },
                { label:'Statut', val:getStatut(viewAchat.statut).label },
              ].map((r, i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
                  <span style={{ fontSize:'12px', fontWeight:700, color:'var(--text-mid)', textTransform:'uppercase', letterSpacing:'0.5px' }}>{r.label}</span>
                  <span style={{ fontSize:'13px', color:'var(--text-dark)', fontWeight:600 }}>{r.val}</span>
                </div>
              ))}
              <div className="modal-footer">
                {viewAchat.statut === 'EN_ATTENTE' && (
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => { const id = viewAchat.id; setViewAchat(null); handleReceptionner(id); }}
                    style={{ color:'#2e7d32', borderColor:'#c8e6c9' }}
                  >
                    <i className="ti ti-check" /> Réceptionner
                  </button>
                )}
                <button type="button" className="btn-secondary" onClick={() => setViewAchat(null)}>
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Achats;
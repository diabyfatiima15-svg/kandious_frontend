import QRCode from 'qrcode';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import Navbar from '../../components/Navbar';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Produits = () => {
  const { hasRole } = useAuth();
  const [produits, setProduits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [produitEdit, setProduitEdit] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [qrModal, setQrModal] = useState(null);
  const [qrImageUrl, setQrImageUrl] = useState('');
  const [viewProduit, setViewProduit] = useState(null);
  const fileRef = useRef(null);
  const [form, setForm] = useState({
    nom:'', description:'', prixAchat:'', prixVente:'',
    quantiteStock:'', taille:'', couleur:'', photo:'', categorie:{ id:'' }
  });

  useEffect(() => { fetchProduits(); fetchCategories(); }, []);

  const fetchProduits = async () => {
    try {
      const r = await api.get('/produits');
      setProduits(Array.isArray(r.data) ? r.data : []);
    } catch { toast.error('Erreur chargement produits'); }
    finally { setLoading(false); }
  };

  const fetchCategories = async () => {
    try {
      const r = await api.get('/categories');
      setCategories(Array.isArray(r.data) ? r.data : []);
    } catch { toast.error('Erreur chargement catégories'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (produitEdit) {
        await api.put(`/produits/${produitEdit.id}`, form);
        toast.success('Produit modifié !');
      } else {
        await api.post('/produits', form);
        toast.success('Produit créé !');
      }
      fetchProduits();
      handleCloseModal();
    } catch { toast.error('Erreur sauvegarde'); }
  };

  const handleEdit = (p) => {
    setProduitEdit(p);
    setImagePreview(p.photo || null);
    setForm({
      nom:p.nom, description:p.description||'',
      prixAchat:p.prixAchat, prixVente:p.prixVente,
      quantiteStock:p.quantiteStock, taille:p.taille||'',
      couleur:p.couleur||'', photo:p.photo||'',
      categorie:{ id:p.categorie?.id||'' }
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce produit ?')) return;
    try {
      await api.delete(`/produits/${id}`);
      toast.success('Produit supprimé !');
      fetchProduits();
    } catch { toast.error('Erreur suppression'); }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setProduitEdit(null);
    setImagePreview(null);
    setForm({
      nom:'', description:'', prixAchat:'', prixVente:'',
      quantiteStock:'', taille:'', couleur:'', photo:'', categorie:{ id:'' }
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImagePreview(ev.target.result);
      setForm(prev => ({ ...prev, photo: ev.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const genererQRProduit = async (produit) => {
    try {
      const contenu = [
        "KANDIOU'S Fashion",
        `Produit : ${produit.nom}`,
        `Categorie : ${produit.categorie?.nom || 'N/A'}`,
        `Prix : ${Math.round(produit.prixVente).toString()
          .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} GNF`,
        `Stock : ${produit.quantiteStock} unites`,
        `Statut : ${produit.statut}`,
      ].join('\n');

      const url = await QRCode.toDataURL(contenu, {
        width: 250, margin: 2,
        color: { dark: '#0d0d0d', light: '#ffffff' }
      });

      setQrImageUrl(url);
      setQrModal(produit);
    } catch {
      toast.error('Erreur génération QR Code');
    }
  };

  const formatMontant = (m) => {
    if (!m) return '0 GNF';
    return Math.round(m).toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g,' ') + ' GNF';
  };

  const produitsFiltres = produits.filter(p =>
    p.nom?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatut = (p) => {
    if (p.statut === 'RUPTURE' || p.quantiteStock === 0)
      return { label:'Rupture', bg:'#ffebee', color:'#c62828' };
    if (p.quantiteStock <= 5)
      return { label:'Stock bas', bg:'#fff3e0', color:'#e65100' };
    return { label:'Disponible', bg:'#e8f5e9', color:'#2e7d32' };
  };

  const getDefaultImage = (produit) => {
    const cat = produit.categorie?.nom?.toLowerCase() || '';
    if (cat.includes('robe')) return 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=80&q=80';
    if (cat.includes('jean') || cat.includes('pantalon')) return 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=80&q=80';
    if (cat.includes('sac')) return 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=80&q=80';
    if (cat.includes('chaussure')) return 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=80&q=80';
    if (cat.includes('voile') || cat.includes('foulard')) return 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=80&q=80';
    if (cat.includes('accessoire')) return 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=80&q=80';
    return 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=80&q=80';
  };

  // ADMIN seulement peut créer/modifier/supprimer
  const estAdmin = hasRole('ADMIN');

  return (
    <div className="page-container">
      <Navbar />
      <div className="page-content">

        {/* HEADER */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'24px' }}>
          <div>
            <h1 style={{ fontFamily:'Playfair Display,serif', fontSize:'26px', fontWeight:700, color:'var(--noir)' }}>
              Gestion des Produits
            </h1>
            <p style={{ fontSize:'13px', color:'var(--text-light)', marginTop:'3px' }}>
              {produits.length} produit{produits.length > 1 ? 's' : ''} au total
            </p>
          </div>
          {/* Bouton Nouveau Produit — ADMIN seulement */}
          {estAdmin && (
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              <i className="ti ti-plus" style={{ fontSize:'16px' }} />
              Nouveau Produit
            </button>
          )}
        </div>

        {/* STATS */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'14px', marginBottom:'22px' }}>
          {[
            { label:'Total produits', val:produits.length, icon:'ti-hanger', color:'var(--primary)' },
            { label:'Disponibles', val:produits.filter(p => p.statut === 'DISPONIBLE').length, icon:'ti-check', color:'#2e7d32' },
            { label:'Stock bas', val:produits.filter(p => p.quantiteStock <= 5 && p.quantiteStock > 0).length, icon:'ti-alert-triangle', color:'#e65100' },
            { label:'Rupture', val:produits.filter(p => p.quantiteStock === 0 || p.statut === 'RUPTURE').length, icon:'ti-x', color:'#c62828' },
          ].map((s, i) => (
            <div key={i} style={{ background:'var(--white)', borderRadius:'14px', padding:'18px 20px', border:'1px solid var(--border)', boxShadow:'var(--shadow)', display:'flex', alignItems:'center', gap:'14px' }}>
              <div style={{ width:'42px', height:'42px', background: i === 0 ? 'var(--noir)' : `${s.color}18`, borderRadius:'11px', display:'flex', alignItems:'center', justifyContent:'center', border: i === 0 ? '1px solid rgba(212,175,55,0.3)' : 'none' }}>
                <i className={`ti ${s.icon}`} style={{ fontSize:'20px', color:s.color }} />
              </div>
              <div>
                <div style={{ fontFamily:'Playfair Display,serif', fontSize:'24px', fontWeight:700, color:'var(--noir)', lineHeight:1 }}>{s.val}</div>
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
              placeholder="Rechercher un produit..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ padding:'10px 16px 10px 40px', border:'1.5px solid var(--border)', borderRadius:'10px', fontSize:'13px', outline:'none', width:'360px', fontFamily:'Inter,sans-serif' }}
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
                  <th>Photo</th>
                  <th>Produit</th>
                  <th>Catégorie</th>
                  <th>Prix achat</th>
                  <th>Prix vente</th>
                  <th>Stock</th>
                  <th>Taille</th>
                  <th>Couleur</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {produitsFiltres.map(p => {
                  const statut = getStatut(p);
                  const imgSrc = p.photo || getDefaultImage(p);
                  return (
                    <tr key={p.id}>
                      <td>
                        <img src={imgSrc} alt={p.nom}
                          style={{ width:'46px', height:'46px', borderRadius:'10px', objectFit:'cover', border:'1px solid var(--border)' }}
                          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=80&q=80'; }}
                        />
                      </td>
                      <td>
                        <div style={{ fontWeight:700, color:'var(--noir)', fontSize:'13px' }}>{p.nom}</div>
                        {p.description && (
                          <div style={{ fontSize:'11px', color:'var(--text-light)', marginTop:'2px' }}>
                            {p.description.length > 30 ? p.description.slice(0,30)+'...' : p.description}
                          </div>
                        )}
                      </td>
                      <td>
                        <span style={{ background:'var(--noir)', color:'var(--primary)', padding:'3px 9px', borderRadius:'20px', fontSize:'10px', fontWeight:700, border:'1px solid rgba(212,175,55,0.2)' }}>
                          {p.categorie?.nom || '-'}
                        </span>
                      </td>
                      <td style={{ color:'var(--text-mid)', fontSize:'13px' }}>{formatMontant(p.prixAchat)}</td>
                      <td style={{ fontWeight:700, color:'var(--noir)', fontSize:'13px' }}>{formatMontant(p.prixVente)}</td>
                      <td>
                        <span style={{ fontWeight:800, fontSize:'14px', color: p.quantiteStock === 0 ? '#c62828' : p.quantiteStock <= 5 ? '#e65100' : '#2e7d32' }}>
                          {p.quantiteStock}
                        </span>
                      </td>
                      <td style={{ fontSize:'13px', color:'var(--text-mid)' }}>{p.taille || '-'}</td>
                      <td>
                        {p.couleur ? (
                          <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                            <div style={{ width:'14px', height:'14px', borderRadius:'50%', background:p.couleur.toLowerCase(), border:'1px solid var(--border)', flexShrink:0 }} />
                            <span style={{ fontSize:'12px', color:'var(--text-mid)' }}>{p.couleur}</span>
                          </div>
                        ) : '-'}
                      </td>
                      <td>
                        <span style={{ background:statut.bg, color:statut.color, padding:'4px 10px', borderRadius:'20px', fontSize:'10px', fontWeight:800 }}>
                          {statut.label}
                        </span>
                      </td>
                      <td>
                        <div style={{ display:'flex', gap:'6px' }}>

                          {/* Voir — tout le monde */}
                          <button className="btn-icon" onClick={() => setViewProduit(p)} title="Voir"
                            style={{ background:'rgba(21,101,192,0.08)', color:'#1565c0', border:'1px solid rgba(21,101,192,0.2)' }}>
                            <i className="ti ti-eye" />
                          </button>

                          {/* Modifier — ADMIN seulement */}
                          {estAdmin && (
                            <button className="btn-icon btn-edit" onClick={() => handleEdit(p)} title="Modifier">
                              <i className="ti ti-pencil" />
                            </button>
                          )}

                          {/* Supprimer — ADMIN seulement */}
                          {estAdmin && (
                            <button className="btn-icon btn-delete" onClick={() => handleDelete(p.id)} title="Supprimer">
                              <i className="ti ti-trash" />
                            </button>
                          )}

                          {/* QR Code — tout le monde */}
                          <button onClick={() => genererQRProduit(p)} title="Générer QR Code"
                            style={{ background:'rgba(212,175,55,0.1)', color:'var(--primary)', border:'1px solid rgba(212,175,55,0.3)', padding:'6px 10px', borderRadius:'8px', cursor:'pointer', fontSize:'12px', display:'flex', alignItems:'center', gap:'4px' }}>
                            <i className="ti ti-qrcode" style={{ fontSize:'14px' }} />
                            QR
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {produitsFiltres.length === 0 && (
              <div style={{ textAlign:'center', padding:'60px', color:'var(--text-light)' }}>
                <i className="ti ti-hanger" style={{ fontSize:'48px', opacity:0.2, display:'block', marginBottom:'12px' }} />
                Aucun produit trouvé
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL PRODUIT — ADMIN seulement */}
      {showModal && estAdmin && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth:'620px' }}>
            <div className="modal-header">
              <h2><span>{produitEdit ? '✏️ Modifier' : '✨ Nouveau'}</span> Produit</h2>
              <button className="modal-close" onClick={handleCloseModal}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div style={{ border:'2px dashed var(--creme-3)', borderRadius:'12px', padding:'16px', textAlign:'center', cursor:'pointer', background:'var(--creme)', transition:'all 0.2s' }}
                onClick={() => fileRef.current?.click()}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--creme-3)'}>
                <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleImageChange} />
                {imagePreview ? (
                  <div style={{ position:'relative', display:'inline-block' }}>
                    <img src={imagePreview} alt="preview" style={{ width:'120px', height:'120px', objectFit:'cover', borderRadius:'10px', border:'2px solid var(--primary)' }} />
                    <div style={{ position:'absolute', bottom:'-8px', right:'-8px', background:'var(--primary)', color:'var(--noir)', width:'24px', height:'24px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:800 }}>✏️</div>
                  </div>
                ) : (
                  <>
                    <i className="ti ti-cloud-upload" style={{ fontSize:'32px', color:'var(--text-light)' }} />
                    <p style={{ fontSize:'12px', color:'var(--text-light)', marginTop:'8px' }}>Cliquer pour ajouter une photo</p>
                    <p style={{ fontSize:'10px', color:'var(--creme-3)', marginTop:'4px' }}>JPG, PNG — max 5MB</p>
                  </>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Nom *</label>
                  <input type="text" value={form.nom} required onChange={e => setForm({...form, nom:e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Catégorie *</label>
                  <select value={form.categorie.id} required onChange={e => setForm({ ...form, categorie:{id:e.target.value} })}>
                    <option value="">Sélectionner...</option>
                    {categories.map(c => (<option key={c.id} value={c.id}>{c.nom}</option>))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea value={form.description} onChange={e => setForm({...form, description:e.target.value})} rows={2} style={{ resize:'none' }} />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Prix d'achat (GNF) *</label>
                  <input type="number" value={form.prixAchat} required onChange={e => setForm({...form, prixAchat:e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Prix de vente (GNF) *</label>
                  <input type="number" value={form.prixVente} required onChange={e => setForm({...form, prixVente:e.target.value})} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Quantité en stock *</label>
                  <input type="number" value={form.quantiteStock} required onChange={e => setForm({...form, quantiteStock:e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Taille</label>
                  <select value={form.taille} onChange={e => setForm({...form, taille:e.target.value})}>
                    <option value="">Sélectionner...</option>
                    {['XS','S','M','L','XL','XXL','Unique'].map(t => (<option key={t} value={t}>{t}</option>))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Couleur</label>
                  <input type="text" value={form.couleur} onChange={e => setForm({...form, couleur:e.target.value})} placeholder="ex: Rouge, Noir..." />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>Annuler</button>
                <button type="submit" className="btn-primary">
                  <i className="ti ti-check" style={{ fontSize:'15px' }} />
                  {produitEdit ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL QR CODE — tout le monde */}
      {qrModal && (
        <div className="modal-overlay" onClick={() => setQrModal(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background:'var(--noir)', border:'1px solid rgba(212,175,55,0.3)', borderRadius:'20px', padding:'32px', display:'flex', flexDirection:'column', alignItems:'center', gap:'16px', maxWidth:'320px', width:'90%' }}>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontFamily:'Playfair Display,serif', fontSize:'18px', fontWeight:700, color:'var(--primary)' }}>KANDIOU'S Fashion</div>
              <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.4)', letterSpacing:'3px', textTransform:'uppercase', marginTop:'2px' }}>Étiquette Produit</div>
            </div>
            <div style={{ background:'#fff', padding:'12px', borderRadius:'12px', border:'2px solid rgba(212,175,55,0.3)' }}>
              <img src={qrImageUrl} alt="QR Code" style={{ width:'200px', height:'200px', display:'block' }} />
            </div>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontFamily:'Playfair Display,serif', fontSize:'16px', fontWeight:700, color:'#fff' }}>{qrModal.nom}</div>
              <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)', marginTop:'4px' }}>{qrModal.categorie?.nom || ''}</div>
              <div style={{ fontSize:'20px', fontWeight:800, color:'var(--primary)', marginTop:'8px' }}>{formatMontant(qrModal.prixVente)}</div>
              <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)', marginTop:'4px' }}>Stock : {qrModal.quantiteStock} unités</div>
            </div>
            <div style={{ display:'flex', gap:'10px', width:'100%' }}>
              <button onClick={() => { const link = document.createElement('a'); link.download = `QR-${qrModal.nom}.png`; link.href = qrImageUrl; link.click(); }}
                style={{ flex:1, padding:'10px', background:'var(--primary)', color:'var(--noir)', border:'none', borderRadius:'8px', fontSize:'12px', fontWeight:700, cursor:'pointer' }}>
                ⬇️ Télécharger
              </button>
              <button onClick={() => setQrModal(null)}
                style={{ flex:1, padding:'10px', background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.6)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', fontSize:'12px', fontWeight:600, cursor:'pointer' }}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL VOIR PRODUIT — tout le monde */}
      {viewProduit && (
        <div className="modal-overlay" onClick={() => setViewProduit(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>👁️ Détail <span>Produit</span></h2>
              <button className="modal-close" onClick={() => setViewProduit(null)}>✕</button>
            </div>
            <div className="modal-form">
              <div style={{ display:'flex', justifyContent:'center', marginBottom:'8px' }}>
                <img src={viewProduit.photo || getDefaultImage(viewProduit)} alt={viewProduit.nom}
                  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=120&q=80'; }}
                  style={{ width:'110px', height:'110px', objectFit:'cover', borderRadius:'12px', border:'2px solid var(--primary)' }} />
              </div>
              {[
                { label:'Nom', val:viewProduit.nom },
                { label:'Catégorie', val:viewProduit.categorie?.nom || '-' },
                { label:'Description', val:viewProduit.description || '-' },
                { label:"Prix d'achat", val:formatMontant(viewProduit.prixAchat) },
                { label:'Prix de vente', val:formatMontant(viewProduit.prixVente) },
                { label:'Stock', val:`${viewProduit.quantiteStock} unité(s)` },
                { label:'Taille', val:viewProduit.taille || '-' },
                { label:'Couleur', val:viewProduit.couleur || '-' },
                { label:'Statut', val:getStatut(viewProduit).label },
              ].map((r, i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', gap:'16px', padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
                  <span style={{ fontSize:'12px', fontWeight:700, color:'var(--text-mid)', textTransform:'uppercase', letterSpacing:'0.5px', flexShrink:0 }}>{r.label}</span>
                  <span style={{ fontSize:'13px', color:'var(--text-dark)', fontWeight:600, textAlign:'right' }}>{r.val}</span>
                </div>
              ))}
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setViewProduit(null)}>Fermer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Produits;
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Navbar from '../../components/Navbar';
import api from '../../services/api';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [editCategorie, setEditCategorie] = useState(null);
  const [viewCategorie, setViewCategorie] = useState(null);
  const [form, setForm] = useState({ nom:'', description:'' });

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    try {
      const r = await api.get('/categories');
      setCategories(Array.isArray(r.data) ? r.data : []);
    } catch {
      toast.error('Erreur chargement catégories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editCategorie) {
        await api.put(`/categories/${editCategorie.id}`, form);
        toast.success('Catégorie modifiée !');
      } else {
        await api.post('/categories', form);
        toast.success('Catégorie créée !');
      }
      fetchCategories();
      handleCloseModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur sauvegarde');
    }
  };

  const handleEdit = (c) => {
    setEditCategorie(c);
    setForm({ nom:c.nom, description:c.description || '' });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette catégorie ? Attention : elle ne doit avoir aucun produit associé.')) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success('Catégorie supprimée !');
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Impossible de supprimer — des produits utilisent cette catégorie');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditCategorie(null);
    setForm({ nom:'', description:'' });
  };

  const categoriesFiltrees = categories.filter(c =>
    c.nom?.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase())
  );

  const getIcone = (nom) => {
    const n = nom?.toLowerCase() || '';
    if (n.includes('robe')) return '👗';
    if (n.includes('voile') || n.includes('foulard')) return '🧣';
    if (n.includes('jean') || n.includes('pantalon')) return '👖';
    if (n.includes('sac')) return '👜';
    if (n.includes('chaussure')) return '👠';
    if (n.includes('accessoire') || n.includes('bijou')) return '💍';
    if (n.includes('ensemble')) return '👘';
    return '✨';
  };

  return (
    <div className="page-container">
      <Navbar />
      <div className="page-content">

        {/* HEADER */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'24px' }}>
          <div>
            <h1 style={{ fontFamily:'Playfair Display,serif', fontSize:'26px', fontWeight:700, color:'var(--noir)' }}>
              Gestion des Catégories
            </h1>
            <p style={{ fontSize:'13px', color:'var(--text-light)', marginTop:'3px' }}>
              {categories.length} catégorie{categories.length > 1 ? 's' : ''} enregistrée{categories.length > 1 ? 's' : ''}
            </p>
          </div>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <i className="ti ti-plus" style={{ fontSize:'16px' }} />
            Nouvelle Catégorie
          </button>
        </div>

        {/* STATS */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'14px', marginBottom:'22px' }}>
          {[
            { label:'Total catégories', val:categories.length, icon:'ti-tag', color:'var(--primary)' },
            { label:'Avec description', val:categories.filter(c => c.description).length, icon:'ti-file-text', color:'#2e7d32' },
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
              placeholder="Rechercher une catégorie..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ padding:'10px 16px 10px 40px', border:'1.5px solid var(--border)', borderRadius:'10px', fontSize:'13px', outline:'none', width:'360px', fontFamily:'Inter,sans-serif', background:'var(--white)', color:'var(--text-dark)' }}
              onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(212,175,55,0.1)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
            />
          </div>
        </div>

        {/* GRILLE CATEGORIES */}
        {loading ? (
          <div className="loading-container"><div className="loading-spinner" /></div>
        ) : (
          <>
            {categoriesFiltrees.length > 0 ? (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:'16px' }}>
                {categoriesFiltrees.map(c => (
                  <div key={c.id} style={{ background:'var(--white)', borderRadius:'16px', padding:'20px', border:'1px solid var(--border)', boxShadow:'var(--shadow)', transition:'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-gold)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow)'}
                  >
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                        <div style={{ width:'48px', height:'48px', background:'var(--noir)', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px', border:'1px solid rgba(212,175,55,0.2)' }}>
                          {getIcone(c.nom)}
                        </div>
                        <div>
                          <div style={{ fontFamily:'Playfair Display,serif', fontSize:'15px', fontWeight:700, color:'var(--noir)' }}>
                            {c.nom}
                          </div>
                          <div style={{ fontSize:'11px', color:'var(--text-light)', marginTop:'2px' }}>
                            Catégorie #{c.id}
                          </div>
                        </div>
                      </div>
                      <div style={{ display:'flex', gap:'6px' }}>
                        <button
                          className="btn-icon"
                          onClick={() => setViewCategorie(c)}
                          title="Voir"
                          style={{ background:'rgba(21,101,192,0.08)', color:'#1565c0', border:'1px solid rgba(21,101,192,0.2)' }}
                        >
                          <i className="ti ti-eye" />
                        </button>
                        <button className="btn-icon btn-edit" onClick={() => handleEdit(c)} title="Modifier">
                          <i className="ti ti-pencil" />
                        </button>
                        <button className="btn-icon btn-delete" onClick={() => handleDelete(c.id)} title="Supprimer">
                          <i className="ti ti-trash" />
                        </button>
                      </div>
                    </div>
                    {c.description && (
                      <p style={{ fontSize:'12px', color:'var(--text-mid)', lineHeight:1.5, margin:0, paddingTop:'10px', borderTop:'1px solid var(--border)' }}>
                        {c.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign:'center', padding:'60px', color:'var(--text-light)' }}>
                <i className="ti ti-tag" style={{ fontSize:'48px', opacity:0.2, display:'block', marginBottom:'12px' }} />
                {search ? 'Aucune catégorie trouvée' : 'Aucune catégorie enregistrée'}
              </div>
            )}
          </>
        )}
      </div>

      {/* MODAL CRÉER / MODIFIER */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {editCategorie ? '✏️ Modifier' : '✨ Nouvelle'}
                <span style={{ color:'var(--primary)', fontStyle:'italic' }}> Catégorie</span>
              </h2>
              <button className="modal-close" onClick={handleCloseModal}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Nom *</label>
                <input
                  type="text" value={form.nom} required
                  placeholder="ex: Robes, Voiles, Accessoires..."
                  onChange={e => setForm({ ...form, nom:e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={form.description} rows={3}
                  style={{ resize:'none' }}
                  placeholder="Description de la catégorie (optionnel)"
                  onChange={e => setForm({ ...form, description:e.target.value })}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                  Annuler
                </button>
                <button type="submit" className="btn-primary">
                  <i className="ti ti-check" style={{ fontSize:'15px' }} />
                  {editCategorie ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL VOIR */}
      {viewCategorie && (
        <div className="modal-overlay" onClick={() => setViewCategorie(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>👁️ Détail <span>Catégorie</span></h2>
              <button className="modal-close" onClick={() => setViewCategorie(null)}>✕</button>
            </div>
            <div className="modal-form">
              <div style={{ display:'flex', justifyContent:'center', marginBottom:'16px' }}>
                <div style={{ width:'70px', height:'70px', background:'var(--noir)', borderRadius:'16px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'32px', border:'2px solid rgba(212,175,55,0.3)' }}>
                  {getIcone(viewCategorie.nom)}
                </div>
              </div>
              {[
                { label:'Nom', val:viewCategorie.nom || '-' },
                { label:'Description', val:viewCategorie.description || 'Aucune description' },
              ].map((r, i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
                  <span style={{ fontSize:'12px', fontWeight:700, color:'var(--text-mid)', textTransform:'uppercase', letterSpacing:'0.5px' }}>{r.label}</span>
                  <span style={{ fontSize:'13px', color:'var(--text-dark)', fontWeight:600, textAlign:'right', maxWidth:'60%' }}>{r.val}</span>
                </div>
              ))}
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setViewCategorie(null);
                    handleEdit(viewCategorie);
                  }}
                >
                  <i className="ti ti-pencil" /> Modifier
                </button>
                <button type="button" className="btn-secondary" onClick={() => setViewCategorie(null)}>
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

export default Categories;
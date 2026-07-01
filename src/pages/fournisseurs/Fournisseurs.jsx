import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Navbar from '../../components/Navbar';
import api from '../../services/api';

const Fournisseurs = () => {
  const [fournisseurs, setFournisseurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [editFournisseur, setEditFournisseur] = useState(null);
  const [viewFournisseur, setViewFournisseur] = useState(null);
  const [form, setForm] = useState({
    nom:'', telephone:'', email:'', adresse:''
  });

  useEffect(() => { fetchFournisseurs(); }, []);

  const fetchFournisseurs = async () => {
    try {
      const r = await api.get('/fournisseurs');
      setFournisseurs(Array.isArray(r.data) ? r.data : []);
    } catch {
      toast.error('Erreur chargement fournisseurs');
      setFournisseurs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editFournisseur) {
        await api.put(`/fournisseurs/${editFournisseur.id}`, form);
        toast.success('Fournisseur modifié !');
      } else {
        await api.post('/fournisseurs', form);
        toast.success('Fournisseur créé !');
      }
      fetchFournisseurs();
      handleCloseModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur sauvegarde');
    }
  };

  const handleEdit = (f) => {
    setEditFournisseur(f);
    setForm({
      nom: f.nom,
      telephone: f.telephone || '',
      email: f.email || '',
      adresse: f.adresse || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce fournisseur ?')) return;
    try {
      await api.delete(`/fournisseurs/${id}`);
      toast.success('Fournisseur supprimé !');
      fetchFournisseurs();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur suppression');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditFournisseur(null);
    setForm({ nom:'', telephone:'', email:'', adresse:'' });
  };

  const fournisseursFiltres = fournisseurs.filter(f =>
    f.nom?.toLowerCase().includes(search.toLowerCase()) ||
    f.telephone?.includes(search) ||
    f.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-container">
      <Navbar />
      <div className="page-content">

        {/* HEADER */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'24px' }}>
          <div>
            <h1 style={{ fontFamily:'Playfair Display,serif', fontSize:'26px', fontWeight:700, color:'var(--noir)' }}>
              Gestion des Fournisseurs
            </h1>
            <p style={{ fontSize:'13px', color:'var(--text-light)', marginTop:'3px' }}>
              {fournisseurs.length} fournisseur{fournisseurs.length > 1 ? 's' : ''} enregistré{fournisseurs.length > 1 ? 's' : ''}
            </p>
          </div>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <i className="ti ti-plus" style={{ fontSize:'16px' }} />
            Nouveau Fournisseur
          </button>
        </div>

        {/* STATS */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'14px', marginBottom:'22px' }}>
          {[
            { label:'Total fournisseurs', val:fournisseurs.length, icon:'ti-truck', color:'var(--primary)' },
            { label:'Avec téléphone', val:fournisseurs.filter(f => f.telephone).length, icon:'ti-phone', color:'#2e7d32' },
            { label:'Avec email', val:fournisseurs.filter(f => f.email).length, icon:'ti-mail', color:'#1565c0' },
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
              placeholder="Rechercher un fournisseur..."
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
                  <th>Fournisseur</th>
                  <th>Téléphone</th>
                  <th>Email</th>
                  <th>Adresse</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {fournisseursFiltres.map(f => (
                  <tr key={f.id}>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:'11px' }}>
                        <div style={{ width:'40px', height:'40px', background:'var(--noir)', borderRadius:'11px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'15px', fontWeight:800, color:'var(--primary)', border:'1px solid rgba(212,175,55,0.2)', flexShrink:0 }}>
                          {f.nom?.[0]?.toUpperCase() || 'F'}
                        </div>
                        <div>
                          <div style={{ fontWeight:700, color:'var(--noir)', fontSize:'13px' }}>{f.nom}</div>
                          <div style={{ fontSize:'11px', color:'var(--text-light)', marginTop:'1px' }}>Fournisseur #{f.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      {f.telephone ? (
                        <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                          <i className="ti ti-phone" style={{ fontSize:'13px', color:'var(--primary)' }} />
                          <span style={{ fontSize:'13px', color:'var(--text-mid)' }}>{f.telephone}</span>
                        </div>
                      ) : '-'}
                    </td>
                    <td>
                      {f.email ? (
                        <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                          <i className="ti ti-mail" style={{ fontSize:'13px', color:'var(--primary)' }} />
                          <span style={{ fontSize:'13px', color:'var(--text-mid)' }}>{f.email}</span>
                        </div>
                      ) : '-'}
                    </td>
                    <td style={{ fontSize:'13px', color:'var(--text-mid)' }}>
                      {f.adresse || '-'}
                    </td>
                    <td>
                      <div style={{ display:'flex', gap:'6px' }}>
                        <button
                          className="btn-icon"
                          onClick={() => setViewFournisseur(f)}
                          title="Voir"
                          style={{ background:'rgba(21,101,192,0.08)', color:'#1565c0', border:'1px solid rgba(21,101,192,0.2)' }}
                        >
                          <i className="ti ti-eye" />
                        </button>
                        <button className="btn-icon btn-edit" onClick={() => handleEdit(f)} title="Modifier">
                          <i className="ti ti-pencil" />
                        </button>
                        <button className="btn-icon btn-delete" onClick={() => handleDelete(f.id)} title="Supprimer">
                          <i className="ti ti-trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {fournisseursFiltres.length === 0 && (
              <div style={{ textAlign:'center', padding:'60px', color:'var(--text-light)' }}>
                <i className="ti ti-truck" style={{ fontSize:'48px', opacity:0.2, display:'block', marginBottom:'12px' }} />
                {search ? 'Aucun fournisseur trouvé' : 'Aucun fournisseur enregistré'}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL CRÉER / MODIFIER */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {editFournisseur ? '✏️ Modifier' : '🚚 Nouveau'}
                <span style={{ color:'var(--primary)', fontStyle:'italic' }}> Fournisseur</span>
              </h2>
              <button className="modal-close" onClick={handleCloseModal}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Nom *</label>
                <input
                  type="text" value={form.nom} required
                  placeholder="Nom du fournisseur"
                  onChange={e => setForm({ ...form, nom:e.target.value })}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Téléphone</label>
                  <input
                    type="text" value={form.telephone}
                    placeholder="+224 6XX XXX XXX"
                    onChange={e => setForm({ ...form, telephone:e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email" value={form.email}
                    placeholder="email@fournisseur.com"
                    onChange={e => setForm({ ...form, email:e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Adresse</label>
                <textarea
                  value={form.adresse} rows={2}
                  style={{ resize:'none' }}
                  placeholder="Adresse du fournisseur"
                  onChange={e => setForm({ ...form, adresse:e.target.value })}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                  Annuler
                </button>
                <button type="submit" className="btn-primary">
                  <i className="ti ti-check" style={{ fontSize:'15px' }} />
                  {editFournisseur ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL VOIR */}
      {viewFournisseur && (
        <div className="modal-overlay" onClick={() => setViewFournisseur(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>👁️ Détail <span>Fournisseur</span></h2>
              <button className="modal-close" onClick={() => setViewFournisseur(null)}>✕</button>
            </div>
            <div className="modal-form">
              <div style={{ display:'flex', justifyContent:'center', marginBottom:'16px' }}>
                <div style={{ width:'70px', height:'70px', background:'var(--noir)', borderRadius:'16px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'28px', fontWeight:800, color:'var(--primary)', border:'2px solid rgba(212,175,55,0.3)' }}>
                  {viewFournisseur.nom?.[0]?.toUpperCase() || 'F'}
                </div>
              </div>
              {[
                { label:'Nom', val:viewFournisseur.nom || '-' },
                { label:'Téléphone', val:viewFournisseur.telephone || '-' },
                { label:'Email', val:viewFournisseur.email || '-' },
                { label:'Adresse', val:viewFournisseur.adresse || '-' },
              ].map((r, i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
                  <span style={{ fontSize:'12px', fontWeight:700, color:'var(--text-mid)', textTransform:'uppercase', letterSpacing:'0.5px' }}>{r.label}</span>
                  <span style={{ fontSize:'13px', color:'var(--text-dark)', fontWeight:600 }}>{r.val}</span>
                </div>
              ))}
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setViewFournisseur(null);
                    handleEdit(viewFournisseur);
                  }}
                >
                  <i className="ti ti-pencil" /> Modifier
                </button>
                <button type="button" className="btn-secondary" onClick={() => setViewFournisseur(null)}>
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

export default Fournisseurs;
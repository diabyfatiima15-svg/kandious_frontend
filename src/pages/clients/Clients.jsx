import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Navbar from '../../components/Navbar';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Clients = () => {
  const { hasRole } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [clientEdit, setClientEdit] = useState(null);
  const [viewClient, setViewClient] = useState(null);
  const [form, setForm] = useState({
    nom:'', prenom:'', telephone:'', email:'', adresse:''
  });

  // Droits par rôle
  const estAdmin = hasRole('ADMIN');
  const peutModifier = hasRole('ADMIN') || hasRole('VENDEUR');
  const peutCreer = hasRole('ADMIN') || hasRole('VENDEUR') || hasRole('CAISSIER');

  useEffect(() => { fetchClients(); }, []);

  const fetchClients = async () => {
    try {
      const r = await api.get('/clients');
      setClients(Array.isArray(r.data) ? r.data : []);
    } catch { toast.error('Erreur chargement clients'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (clientEdit) {
        await api.put(`/clients/${clientEdit.id}`, form);
        toast.success('Cliente modifiée !');
      } else {
        await api.post('/clients', form);
        toast.success('Cliente créée !');
      }
      fetchClients();
      handleCloseModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur sauvegarde');
    }
  };

  const handleEdit = (c) => {
    setClientEdit(c);
    setForm({
      nom:c.nom, prenom:c.prenom||'',
      telephone:c.telephone||'', email:c.email||'', adresse:c.adresse||''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette cliente ?')) return;
    try {
      await api.delete(`/clients/${id}`);
      toast.success('Cliente supprimée !');
      fetchClients();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur suppression');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setClientEdit(null);
    setForm({ nom:'', prenom:'', telephone:'', email:'', adresse:'' });
  };

  const clientsFiltres = clients.filter(c =>
    c.nom?.toLowerCase().includes(search.toLowerCase()) ||
    c.prenom?.toLowerCase().includes(search.toLowerCase()) ||
    c.telephone?.includes(search)
  );

  const getAvatarColor = (nom) => {
    const colors = [
      { bg:'#1a1a2e', color:'#d4af37' },
      { bg:'#2e1a1a', color:'#d4af37' },
      { bg:'#1a2e1a', color:'#d4af37' },
      { bg:'#1a1a2e', color:'#d4af37' },
    ];
    return colors[(nom?.charCodeAt(0) || 0) % colors.length];
  };

  const getPointsBadge = (pts) => {
    if (pts >= 100) return { label:'VIP ⭐', bg:'rgba(212,175,55,0.15)', color:'#b8960c' };
    if (pts >= 50) return { label:'Gold 🥇', bg:'rgba(212,175,55,0.1)', color:'#b8960c' };
    if (pts >= 20) return { label:'Silver 🥈', bg:'rgba(150,150,150,0.1)', color:'#666' };
    return { label:`${pts} pts`, bg:'var(--creme)', color:'var(--text-light)' };
  };

  return (
    <div className="page-container">
      <Navbar />
      <div className="page-content">

        {/* HEADER */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'24px' }}>
          <div>
            <h1 style={{ fontFamily:'Playfair Display,serif', fontSize:'26px', fontWeight:700, color:'var(--noir)' }}>
              Gestion des Clientes
            </h1>
            <p style={{ fontSize:'13px', color:'var(--text-light)', marginTop:'3px' }}>
              {clients.length} cliente{clients.length > 1 ? 's' : ''} enregistrée{clients.length > 1 ? 's' : ''}
            </p>
          </div>
          {/* Bouton Nouvelle Cliente — Admin + Vendeur + Caissier */}
          {peutCreer && (
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              <i className="ti ti-user-plus" style={{ fontSize:'16px' }} />
              Nouvelle Cliente
            </button>
          )}
        </div>

        {/* STATS */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'14px', marginBottom:'22px' }}>
          {[
            { label:'Total clientes', val:clients.length, icon:'ti-users', color:'var(--primary)' },
            { label:'Clientes VIP', val:clients.filter(c=>c.pointsFidelite>=100).length, icon:'ti-crown', color:'#b8960c' },
            { label:'Gold', val:clients.filter(c=>c.pointsFidelite>=50&&c.pointsFidelite<100).length, icon:'ti-medal', color:'#b8960c' },
            { label:'Points total', val:clients.reduce((s,c)=>s+(c.pointsFidelite||0),0), icon:'ti-star', color:'#e65100' },
          ].map((s, i) => (
            <div key={i} style={{ background:'var(--white)', borderRadius:'14px', padding:'18px 20px', border:'1px solid var(--border)', boxShadow:'var(--shadow)', display:'flex', alignItems:'center', gap:'14px' }}>
              <div style={{ width:'42px', height:'42px', background: i === 0 ? 'var(--noir)' : 'rgba(212,175,55,0.08)', borderRadius:'11px', display:'flex', alignItems:'center', justifyContent:'center', border: i === 0 ? '1px solid rgba(212,175,55,0.3)' : '1px solid rgba(212,175,55,0.15)' }}>
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
              placeholder="Rechercher une cliente..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ padding:'10px 16px 10px 40px', border:'1.5px solid var(--border)', borderRadius:'10px', fontSize:'13px', outline:'none', width:'360px', fontFamily:'Inter,sans-serif', transition:'all 0.2s' }}
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
                  <th>Cliente</th>
                  <th>Téléphone</th>
                  <th>Email</th>
                  <th>Adresse</th>
                  <th>Fidélité</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {clientsFiltres.map(c => {
                  const av = getAvatarColor(c.nom);
                  const pts = getPointsBadge(c.pointsFidelite || 0);
                  return (
                    <tr key={c.id}>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:'11px' }}>
                          <div style={{ width:'40px', height:'40px', background:av.bg, borderRadius:'11px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', fontWeight:800, color:av.color, border:'1px solid rgba(212,175,55,0.2)', flexShrink:0 }}>
                            {c.nom?.[0]}{c.prenom?.[0]}
                          </div>
                          <div>
                            <div style={{ fontWeight:700, color:'var(--noir)', fontSize:'13px' }}>{c.nom} {c.prenom}</div>
                            <div style={{ fontSize:'11px', color:'var(--text-light)', marginTop:'1px' }}>Cliente #{c.id}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        {c.telephone ? (
                          <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                            <i className="ti ti-phone" style={{ fontSize:'13px', color:'var(--primary)' }} />
                            <span style={{ fontSize:'13px', color:'var(--text-mid)' }}>{c.telephone}</span>
                          </div>
                        ) : '-'}
                      </td>
                      <td>
                        {c.email ? (
                          <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                            <i className="ti ti-mail" style={{ fontSize:'13px', color:'var(--primary)' }} />
                            <span style={{ fontSize:'13px', color:'var(--text-mid)' }}>{c.email}</span>
                          </div>
                        ) : '-'}
                      </td>
                      <td style={{ fontSize:'13px', color:'var(--text-mid)' }}>{c.adresse || '-'}</td>
                      <td>
                        <span style={{ background:pts.bg, color:pts.color, padding:'4px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:700, border:`1px solid ${pts.color}30` }}>
                          {pts.label}
                        </span>
                      </td>
                      <td>
                        <div style={{ display:'flex', gap:'6px' }}>

                          {/* Voir — tout le monde */}
                          <button className="btn-icon" onClick={() => setViewClient(c)} title="Voir"
                            style={{ background:'rgba(21,101,192,0.08)', color:'#1565c0', border:'1px solid rgba(21,101,192,0.2)' }}>
                            <i className="ti ti-eye" />
                          </button>

                          {/* Modifier — Admin + Vendeur */}
                          {peutModifier && (
                            <button className="btn-icon btn-edit" onClick={() => handleEdit(c)} title="Modifier">
                              <i className="ti ti-pencil" />
                            </button>
                          )}

                          {/* Supprimer — Admin seulement */}
                          {estAdmin && (
                            <button className="btn-icon btn-delete" onClick={() => handleDelete(c.id)} title="Supprimer">
                              <i className="ti ti-trash" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {clientsFiltres.length === 0 && (
              <div style={{ textAlign:'center', padding:'60px', color:'var(--text-light)' }}>
                <i className="ti ti-users" style={{ fontSize:'48px', opacity:0.2, display:'block', marginBottom:'12px' }} />
                Aucune cliente trouvée
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL CRÉER/MODIFIER — Admin + Vendeur + Caissier (créer) / Admin + Vendeur (modifier) */}
      {showModal && peutCreer && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{clientEdit ? '✏️ Modifier' : '✨ Nouvelle'} Cliente</h2>
              <button className="modal-close" onClick={handleCloseModal}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div style={{ display:'flex', justifyContent:'center', marginBottom:'8px' }}>
                <div style={{ width:'70px', height:'70px', background:'var(--noir)', borderRadius:'16px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px', fontWeight:800, color:'var(--primary)', border:'2px solid rgba(212,175,55,0.3)' }}>
                  {form.nom?.[0] || '?'}{form.prenom?.[0] || ''}
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Nom *</label>
                  <input type="text" value={form.nom} onChange={e => setForm({...form, nom:e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Prénom</label>
                  <input type="text" value={form.prenom} onChange={e => setForm({...form, prenom:e.target.value})} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Téléphone</label>
                  <input type="text" value={form.telephone} onChange={e => setForm({...form, telephone:e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={form.email} onChange={e => setForm({...form, email:e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label>Adresse</label>
                <textarea value={form.adresse} onChange={e => setForm({...form, adresse:e.target.value})} rows={2} style={{ resize:'none' }} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>Annuler</button>
                <button type="submit" className="btn-primary">
                  <i className="ti ti-check" style={{ fontSize:'15px' }} />
                  {clientEdit ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL VOIR CLIENTE — tout le monde */}
      {viewClient && (
        <div className="modal-overlay" onClick={() => setViewClient(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>👁️ Détail <span>Cliente</span></h2>
              <button className="modal-close" onClick={() => setViewClient(null)}>✕</button>
            </div>
            <div className="modal-form">
              <div style={{ display:'flex', justifyContent:'center', marginBottom:'8px' }}>
                <div style={{ width:'70px', height:'70px', background:'var(--noir)', borderRadius:'16px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px', fontWeight:800, color:'var(--primary)', border:'2px solid rgba(212,175,55,0.3)' }}>
                  {viewClient.nom?.[0] || '?'}{viewClient.prenom?.[0] || ''}
                </div>
              </div>
              {[
                { label:'Nom complet', val:`${viewClient.nom} ${viewClient.prenom || ''}`.trim() },
                { label:'Téléphone', val:viewClient.telephone || '-' },
                { label:'Email', val:viewClient.email || '-' },
                { label:'Adresse', val:viewClient.adresse || '-' },
                { label:'Points fidélité', val:`${viewClient.pointsFidelite || 0} points` },
              ].map((r, i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
                  <span style={{ fontSize:'12px', fontWeight:700, color:'var(--text-mid)', textTransform:'uppercase', letterSpacing:'0.5px' }}>{r.label}</span>
                  <span style={{ fontSize:'13px', color:'var(--text-dark)', fontWeight:600 }}>{r.val}</span>
                </div>
              ))}
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setViewClient(null)}>Fermer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
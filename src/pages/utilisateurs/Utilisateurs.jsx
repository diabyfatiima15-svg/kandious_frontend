import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Navbar from '../../components/Navbar';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Utilisateurs = () => {
  const { user } = useAuth();
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [search, setSearch] = useState('');
  const [viewUser, setViewUser] = useState(null);
  const [form, setForm] = useState({
    nom:'', prenom:'', email:'',
    motDePasse:'', role:'VENDEUR', actif:true
  });

  const utilisateursFiltres = utilisateurs.filter(u =>
    u.nom?.toLowerCase().includes(search.toLowerCase()) ||
    u.prenom?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.role?.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => { fetchUtilisateurs(); }, []);

  const fetchUtilisateurs = async () => {
    try {
      const r = await api.get('/utilisateurs');
      const data = Array.isArray(r.data) ? r.data : [];
      setUtilisateurs(data);
    } catch {
      toast.error('Erreur chargement utilisateurs');
      setUtilisateurs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editUser) {
        await api.put(`/utilisateurs/${editUser.id}`, form);
        toast.success('Utilisateur modifié !');
      } else {
        await api.post('/utilisateurs', form);
        toast.success('Utilisateur créé !');
      }
      fetchUtilisateurs();
      handleCloseModal();
    } catch (error) {
      toast.error(error.response?.data?.message
        || 'Erreur lors de l\'opération');
    }
  };

  const handleEdit = (u) => {
    setEditUser(u);
    setForm({
      nom: u.nom,
      prenom: u.prenom || '',
      email: u.email,
      motDePasse: '',
      role: u.role,
      actif: u.actif,
    });
    setShowModal(true);
  };

  const handleToggleActif = async (u) => {
    try {
      await api.put(`/utilisateurs/${u.id}`, {
        ...u, actif: !u.actif
      });
      toast.success(!u.actif ? 'Compte activé !' : 'Compte désactivé !');
      fetchUtilisateurs();
    } catch {
      toast.error('Erreur lors de la modification');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet utilisateur ?')) return;
    try {
      await api.delete(`/utilisateurs/${id}`);
      toast.success('Utilisateur supprimé !');
      fetchUtilisateurs();
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditUser(null);
    setForm({
      nom:'', prenom:'', email:'',
      motDePasse:'', role:'VENDEUR', actif:true
    });
  };

  const getRoleBadge = (role) => {
    if (role === 'ADMIN') return {
      label:'Admin', bg:'rgba(212,175,55,0.15)',
      color:'#b8960c', icon:'ti-shield'
    };
    if (role === 'VENDEUR') return {
      label:'Vendeur', bg:'#e8f5e9',
      color:'#2e7d32', icon:'ti-tag'
    };
    return {
      label:'Caissier', bg:'#e3f2fd',
      color:'#1565c0', icon:'ti-cash'
    };
  };

  const getInitiales = (nom, prenom) =>
    `${nom?.[0] || ''}${prenom?.[0] || ''}`.toUpperCase();

  return (
    <div className="page-container">
      <Navbar />
      <div className="page-content">

        {/* HEADER */}
        <div style={{
          display:'flex', justifyContent:'space-between',
          alignItems:'flex-start', marginBottom:'24px'
        }}>
          <div>
            <h1 style={{
              fontFamily:'Playfair Display,serif',
              fontSize:'26px', fontWeight:700, color:'var(--noir)'
            }}>
              Gestion des Utilisateurs
            </h1>
            <p style={{
              fontSize:'13px', color:'var(--text-light)', marginTop:'3px'
            }}>
              {utilisateurs.length} utilisateur
              {utilisateurs.length > 1 ? 's' : ''} au total
            </p>
          </div>
          <button className="btn-primary"
            onClick={() => setShowModal(true)}>
            <i className="ti ti-user-plus" style={{ fontSize:'16px' }} />
            Nouvel Utilisateur
          </button>
        </div>

        {/* STATS */}
        <div style={{
          display:'grid', gridTemplateColumns:'repeat(4,1fr)',
          gap:'14px', marginBottom:'22px'
        }}>
          {[
            { label:'Total', val:utilisateurs.length,
              icon:'ti-users', color:'var(--primary)' },
            { label:'Admins',
              val:utilisateurs.filter(u => u.role === 'ADMIN').length,
              icon:'ti-shield', color:'#b8960c' },
            { label:'Vendeurs',
              val:utilisateurs.filter(u => u.role === 'VENDEUR').length,
              icon:'ti-tag', color:'#2e7d32' },
            { label:'Caissiers',
              val:utilisateurs.filter(u => u.role === 'CAISSIER').length,
              icon:'ti-cash', color:'#1565c0' },
          ].map((s, i) => (
            <div key={i} style={{
              background:'var(--white)', borderRadius:'14px',
              padding:'18px 20px', border:'1px solid var(--border)',
              boxShadow:'var(--shadow)',
              display:'flex', alignItems:'center', gap:'14px',
            }}>
              <div style={{
                width:'42px', height:'42px',
                background: i === 0 ? 'var(--noir)' : `${s.color}18`,
                borderRadius:'11px',
                display:'flex', alignItems:'center', justifyContent:'center',
                border: i === 0
                  ? '1px solid rgba(212,175,55,0.3)' : 'none',
              }}>
                <i className={`ti ${s.icon}`}
                  style={{ fontSize:'20px', color:s.color }} />
              </div>
              <div>
                <div style={{
                  fontFamily:'Playfair Display,serif',
                  fontSize:'24px', fontWeight:700,
                  color:'var(--noir)', lineHeight:1,
                }}>{s.val}</div>
                <div style={{
                  fontSize:'11px', color:'var(--text-light)',
                  marginTop:'3px'
                }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* SEARCH */}
        <div style={{ marginBottom:'16px' }}>
          <div style={{ position:'relative', display:'inline-block' }}>
            <i className="ti ti-search" style={{
              position:'absolute', left:'13px', top:'50%',
              transform:'translateY(-50%)',
              color:'var(--text-light)', fontSize:'16px', zIndex:1,
            }} />
            <input
              type="text"
              placeholder="Rechercher par nom, email, rôle..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                padding:'10px 16px 10px 40px',
                border:'1.5px solid var(--border)',
                borderRadius:'10px', fontSize:'13px',
                outline:'none', width:'360px',
                fontFamily:'Inter,sans-serif',
                background:'var(--white)', color:'var(--text-dark)',
              }}
              onFocus={e => {
                e.target.style.borderColor = 'var(--primary)';
                e.target.style.boxShadow = '0 0 0 3px rgba(212,175,55,0.1)';
              }}
              onBlur={e => {
                e.target.style.borderColor = 'var(--border)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
        </div>

        {/* TABLE */}
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner" />
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Utilisateur</th>
                  <th>Email</th>
                  <th>Rôle</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {utilisateursFiltres.map(u => {
                  const rb = getRoleBadge(u.role);
                  const estMoi = u.id === user?.id;
                  return (
                    <tr key={u.id} style={{
                      background: estMoi
                        ? 'rgba(212,175,55,0.03)' : 'transparent'
                    }}>
                      <td>
                        <div style={{
                          display:'flex', alignItems:'center', gap:'10px'
                        }}>
                          <div style={{
                            width:'38px', height:'38px',
                            background: estMoi
                              ? 'var(--primary)' : 'var(--noir)',
                            borderRadius:'10px',
                            display:'flex', alignItems:'center',
                            justifyContent:'center',
                            fontSize:'13px', fontWeight:800,
                            color: estMoi ? 'var(--noir)' : 'var(--primary)',
                            border:'1px solid rgba(212,175,55,0.2)',
                            flexShrink:0,
                          }}>
                            {getInitiales(u.nom, u.prenom)}
                          </div>
                          <div>
                            <div style={{
                              fontWeight:700, color:'var(--noir)',
                              fontSize:'13px'
                            }}>
                              {u.nom} {u.prenom || ''}
                              {estMoi && (
                                <span style={{
                                  marginLeft:'6px',
                                  fontSize:'10px',
                                  color:'var(--primary)',
                                  fontWeight:600,
                                }}>
                                  (vous)
                                </span>
                              )}
                            </div>
                            <div style={{
                              fontSize:'11px', color:'var(--text-light)'
                            }}>
                              #{u.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{
                        fontSize:'13px', color:'var(--text-mid)'
                      }}>
                        <div style={{
                          display:'flex', alignItems:'center', gap:'6px'
                        }}>
                          <i className="ti ti-mail" style={{
                            fontSize:'13px', color:'var(--primary)'
                          }} />
                          {u.email}
                        </div>
                      </td>
                      <td>
                        <span style={{
                          background:rb.bg, color:rb.color,
                          padding:'4px 10px', borderRadius:'20px',
                          fontSize:'11px', fontWeight:700,
                          display:'inline-flex',
                          alignItems:'center', gap:'5px'
                        }}>
                          <i className={`ti ${rb.icon}`}
                            style={{ fontSize:'12px' }} />
                          {rb.label}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          background: u.actif ? '#e8f5e9' : '#ffebee',
                          color: u.actif ? '#2e7d32' : '#c62828',
                          padding:'4px 10px', borderRadius:'20px',
                          fontSize:'11px', fontWeight:700,
                        }}>
                          {u.actif ? '✅ Actif' : '❌ Inactif'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display:'flex', gap:'6px' }}>

                          {/* Voir — toujours disponible */}
                          <button
                            onClick={() => setViewUser(u)}
                            className="btn-icon"
                            title="Voir"
                            style={{
                              background:'rgba(21,101,192,0.08)', color:'#1565c0',
                              border:'1px solid rgba(21,101,192,0.2)',
                            }}
                          >
                            <i className="ti ti-eye" />
                          </button>

                          {/* Modifier — toujours disponible */}
                          <button
                            onClick={() => handleEdit(u)}
                            className="btn-icon btn-edit"
                            title="Modifier"
                          >
                            <i className="ti ti-edit" />
                          </button>

                          {/* Désactiver/Activer — pas sur son propre compte */}
                          {!estMoi && (
                            <button
                              onClick={() => handleToggleActif(u)}
                              title={u.actif ? 'Désactiver' : 'Activer'}
                              style={{
                                background: u.actif
                                  ? '#fff3e0' : '#e8f5e9',
                                color: u.actif ? '#e65100' : '#2e7d32',
                                border:`1px solid ${u.actif
                                  ? '#ffe0b2' : '#c8e6c9'}`,
                                padding:'6px 10px', borderRadius:'8px',
                                cursor:'pointer', fontSize:'12px',
                              }}
                            >
                              <i className={`ti ${u.actif
                                ? 'ti-user-off' : 'ti-user-check'}`} />
                            </button>
                          )}

                          {/* Supprimer — pas sur son propre compte */}
                          {!estMoi && (
                            <button
                              onClick={() => handleDelete(u.id)}
                              className="btn-icon btn-delete"
                              title="Supprimer"
                            >
                              <i className="ti ti-trash" />
                            </button>
                          )}

                          {/* Badge compte connecté */}
                          {estMoi && (
                            <span style={{
                              fontSize:'11px', color:'var(--primary)',
                              fontStyle:'italic', fontWeight:600,
                              display:'flex', alignItems:'center',
                              gap:'4px'
                            }}>
                              <i className="ti ti-crown"
                                style={{ fontSize:'13px' }} />
                              Mon compte
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {utilisateursFiltres.length === 0 && (
              <div style={{
                textAlign:'center', padding:'60px',
                color:'var(--text-light)'
              }}>
                <i className="ti ti-users" style={{
                  fontSize:'48px', opacity:0.2,
                  display:'block', marginBottom:'12px'
                }} />
                Aucun utilisateur trouvé
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal"
            onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {editUser ? '✏️ Modifier' : '👤 Nouvel'}
                <span style={{
                  color:'var(--primary)', fontStyle:'italic'
                }}> Utilisateur</span>
              </h2>
              <button className="modal-close"
                onClick={handleCloseModal}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Nom *</label>
                  <input
                    type="text" value={form.nom} required
                    onChange={e => setForm({
                      ...form, nom:e.target.value
                    })}
                    placeholder="Nom de famille"
                  />
                </div>
                <div className="form-group">
                  <label>Prénom</label>
                  <input
                    type="text" value={form.prenom}
                    onChange={e => setForm({
                      ...form, prenom:e.target.value
                    })}
                    placeholder="Prénom"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email" value={form.email} required
                  onChange={e => setForm({
                    ...form, email:e.target.value
                  })}
                  placeholder="email@exemple.com"
                />
              </div>

              <div className="form-group">
                <label>
                  {editUser
                    ? 'Nouveau mot de passe (laisser vide = inchangé)'
                    : 'Mot de passe *'}
                </label>
                <input
                  type="password" value={form.motDePasse}
                  required={!editUser}
                  onChange={e => setForm({
                    ...form, motDePasse:e.target.value
                  })}
                  placeholder={editUser
                    ? 'Laisser vide pour ne pas changer'
                    : 'Mot de passe'}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Rôle *</label>
                  <select
                    value={form.role}
                    disabled={editUser && editUser.id === user?.id}
                    onChange={e => setForm({
                      ...form, role:e.target.value
                    })}
                  >
                    <option value="ADMIN">👑 Admin</option>
                    <option value="VENDEUR">🏷️ Vendeur</option>
                    <option value="CAISSIER">💰 Caissier</option>
                  </select>
                  {editUser && editUser.id === user?.id && (
                    <small style={{
                      fontSize:'11px', color:'var(--text-light)'
                    }}>
                      Vous ne pouvez pas modifier votre propre rôle.
                    </small>
                  )}
                </div>
                <div className="form-group">
                  <label>Statut</label>
                  <select
                    value={form.actif}
                    disabled={editUser && editUser.id === user?.id}
                    onChange={e => setForm({
                      ...form, actif:e.target.value === 'true'
                    })}
                  >
                    <option value="true">✅ Actif</option>
                    <option value="false">❌ Inactif</option>
                  </select>
                  {editUser && editUser.id === user?.id && (
                    <small style={{
                      fontSize:'11px', color:'var(--text-light)'
                    }}>
                      Vous ne pouvez pas désactiver votre propre compte.
                    </small>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary"
                  onClick={handleCloseModal}>
                  Annuler
                </button>
                <button type="submit" className="btn-primary">
                  <i className="ti ti-check"
                    style={{ fontSize:'15px' }} />
                  {editUser ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL VOIR UTILISATEUR */}
      {viewUser && (
        <div className="modal-overlay" onClick={() => setViewUser(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>👁️ Détail <span>Utilisateur</span></h2>
              <button className="modal-close" onClick={() => setViewUser(null)}>✕</button>
            </div>
            <div className="modal-form">
              <div style={{ display:'flex', justifyContent:'center', marginBottom:'8px' }}>
                <div style={{
                  width:'70px', height:'70px',
                  background:'var(--noir)', borderRadius:'16px',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'22px', fontWeight:800, color:'var(--primary)',
                  border:'2px solid rgba(212,175,55,0.3)',
                }}>
                  {getInitiales(viewUser.nom, viewUser.prenom)}
                </div>
              </div>
              {[
                { label:'Nom complet', val:`${viewUser.nom} ${viewUser.prenom || ''}`.trim() },
                { label:'Email', val:viewUser.email || '-' },
                { label:'Rôle', val:getRoleBadge(viewUser.role).label },
                { label:'Statut', val:viewUser.actif ? 'Actif' : 'Inactif' },
                { label:'Identifiant', val:`#${viewUser.id}` },
              ].map((r, i) => (
                <div key={i} style={{
                  display:'flex', justifyContent:'space-between',
                  padding:'10px 0', borderBottom:'1px solid var(--border)',
                }}>
                  <span style={{ fontSize:'12px', fontWeight:700, color:'var(--text-mid)', textTransform:'uppercase', letterSpacing:'0.5px' }}>
                    {r.label}
                  </span>
                  <span style={{ fontSize:'13px', color:'var(--text-dark)', fontWeight:600 }}>
                    {r.val}
                  </span>
                </div>
              ))}
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setViewUser(null)}>
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

export default Utilisateurs;
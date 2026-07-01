import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Navbar from '../../components/Navbar';
import api from '../../services/api';

const Historique = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtreAction, setFiltreAction] = useState('TOUS');

  useEffect(() => { fetchLogs(); }, []);

  const fetchLogs = async () => {
    try {
      const r = await api.get('/logs');
      setLogs(Array.isArray(r.data) ? r.data : []);
    } catch {
      toast.error('Erreur chargement historique');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm(
      "Supprimer définitivement tout l'historique ? " +
      "Cette action est irréversible."
    )) return;
    try {
      await api.delete('/logs');
      toast.success('Historique vidé !');
      setLogs([]);
    } catch {
      toast.error('Erreur suppression');
    }
  };

  const getActionStyle = (action) => {
    const a = action?.toUpperCase() || '';

    if (a.includes('CONNEXION'))
      return { bg:'#e3f2fd', color:'#1565c0', icon:'ti-login' };
    if (a.includes('INSCRIPTION'))
      return { bg:'#e0f2f1', color:'#00796b', icon:'ti-user-plus' };

    if (a.includes('CREATION'))
      return { bg:'#e8f5e9', color:'#2e7d32', icon:'ti-plus' };
    if (a.includes('MODIFICATION') || a.includes('MAJ_'))
      return { bg:'#e3f2fd', color:'#1565c0', icon:'ti-pencil' };
    if (a.includes('SUPPRESSION'))
      return { bg:'#ffebee', color:'#c62828', icon:'ti-trash' };

    if (a.includes('ANNULATION'))
      return { bg:'#fff3e0', color:'#e65100', icon:'ti-circle-x' };
    if (a.includes('RECEPTION'))
      return { bg:'#f3e5f5', color:'#7b1fa2', icon:'ti-package' };

    if (a.includes('ACTIVATION') && !a.includes('DES'))
      return { bg:'#e8f5e9', color:'#2e7d32', icon:'ti-circle-check' };
    if (a.includes('DESACTIVATION'))
      return { bg:'#ffebee', color:'#c62828', icon:'ti-circle-minus' };

    if (a.includes('MOT_DE_PASSE'))
      return { bg:'#fce4ec', color:'#ad1457', icon:'ti-key' };

    if (a.includes('GENERATION_FACTURE'))
      return { bg:'#fff8e1', color:'#f57f17', icon:'ti-file-invoice' };
    if (a.includes('EXPORT_EXCEL'))
      return { bg:'#e8f5e9', color:'#388e3c', icon:'ti-file-spreadsheet' };

    if (a.includes('VENTE'))
      return { bg:'#f3e5f5', color:'#7b1fa2', icon:'ti-shopping-cart' };
    if (a.includes('ACHAT'))
      return { bg:'#fff3e0', color:'#e65100', icon:'ti-package' };
    if (a.includes('PRODUIT'))
      return { bg:'#e0f2f1', color:'#00897b', icon:'ti-hanger' };
    if (a.includes('CLIENT'))
      return { bg:'#fce4ec', color:'#c2185b', icon:'ti-users' };
    if (a.includes('UTILISATEUR'))
      return { bg:'#e8eaf6', color:'#3949ab', icon:'ti-shield' };

    return { bg:'var(--creme)', color:'var(--text-mid)', icon:'ti-info-circle' };
  };

  const actionsUniques = ['TOUS', ...new Set(logs.map(l => l.action))];

  const logsFiltres = logs.filter(l => {
    const matchSearch =
      l.action?.toLowerCase().includes(search.toLowerCase()) ||
      l.details?.toLowerCase().includes(search.toLowerCase()) ||
      l.utilisateur?.nom?.toLowerCase().includes(search.toLowerCase()) ||
      l.utilisateur?.prenom?.toLowerCase().includes(search.toLowerCase());
    const matchAction =
      filtreAction === 'TOUS' || l.action === filtreAction;
    return matchSearch && matchAction;
  });

  const formatDate = (date) => {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR') + ' à ' +
           d.toLocaleTimeString('fr-FR', {
             hour:'2-digit', minute:'2-digit'
           });
  };

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
              Historique des activités
            </h1>
            <p style={{
              fontSize:'13px', color:'var(--text-light)', marginTop:'3px'
            }}>
              {logs.length} action{logs.length > 1 ? 's' : ''}{' '}
              enregistrée{logs.length > 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={handleDeleteAll}
            style={{
              display:'flex', alignItems:'center', gap:'6px',
              background:'#ffebee', color:'#c62828',
              border:'1px solid #ffcdd2',
              padding:'9px 16px', borderRadius:'10px',
              fontSize:'13px', fontWeight:600, cursor:'pointer',
            }}
          >
            <i className="ti ti-trash" style={{ fontSize:'15px' }} />
            Vider l'historique
          </button>
        </div>

        {/* STATS */}
        <div style={{
          display:'grid', gridTemplateColumns:'repeat(4,1fr)',
          gap:'14px', marginBottom:'22px'
        }}>
          {[
            { label:'Total actions', val:logs.length,
              icon:'ti-history', color:'var(--primary)' },
            { label:'Aujourd\'hui',
              val:logs.filter(l => {
                const d = new Date(l.dateAction);
                const today = new Date();
                return d.toDateString() === today.toDateString();
              }).length,
              icon:'ti-calendar', color:'#2e7d32' },
            { label:'Connexions',
              val:logs.filter(l =>
                l.action?.toUpperCase().includes('CONNEXION')).length,
              icon:'ti-login', color:'#1565c0' },
            { label:'Suppressions',
              val:logs.filter(l =>
                l.action?.toUpperCase().includes('SUPPRESSION')).length,
              icon:'ti-trash', color:'#c62828' },
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
                border: i === 0 ? '1px solid rgba(212,175,55,0.3)' : 'none',
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
                  fontSize:'11px', color:'var(--text-light)', marginTop:'3px'
                }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* SEARCH + FILTRE */}
        <div style={{
          display:'flex', gap:'12px', marginBottom:'16px',
          flexWrap:'wrap'
        }}>
          <div style={{ position:'relative', display:'inline-block' }}>
            <i className="ti ti-search" style={{
              position:'absolute', left:'13px', top:'50%',
              transform:'translateY(-50%)',
              color:'var(--text-light)', fontSize:'16px', zIndex:1,
            }} />
            <input
              type="text"
              placeholder="Rechercher par action, détail, utilisateur..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                padding:'10px 16px 10px 40px',
                border:'1.5px solid var(--border)',
                borderRadius:'10px', fontSize:'13px',
                outline:'none', width:'380px',
                fontFamily:'Inter,sans-serif',
              }}
              onFocus={e => {
                e.target.style.borderColor = 'var(--primary)';
                e.target.style.boxShadow =
                  '0 0 0 3px rgba(212,175,55,0.1)';
              }}
              onBlur={e => {
                e.target.style.borderColor = 'var(--border)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <select
            value={filtreAction}
            onChange={e => setFiltreAction(e.target.value)}
            style={{
              padding:'10px 16px',
              border:'1.5px solid var(--border)',
              borderRadius:'10px', fontSize:'13px',
              outline:'none', fontFamily:'Inter,sans-serif',
              cursor:'pointer', background:'var(--white)',
              maxWidth:'260px',
            }}
          >
            {actionsUniques.map(a => (
              <option key={a} value={a}>
                {a === 'TOUS' ? 'Toutes les actions' : a}
              </option>
            ))}
          </select>
        </div>

        {/* TIMELINE */}
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner" />
          </div>
        ) : (
          <div style={{
            background:'var(--white)', borderRadius:'14px',
            border:'1px solid var(--border)',
            boxShadow:'var(--shadow)',
            padding:'8px',
          }}>
            {logsFiltres.length > 0 ? logsFiltres.map((log, i) => {
              const style = getActionStyle(log.action);
              return (
                <div key={log.id} style={{
                  display:'flex', gap:'14px',
                  padding:'14px 16px',
                  borderBottom: i < logsFiltres.length - 1
                    ? '1px solid var(--border)' : 'none',
                }}>
                  <div style={{
                    width:'38px', height:'38px',
                    background:style.bg, borderRadius:'10px',
                    display:'flex', alignItems:'center',
                    justifyContent:'center', flexShrink:0,
                  }}>
                    <i className={`ti ${style.icon}`} style={{
                      fontSize:'18px', color:style.color
                    }} />
                  </div>

                  <div style={{ flex:1 }}>
                    <div style={{
                      display:'flex', alignItems:'center',
                      gap:'8px', flexWrap:'wrap'
                    }}>
                      <span style={{
                        background:style.bg, color:style.color,
                        padding:'3px 10px', borderRadius:'20px',
                        fontSize:'11px', fontWeight:700,
                      }}>
                        {log.action}
                      </span>
                      <span style={{
                        fontSize:'12px', fontWeight:600,
                        color:'var(--text-dark)'
                      }}>
                        {log.utilisateur?.prenom} {log.utilisateur?.nom}
                      </span>
                      <span style={{
                        fontSize:'10px', color:'var(--primary)',
                        fontWeight:700,
                        background:'rgba(212,175,55,0.1)',
                        padding:'1px 6px', borderRadius:'4px',
                      }}>
                        {log.utilisateur?.role}
                      </span>
                    </div>

                    {log.details && (
                      <p style={{
                        fontSize:'13px', color:'var(--text-mid)',
                        marginTop:'5px', lineHeight:1.4,
                      }}>
                        {log.details}
                      </p>
                    )}

                    <div style={{
                      display:'flex', alignItems:'center', gap:'5px',
                      marginTop:'6px',
                    }}>
                      <i className="ti ti-clock" style={{
                        fontSize:'12px', color:'var(--text-light)'
                      }} />
                      <span style={{
                        fontSize:'11px', color:'var(--text-light)'
                      }}>
                        {formatDate(log.dateAction)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div style={{
                textAlign:'center', padding:'60px',
                color:'var(--text-light)'
              }}>
                <i className="ti ti-history" style={{
                  fontSize:'48px', opacity:0.2,
                  display:'block', marginBottom:'12px'
                }} />
                Aucune activité trouvée
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Historique;
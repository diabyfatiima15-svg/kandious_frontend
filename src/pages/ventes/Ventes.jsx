import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Navbar from '../../components/Navbar';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const Ventes = () => {
  const { user } = useAuth();
  const [ventes, setVentes] = useState([]);
  const [produits, setProduits] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewVente, setViewVente] = useState(null);
  const [search, setSearch] = useState('');
  const [panier, setPanier] = useState([]);
  const [form, setForm] = useState({
    client:{ id:'' }, modePaiement:'ESPECES', remise:0, tva:18
  });

  useEffect(() => {
    fetchVentes();
    fetchProduits();
    fetchClients();
  }, []);

  const fetchVentes = async () => {
    try {
      const r = await api.get('/ventes');
      const data = Array.isArray(r.data) ? r.data : [];
      setVentes(data);
    } catch {
      toast.error('Erreur chargement ventes');
      setVentes([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProduits = async () => {
    try {
      const r = await api.get('/produits');
      const data = Array.isArray(r.data) ? r.data : [];
      setProduits(data.filter(p => p.statut === 'DISPONIBLE'));
    } catch {
      toast.error('Erreur chargement produits');
      setProduits([]);
    }
  };

  const fetchClients = async () => {
    try {
      const r = await api.get('/clients');
      const data = Array.isArray(r.data) ? r.data : [];
      setClients(data);
    } catch {
      toast.error('Erreur chargement clients');
      setClients([]);
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
        produit, quantite:1, prixUnitaire:produit.prixVente
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

  const calculerTotal = () => {
    const montantHt = panier.reduce(
      (t, item) => t + (item.prixUnitaire * item.quantite), 0
    );
    const apresRemise = montantHt - (montantHt * form.remise / 100);
    const total = apresRemise + (apresRemise * form.tva / 100);
    return { montantHt, total };
  };

  const getNiveauClient = (points) => {
    if (points >= 100) return {
      label:'VIP', icon:'👑', color:'#b8960c',
      bg:'rgba(212,175,55,0.1)',
      conseil:'Cliente VIP — remise recommandée : 10%'
    };
    if (points >= 50) return {
      label:'Gold', icon:'🥇', color:'#b8960c',
      bg:'rgba(212,175,55,0.08)',
      conseil:'Cliente Gold — remise recommandée : 5%'
    };
    if (points >= 20) return {
      label:'Silver', icon:'🥈', color:'#666',
      bg:'rgba(150,150,150,0.1)',
      conseil:'Cliente Silver — remise recommandée : 2%'
    };
    return {
      label:'Nouveau', icon:'🆕', color:'var(--text-light)',
      bg:'var(--creme)',
      conseil:'Nouvelle cliente — pas de remise'
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (panier.length === 0) {
      toast.error('Le panier est vide !');
      return;
    }
    try {
      const { montantHt, total } = calculerTotal();
      const vente = {
        montantHt, montantTotal:total,
        tva:form.tva, remise:form.remise,
        modePaiement:form.modePaiement,
        client:form.client.id ? { id:parseInt(form.client.id) } : null,
        utilisateur:{ id:user.id }
      };
      const details = panier.map(item => ({
        produit:{ id:item.produit.id },
        quantite:item.quantite,
        prixUnitaire:item.prixUnitaire,
        sousTotal:item.prixUnitaire * item.quantite
      }));
      await api.post('/ventes', { vente, details });
      toast.success('Vente créée ! Facture générée automatiquement.');
      fetchVentes();
      handleCloseModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la vente');
    }
  };

  const handleAnnuler = async (id) => {
    if (!window.confirm('Annuler cette vente ? Le stock sera restauré et la facture annulée.')) return;
    try {
      await api.put(`/ventes/${id}/annuler`);
      toast.success('Vente annulée !');
      fetchVentes();
      fetchProduits();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'annulation');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setPanier([]);
    setForm({ client:{ id:'' }, modePaiement:'ESPECES', remise:0, tva:18 });
  };

  const formatMontant = (m) => {
    if (!m) return '0 GNF';
    return Math.round(m).toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' GNF';
  };

  const handleExportExcel = async () => {
    if (ventes.length === 0) {
      toast.error('Aucune vente à exporter');
      return;
    }
    try {
      const data = ventes.map(v => ({
        'N° Vente': v.id,
        'Date': new Date(v.dateVente).toLocaleDateString('fr-FR'),
        'Cliente': v.client
          ? `${v.client.nom} ${v.client.prenom || ''}`.trim()
          : 'Anonyme',
        'Montant HT (GNF)': Math.round(v.montantHt || 0),
        'Remise (%)': v.remise || 0,
        'TVA (%)': v.tva || 0,
        'Montant Total (GNF)': Math.round(v.montantTotal || 0),
        'Mode de paiement': v.modePaiement?.replace(/_/g, ' ') || '-',
        'Statut': v.statut || '-',
        'Vendeur': v.utilisateur
          ? `${v.utilisateur.prenom} ${v.utilisateur.nom}`.trim()
          : '-',
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Ventes');
      worksheet['!cols'] = [
        { wch:10 }, { wch:14 }, { wch:22 }, { wch:18 },
        { wch:12 }, { wch:10 }, { wch:20 }, { wch:18 },
        { wch:12 }, { wch:22 },
      ];
      const excelBuffer = XLSX.write(workbook, { bookType:'xlsx', type:'array' });
      const blob = new Blob([excelBuffer], { type:'application/octet-stream' });
      const dateStr = new Date().toLocaleDateString('fr-FR').replace(/\//g, '-');
      saveAs(blob, `KANDIOUS_Ventes_${dateStr}.xlsx`);

      try {
        await api.post('/logs/manuel', {
          action: 'EXPORT_EXCEL',
          details: `Export Excel des ventes (${ventes.length} vente${ventes.length > 1 ? 's' : ''})`
        });
      } catch { /* silencieux */ }

      toast.success('Export Excel téléchargé !');
    } catch {
      toast.error("Erreur lors de l'export Excel");
    }
  };

  const { montantHt, total } = calculerTotal();

  const getStatut = (statut) => {
    if (statut === 'VALIDEE')
      return { label:'Validée', bg:'#e8f5e9', color:'#2e7d32' };
    return { label:'Annulée', bg:'#ffebee', color:'#c62828' };
  };

  const getAvatarColor = (nom) => nom?.charCodeAt(0) % 2 === 0
    ? { bg:'#1a1a2e', color:'#d4af37' }
    : { bg:'#2e1a1a', color:'#d4af37' };

  // Filtre de recherche
  const ventesFiltrees = ventes.filter(v => {
    const terme = search.toLowerCase();
    if (!terme) return true;
    const nomClient = v.client
      ? `${v.client.nom} ${v.client.prenom || ''}`.toLowerCase()
      : 'anonyme';
    return nomClient.includes(terme)
      || String(v.id).includes(terme)
      || v.modePaiement?.toLowerCase().includes(terme)
      || v.statut?.toLowerCase().includes(terme);
  });

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
              Gestion des Ventes
            </h1>
            <p style={{ fontSize:'13px', color:'var(--text-light)', marginTop:'3px' }}>
              {ventes.length} vente{ventes.length > 1 ? 's' : ''} au total
            </p>
          </div>
          <div style={{ display:'flex', gap:'10px' }}>
            <button
              onClick={handleExportExcel}
              style={{
                display:'flex', alignItems:'center', gap:'8px',
                background:'var(--white)', color:'var(--noir)',
                border:'1.5px solid var(--border)',
                padding:'10px 18px', borderRadius:'10px',
                fontSize:'13px', fontWeight:600, cursor:'pointer',
                transition:'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.color = 'var(--primary)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.color = 'var(--noir)';
              }}
            >
              <i className="ti ti-file-spreadsheet" style={{ fontSize:'16px' }} />
              Exporter Excel
            </button>
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              <i className="ti ti-shopping-cart-plus" style={{ fontSize:'16px' }} />
              Nouvelle Vente
            </button>
          </div>
        </div>

        {/* STATS */}
        <div style={{
          display:'grid', gridTemplateColumns:'repeat(4,1fr)',
          gap:'14px', marginBottom:'22px'
        }}>
          {[
            { label:'Total ventes', val:ventes.length, icon:'ti-shopping-cart', color:'var(--primary)' },
            { label:'Validées', val:ventes.filter(v => v.statut === 'VALIDEE').length, icon:'ti-check', color:'#2e7d32' },
            { label:'Annulées', val:ventes.filter(v => v.statut === 'ANNULEE').length, icon:'ti-x', color:'#c62828' },
            { label:'CA total', val:formatMontant(ventes.reduce((s, v) => s + (v.montantTotal || 0), 0)), icon:'ti-cash', color:'#b8960c' },
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
                <i className={`ti ${s.icon}`} style={{ fontSize:'20px', color:s.color }} />
              </div>
              <div>
                <div style={{
                  fontFamily:'Playfair Display,serif',
                  fontSize: i === 3 ? '14px' : '24px',
                  fontWeight:700, color:'var(--noir)', lineHeight:1,
                }}>{s.val}</div>
                <div style={{ fontSize:'11px', color:'var(--text-light)', marginTop:'3px' }}>{s.label}</div>
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
              placeholder="Rechercher par cliente, N°, statut..."
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
                  <th>N°</th>
                  <th>Date</th>
                  <th>Cliente</th>
                  <th>Montant HT</th>
                  <th>Total</th>
                  <th>Paiement</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {ventesFiltrees.map(v => {
                  const st = getStatut(v.statut);
                  const av = getAvatarColor(v.client?.nom);
                  return (
                    <tr key={v.id}>
                      <td style={{ color:'var(--primary)', fontWeight:800 }}>#{v.id}</td>
                      <td style={{ fontSize:'12px', color:'var(--text-mid)' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                          <i className="ti ti-calendar" style={{ fontSize:'13px', color:'var(--primary)' }} />
                          {new Date(v.dateVente).toLocaleDateString('fr-FR')}
                        </div>
                      </td>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                          <div style={{
                            width:'32px', height:'32px',
                            background:av.bg, borderRadius:'8px',
                            display:'flex', alignItems:'center', justifyContent:'center',
                            fontSize:'10px', fontWeight:800, color:av.color,
                            border:'1px solid rgba(212,175,55,0.2)', flexShrink:0,
                          }}>
                            {v.client ? `${v.client.nom?.[0]}${v.client.prenom?.[0] || ''}` : '?'}
                          </div>
                          <span style={{ fontSize:'13px', color:'var(--text-dark)' }}>
                            {v.client ? `${v.client.nom} ${v.client.prenom || ''}` : 'Anonyme'}
                          </span>
                        </div>
                      </td>
                      <td style={{ fontSize:'13px', color:'var(--text-mid)' }}>{formatMontant(v.montantHt)}</td>
                      <td style={{ fontWeight:800, color:'var(--noir)' }}>{formatMontant(v.montantTotal)}</td>
                      <td>
                        <span style={{
                          background:'var(--noir)', color:'var(--primary)',
                          padding:'3px 9px', borderRadius:'20px',
                          fontSize:'10px', fontWeight:700,
                          border:'1px solid rgba(212,175,55,0.2)',
                        }}>
                          {v.modePaiement?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          background:st.bg, color:st.color,
                          padding:'4px 10px', borderRadius:'20px',
                          fontSize:'10px', fontWeight:800,
                        }}>
                          {st.label}
                        </span>
                      </td>
                      <td>
                        <div style={{ display:'flex', gap:'6px' }}>
                          <button
                            onClick={() => setViewVente(v)}
                            title="Voir le détail"
                            className="btn-icon"
                            style={{ background:'rgba(21,101,192,0.08)', color:'#1565c0', border:'1px solid rgba(21,101,192,0.2)' }}
                          >
                            <i className="ti ti-eye" />
                          </button>
                          {v.statut === 'VALIDEE' && (
                            <button
                              onClick={() => handleAnnuler(v.id)}
                              title="Annuler la vente"
                              className="btn-icon btn-delete"
                            >
                              <i className="ti ti-ban" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {ventesFiltrees.length === 0 && (
              <div style={{ textAlign:'center', padding:'60px', color:'var(--text-light)' }}>
                <i className="ti ti-shopping-cart" style={{ fontSize:'48px', opacity:0.2, display:'block', marginBottom:'12px' }} />
                {search ? 'Aucune vente ne correspond à la recherche' : 'Aucune vente enregistrée'}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL NOUVELLE VENTE */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth:'700px' }}>
            <div className="modal-header">
              <h2>🛒 Nouvelle <span>Vente</span></h2>
              <button className="modal-close" onClick={handleCloseModal}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Ajouter un produit au panier</label>
                <select onChange={e => { ajouterAuPanier(e.target.value); e.target.value = ''; }} defaultValue="">
                  <option value="">Sélectionner un produit...</option>
                  {produits.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nom} — {formatMontant(p.prixVente)} (Stock: {p.quantiteStock})
                    </option>
                  ))}
                </select>
              </div>

              {panier.length > 0 && (
                <div style={{ background:'var(--creme)', borderRadius:'12px', padding:'16px', border:'1px solid var(--border)' }}>
                  <div style={{ fontFamily:'Playfair Display,serif', fontSize:'14px', fontWeight:700, color:'var(--noir)', marginBottom:'12px' }}>
                    🛍️ Panier ({panier.length} article{panier.length > 1 ? 's' : ''})
                  </div>
                  <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'13px' }}>
                    <thead>
                      <tr>
                        {['Produit','Prix','Qté','Sous-total',''].map((h, i) => (
                          <th key={i} style={{ background:'var(--noir)', color:'rgba(255,255,255,0.5)', padding:'8px 12px', textAlign:'left', fontSize:'10px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.8px' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {panier.map(item => (
                        <tr key={item.produit.id}>
                          <td style={{ padding:'10px 12px', borderBottom:'1px solid var(--border)', fontWeight:600 }}>{item.produit.nom}</td>
                          <td style={{ padding:'10px 12px', borderBottom:'1px solid var(--border)', color:'var(--text-mid)' }}>{formatMontant(item.prixUnitaire)}</td>
                          <td style={{ padding:'10px 12px', borderBottom:'1px solid var(--border)' }}>
                            <input
                              type="number" value={item.quantite} min="1"
                              max={item.produit.quantiteStock}
                              onChange={e => modifierQuantite(item.produit.id, e.target.value)}
                              style={{ width:'60px', padding:'4px 8px', border:'1.5px solid var(--border)', borderRadius:'6px', textAlign:'center', fontSize:'13px', outline:'none' }}
                            />
                          </td>
                          <td style={{ padding:'10px 12px', borderBottom:'1px solid var(--border)', fontWeight:700, color:'var(--noir)' }}>{formatMontant(item.prixUnitaire * item.quantite)}</td>
                          <td style={{ padding:'10px 12px', borderBottom:'1px solid var(--border)' }}>
                            <button type="button" onClick={() => modifierQuantite(item.produit.id, 0)} style={{ background:'#ffebee', color:'#c62828', border:'none', padding:'4px 8px', borderRadius:'6px', cursor:'pointer', fontSize:'12px' }}>✕</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label>Cliente (optionnel)</label>
                  <select value={form.client.id} onChange={e => setForm({ ...form, client:{ id:e.target.value } })}>
                    <option value="">Client anonyme</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.nom} {c.prenom || ''}</option>
                    ))}
                  </select>
                  {form.client.id && (() => {
                    const clientSelectionne = clients.find(c => c.id === parseInt(form.client.id));
                    if (!clientSelectionne) return null;
                    const points = clientSelectionne.pointsFidelite || 0;
                    const niveau = getNiveauClient(points);
                    return (
                      <div style={{ marginTop:'10px', background:niveau.bg, border:`1px solid ${niveau.color}30`, borderRadius:'10px', padding:'12px 16px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                          <span style={{ fontSize:'22px' }}>{niveau.icon}</span>
                          <div>
                            <div style={{ fontFamily:'Playfair Display,serif', fontSize:'14px', fontWeight:700, color:'var(--noir)' }}>
                              {clientSelectionne.nom} {clientSelectionne.prenom || ''}
                            </div>
                            <div style={{ fontSize:'11px', color:niveau.color, fontWeight:600 }}>
                              Niveau {niveau.label} — {points} points
                            </div>
                          </div>
                        </div>
                        <div style={{ fontSize:'11px', color:'var(--text-mid)', fontStyle:'italic', textAlign:'right', maxWidth:'160px' }}>
                          {niveau.conseil}
                        </div>
                      </div>
                    );
                  })()}
                </div>
                <div className="form-group">
                  <label>Mode de paiement</label>
                  <select value={form.modePaiement} onChange={e => setForm({ ...form, modePaiement:e.target.value })}>
                    <option value="ESPECES">💵 Espèces</option>
                    <option value="ORANGE_MONEY">🟠 Orange Money</option>
                    <option value="CARTE">💳 Carte bancaire</option>
                    <option value="MIXTE">🔀 Paiement mixte</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Remise (%)</label>
                  <input type="number" value={form.remise} min="0" max="80"
                    onChange={e => setForm({ ...form, remise:parseFloat(e.target.value) || 0 })} />
                </div>
                <div className="form-group">
                  <label>TVA (%)</label>
                  <input type="number" value={form.tva}
                    onChange={e => setForm({ ...form, tva:parseFloat(e.target.value) || 18 })} />
                </div>
              </div>

              {panier.length > 0 && (
                <div style={{ background:'var(--noir)', borderRadius:'12px', padding:'16px', border:'1px solid rgba(212,175,55,0.2)' }}>
                  {[
                    { label:'Montant HT', val:formatMontant(montantHt) },
                    { label:`Remise (${form.remise}%)`, val:`- ${formatMontant(montantHt * form.remise / 100)}` },
                    { label:`TVA (${form.tva}%)`, val:`+ ${formatMontant((montantHt - montantHt * form.remise / 100) * form.tva / 100)}` },
                  ].map((r, i) => (
                    <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', fontSize:'13px', color:'rgba(255,255,255,0.55)', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                      <span>{r.label}</span>
                      <span>{r.val}</span>
                    </div>
                  ))}
                  <div style={{ display:'flex', justifyContent:'space-between', padding:'12px 0 4px', marginTop:'4px' }}>
                    <span style={{ fontFamily:'Playfair Display,serif', fontSize:'16px', fontWeight:700, color:'#fff' }}>TOTAL</span>
                    <span style={{ fontFamily:'Playfair Display,serif', fontSize:'18px', fontWeight:800, color:'var(--primary)' }}>{formatMontant(total)}</span>
                  </div>
                </div>
              )}

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>Annuler</button>
                <button type="submit" className="btn-primary" disabled={panier.length === 0}>
                  <i className="ti ti-check" style={{ fontSize:'15px' }} />
                  Valider la vente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL VOIR VENTE */}
      {viewVente && (
        <div className="modal-overlay" onClick={() => setViewVente(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>👁️ Détail <span>Vente #{viewVente.id}</span></h2>
              <button className="modal-close" onClick={() => setViewVente(null)}>✕</button>
            </div>
            <div className="modal-form">
              {[
                { label:'Date', val:new Date(viewVente.dateVente).toLocaleString('fr-FR') },
                { label:'Cliente', val:viewVente.client ? `${viewVente.client.nom} ${viewVente.client.prenom || ''}`.trim() : 'Anonyme' },
                { label:'Vendeur', val:viewVente.utilisateur ? `${viewVente.utilisateur.prenom || ''} ${viewVente.utilisateur.nom || ''}`.trim() : '-' },
                { label:'Montant HT', val:formatMontant(viewVente.montantHt) },
                { label:'Remise', val:`${viewVente.remise || 0} %` },
                { label:'TVA', val:`${viewVente.tva || 0} %` },
                { label:'Total', val:formatMontant(viewVente.montantTotal) },
                { label:'Paiement', val:viewVente.modePaiement?.replace(/_/g, ' ') || '-' },
                { label:'Statut', val:getStatut(viewVente.statut).label },
              ].map((r, i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
                  <span style={{ fontSize:'12px', fontWeight:700, color:'var(--text-mid)', textTransform:'uppercase', letterSpacing:'0.5px' }}>{r.label}</span>
                  <span style={{ fontSize:'13px', color:'var(--text-dark)', fontWeight:600 }}>{r.val}</span>
                </div>
              ))}
              <div className="modal-footer">
                {viewVente.statut === 'VALIDEE' && (
                  <button type="button" className="btn-secondary"
                    onClick={() => { const id = viewVente.id; setViewVente(null); handleAnnuler(id); }}
                    style={{ color:'#c62828', borderColor:'#ffcdd2' }}>
                    <i className="ti ti-ban" /> Annuler la vente
                  </button>
                )}
                <button type="button" className="btn-secondary" onClick={() => setViewVente(null)}>Fermer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ventes;
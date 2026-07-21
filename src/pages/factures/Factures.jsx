import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import Navbar from '../../components/Navbar';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Factures = () => {
  const { hasRole } = useAuth();
  const [factures, setFactures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewFacture, setViewFacture] = useState(null);

  useEffect(() => { fetchFactures(); }, []);

  const fetchFactures = async () => {
    try {
      const r = await api.get('/factures');
      setFactures(Array.isArray(r.data) ? r.data : []);
    } catch {
      toast.error('Erreur chargement factures');
      setFactures([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer définitivement cette facture ?')) return;
    try {
      await api.delete(`/factures/${id}`);
      toast.success('Facture supprimée !');
      fetchFactures();
    } catch {
      toast.error('Erreur suppression');
    }
  };

  const formatMontant = (m) => {
    if (!m) return '0 GNF';
    return Math.round(m).toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' GNF';
  };

  const getStatutBadge = (statut) => {
    if (statut === 'ANNULEE') return { label:'Annulée', bg:'#ffebee', color:'#c62828' };
    return { label:'Validée', bg:'#e8f5e9', color:'#2e7d32' };
  };

  const genererPDF = async (facture) => {
    try {
      const doc = new jsPDF();

      doc.setFillColor(13, 13, 13);
      doc.rect(0, 0, 210, 35, 'F');
      doc.setTextColor(212, 175, 55);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text("KANDIOU'S Fashion", 15, 18);
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.text('Boutique de vêtements féminins — Conakry, Guinée', 15, 26);

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`Facture N° ${facture.numero || facture.id}`, 15, 48);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Date : ${new Date(facture.dateEmission || facture.vente?.dateVente).toLocaleDateString('fr-FR')}`, 15, 56);
      doc.text(`Statut : ${facture.statut === 'ANNULEE' ? 'ANNULÉE' : 'Validée'}`, 15, 62);

      doc.setFont('helvetica', 'bold');
      doc.text('Cliente :', 15, 74);
      doc.setFont('helvetica', 'normal');
      doc.text(facture.vente?.client
        ? `${facture.vente.client.nom} ${facture.vente.client.prenom || ''}`
        : 'Client anonyme', 45, 74);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Montant total :', 15, 90);
      doc.setTextColor(184, 150, 12);
      doc.text(formatMontant(facture.montant), 70, 90);

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Mode de paiement : ${facture.vente?.modePaiement?.replace(/_/g, ' ') || '-'}`, 15, 98);

      const qrContenu = [
        "KANDIOU'S Fashion",
        `Facture N° ${facture.numero || facture.id}`,
        `Montant : ${formatMontant(facture.montant)}`,
        `Statut : ${facture.statut}`,
      ].join('\n');
      const qrUrl = await QRCode.toDataURL(qrContenu, { width: 150, margin: 1 });
      doc.addImage(qrUrl, 'PNG', 155, 45, 35, 35);

      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('Merci pour votre confiance — KANDIOU\'S Fashion', 15, 280);

      doc.save(`Facture-${facture.numero || facture.id}.pdf`);
    } catch {
      toast.error('Erreur génération PDF');
    }
  };

  const facturesFiltrees = factures.filter(f => {
    const terme = search.toLowerCase();
    if (!terme) return true;
    return String(f.numero || f.id).includes(terme)
      || f.vente?.client?.nom?.toLowerCase().includes(terme)
      || getStatutBadge(f.statut).label.toLowerCase().includes(terme);
  });

  return (
    <div className="page-container">
      <Navbar />
      <div className="page-content">

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'24px' }}>
          <div>
            <h1 style={{ fontFamily:'Playfair Display,serif', fontSize:'26px', fontWeight:700, color:'var(--noir)' }}>
              Gestion des Factures
            </h1>
            <p style={{ fontSize:'13px', color:'var(--text-light)', marginTop:'3px' }}>
              {factures.length} facture{factures.length > 1 ? 's' : ''} au total
            </p>
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'14px', marginBottom:'22px' }}>
          {[
            { label:'Total factures', val:factures.length, icon:'ti-receipt', color:'var(--primary)' },
            { label:'Validées', val:factures.filter(f => f.statut !== 'ANNULEE').length, icon:'ti-check', color:'#2e7d32' },
            { label:'Annulées', val:factures.filter(f => f.statut === 'ANNULEE').length, icon:'ti-x', color:'#c62828' },
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

        <div style={{ marginBottom:'16px' }}>
          <div style={{ position:'relative', display:'inline-block' }}>
            <i className="ti ti-search" style={{ position:'absolute', left:'13px', top:'50%', transform:'translateY(-50%)', color:'var(--text-light)', fontSize:'16px', zIndex:1 }} />
            <input
              type="text"
              placeholder="Rechercher par numéro, cliente, statut..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ padding:'10px 16px 10px 40px', border:'1.5px solid var(--border)', borderRadius:'10px', fontSize:'13px', outline:'none', width:'360px', fontFamily:'Inter,sans-serif' }}
              onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(212,175,55,0.1)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
            />
          </div>
        </div>

        {loading ? (
          <div className="loading-container"><div className="loading-spinner" /></div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>N°</th>
                  <th>Date</th>
                  <th>Cliente</th>
                  <th>Montant</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {facturesFiltrees.map(f => {
                  const badge = getStatutBadge(f.statut);
                  return (
                    <tr key={f.id}>
                      <td style={{ color:'var(--primary)', fontWeight:800 }}>#{f.numero || f.id}</td>
                      <td style={{ fontSize:'12px', color:'var(--text-mid)' }}>
                        {new Date(f.dateEmission || f.vente?.dateVente).toLocaleDateString('fr-FR')}
                      </td>
                      <td>
                        {f.vente?.client
                          ? `${f.vente.client.nom} ${f.vente.client.prenom || ''}`
                          : 'Client anonyme'}
                      </td>
                      <td style={{ fontWeight:800, color:'var(--noir)' }}>{formatMontant(f.montant)}</td>
                      <td>
                        <span style={{ background:badge.bg, color:badge.color, padding:'4px 10px', borderRadius:'20px', fontSize:'10px', fontWeight:800 }}>
                          {badge.label}
                        </span>
                      </td>
                      <td>
                        <div style={{ display:'flex', gap:'6px' }}>

                          <button
                            className="btn-icon"
                            onClick={() => setViewFacture(f)}
                            title="Voir le détail"
                            style={{ background:'rgba(21,101,192,0.08)', color:'#1565c0', border:'1px solid rgba(21,101,192,0.2)' }}
                          >
                            <i className="ti ti-eye" />
                          </button>

                          {/* PDF — seulement si la facture N'EST PAS annulée */}
                          {f.statut !== 'ANNULEE' ? (
                            <button className="btn-icon" onClick={() => genererPDF(f)} title="Télécharger PDF">
                              <i className="ti ti-download" />
                            </button>
                          ) : (
                            <span
                              title="Facture annulée — PDF indisponible"
                              style={{
                                display:'flex', alignItems:'center', justifyContent:'center',
                                width:'34px', height:'34px', borderRadius:'8px',
                                background:'#f5f5f5', color:'#bbb',
                                border:'1px solid #e0e0e0', cursor:'not-allowed',
                              }}
                            >
                              <i className="ti ti-download-off" />
                            </span>
                          )}

                          {f.statut === 'ANNULEE' && hasRole('ADMIN') && (
                            <button className="btn-icon btn-delete" onClick={() => handleDelete(f.id)} title="Supprimer définitivement">
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
            {facturesFiltrees.length === 0 && (
              <div style={{ textAlign:'center', padding:'60px', color:'var(--text-light)' }}>
                <i className="ti ti-receipt" style={{ fontSize:'48px', opacity:0.2, display:'block', marginBottom:'12px' }} />
                {search ? 'Aucune facture ne correspond à la recherche' : 'Aucune facture enregistrée'}
              </div>
            )}
          </div>
        )}
      </div>

      {viewFacture && (
        <div className="modal-overlay" onClick={() => setViewFacture(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>👁️ Détail <span>Facture #{viewFacture.numero || viewFacture.id}</span></h2>
              <button className="modal-close" onClick={() => setViewFacture(null)}>✕</button>
            </div>
            <div className="modal-form">
              {[
                { label:'Date', val:new Date(viewFacture.dateEmission || viewFacture.vente?.dateVente).toLocaleString('fr-FR') },
                { label:'Cliente', val:viewFacture.vente?.client ? `${viewFacture.vente.client.nom} ${viewFacture.vente.client.prenom || ''}` : 'Client anonyme' },
                { label:'Montant', val:formatMontant(viewFacture.montant) },
                { label:'Mode de paiement', val:viewFacture.vente?.modePaiement?.replace(/_/g,' ') || '-' },
                { label:'Statut', val:getStatutBadge(viewFacture.statut).label },
              ].map((r, i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
                  <span style={{ fontSize:'12px', fontWeight:700, color:'var(--text-mid)', textTransform:'uppercase', letterSpacing:'0.5px' }}>{r.label}</span>
                  <span style={{ fontSize:'13px', color:'var(--text-dark)', fontWeight:600 }}>{r.val}</span>
                </div>
              ))}
              <div className="modal-footer">
                {viewFacture.statut !== 'ANNULEE' && (
                  <button type="button" className="btn-secondary" onClick={() => genererPDF(viewFacture)}>
                    <i className="ti ti-download" /> Télécharger PDF
                  </button>
                )}
                <button type="button" className="btn-secondary" onClick={() => setViewFacture(null)}>
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

export default Factures;
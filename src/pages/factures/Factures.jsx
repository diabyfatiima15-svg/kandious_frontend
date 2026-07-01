import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import api from '../../services/api';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';

const Factures = () => {
  const { hasRole } = useAuth();
  const [factures, setFactures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchFactures(); }, []);

  const fetchFactures = async () => {
    try {
      const r = await api.get('/factures');
      const data = Array.isArray(r.data) ? r.data : [];
      setFactures(data);
    } catch {
      toast.error('Erreur chargement factures');
      setFactures([]);
    } finally {
      setLoading(false);
    }
  };

  const formatMontant = (m) => {
    if (!m) return '0 GNF';
    return Math.round(m).toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' GNF';
  };

  // Suppression définitive — ADMIN seulement
  const handleSupprimer = async (id) => {
    if (!window.confirm(
      'Supprimer définitivement cette facture ? Cette action est irréversible.'
    )) return;
    try {
      await api.delete(`/factures/${id}`);
      toast.success('Facture supprimée !');
      fetchFactures();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur suppression');
    }
  };

  const genererPDF = async (facture) => {
    const doc = new jsPDF();

    doc.setFillColor(13, 13, 13);
    doc.rect(0, 0, 210, 45, 'F');
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.5);
    doc.line(0, 45, 210, 45);

    doc.setTextColor(212, 175, 55);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bolditalic');
    doc.text("KANDIOU'S Fashion", 14, 18);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(180, 180, 180);
    doc.text('Boutique de vetements feminins', 14, 26);
    doc.text('Conakry, Guinee', 14, 32);
    doc.text('kandious@fashion.gn', 14, 38);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('FACTURE', 196, 18, { align: 'right' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(212, 175, 55);
    doc.text(facture.numero || '', 196, 28, { align: 'right' });

    const infoY = 58;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(13, 13, 13);
    doc.text('INFORMATIONS FACTURE', 14, infoY);
    doc.setFont('helvetica', 'normal');

    doc.setTextColor(80, 80, 80);
    doc.text('Numero :', 14, infoY + 8);
    doc.setTextColor(13, 13, 13);
    doc.text(facture.numero || '-', 42, infoY + 8);

    doc.setTextColor(80, 80, 80);
    doc.text('Date :', 14, infoY + 15);
    doc.setTextColor(13, 13, 13);
    doc.text(new Date(facture.dateFacture).toLocaleDateString('fr-FR'), 42, infoY + 15);

    doc.setTextColor(80, 80, 80);
    doc.text('Vente N :', 14, infoY + 22);
    doc.setTextColor(13, 13, 13);
    doc.text(`#${facture.vente?.id || '-'}`, 42, infoY + 22);

    doc.setTextColor(80, 80, 80);
    doc.text('Paiement :', 14, infoY + 29);
    doc.setTextColor(13, 13, 13);
    doc.text(facture.vente?.modePaiement?.replace(/_/g, ' ') || 'ESPECES', 42, infoY + 29);

    const client = facture.vente?.client;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(13, 13, 13);
    doc.text('CLIENTE', 120, infoY);
    doc.setFont('helvetica', 'normal');

    if (client) {
      doc.setTextColor(80, 80, 80);
      doc.text('Nom :', 120, infoY + 8);
      doc.setTextColor(13, 13, 13);
      doc.text(`${client.nom || ''} ${client.prenom || ''}`.trim(), 140, infoY + 8);
      if (client.telephone) {
        doc.setTextColor(80, 80, 80);
        doc.text('Tel :', 120, infoY + 15);
        doc.setTextColor(13, 13, 13);
        doc.text(client.telephone, 140, infoY + 15);
      }
      if (client.email) {
        doc.setTextColor(80, 80, 80);
        doc.text('Email :', 120, infoY + 22);
        doc.setTextColor(13, 13, 13);
        doc.text(client.email, 140, infoY + 22);
      }
    } else {
      doc.setTextColor(130, 130, 130);
      doc.text('Client anonyme', 120, infoY + 8);
    }

    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.3);
    doc.line(14, infoY + 38, 196, infoY + 38);

    const details = facture.vente?.venteDetails || [];
    const rows = details.length > 0
      ? details.map(d => [
          String(d.produit?.nom || 'Produit'),
          String(d.quantite || 1),
          formatMontant(d.prixUnitaire),
          formatMontant(d.sousTotal || (d.prixUnitaire * d.quantite)),
        ])
      : [['Vente globale', '1', formatMontant(facture.montant), formatMontant(facture.montant)]];

    const tableTop = infoY + 44;
    const rowH = 10;
    const tableW = 182;
    const cw = [75, 18, 45, 44];
    const cx = [14, 14 + cw[0], 14 + cw[0] + cw[1], 14 + cw[0] + cw[1] + cw[2]];

    doc.setFillColor(13, 13, 13);
    doc.rect(14, tableTop, tableW, rowH, 'F');
    doc.setTextColor(212, 175, 55);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Produit', cx[0] + 2, tableTop + 7);
    doc.text('Qte', cx[1] + cw[1] / 2, tableTop + 7, { align: 'center' });
    doc.text('Prix unitaire', cx[2] + cw[2] - 2, tableTop + 7, { align: 'right' });
    doc.text('Sous-total', cx[3] + cw[3] - 2, tableTop + 7, { align: 'right' });

    rows.forEach((row, i) => {
      const y = tableTop + rowH + (i * rowH);
      if (i % 2 === 0) {
        doc.setFillColor(245, 240, 235);
        doc.rect(14, y, tableW, rowH, 'F');
      }
      doc.setTextColor(50, 50, 50);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(String(row[0]).substring(0, 28), cx[0] + 2, y + 7);
      doc.text(String(row[1]), cx[1] + cw[1] / 2, y + 7, { align: 'center' });
      doc.text(String(row[2]), cx[2] + cw[2] - 2, y + 7, { align: 'right' });
      doc.text(String(row[3]), cx[3] + cw[3] - 2, y + 7, { align: 'right' });
    });

    const tableBottom = tableTop + rowH + (rows.length * rowH);
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.3);
    doc.line(14, tableBottom, 196, tableBottom);

    const finalY = tableBottom + 8;
    doc.setDrawColor(212, 175, 55);
    doc.line(120, finalY, 196, finalY);
    const totalY = finalY + 6;

    doc.setTextColor(46, 125, 50);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Statut : ${facture.statut || 'PAYEE'}`, 14, totalY + 13);

    doc.setFillColor(13, 13, 13);
    doc.roundedRect(120, totalY, 76, 20, 3, 3, 'F');
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.5);
    doc.roundedRect(120, totalY, 76, 20, 3, 3, 'S');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL :', 126, totalY + 13);
    doc.setTextColor(212, 175, 55);
    doc.setFontSize(11);
    doc.text(formatMontant(facture.montant), 192, totalY + 13, { align: 'right' });

    try {
      const contenu = [
        "KANDIOU'S Fashion",
        `Facture : ${facture.numero}`,
        `Date : ${new Date(facture.dateFacture).toLocaleDateString('fr-FR')}`,
        `Montant : ${formatMontant(facture.montant)}`,
        `Statut : ${facture.statut || 'PAYEE'}`,
        `Cliente : ${client ? `${client.nom} ${client.prenom || ''}` : 'Anonyme'}`,
      ].join('\n');

      const qrDataUrl = await QRCode.toDataURL(contenu, {
        width: 80, margin: 1,
        color: { dark: '#0d0d0d', light: '#ffffff' }
      });

      doc.addImage(qrDataUrl, 'PNG', 158, 248, 36, 36);
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.setFont('helvetica', 'italic');
      doc.text('Scannez pour', 176, 287, { align: 'center' });
      doc.text('verifier la facture', 176, 291, { align: 'center' });
    } catch (e) {
      console.error('QR Code erreur:', e);
    }

    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.3);
    doc.line(14, 275, 196, 275);
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text("Merci de votre confiance — KANDIOU'S Fashion", 105, 281, { align: 'center' });
    doc.text('Elegance · Qualite · Exclusivite', 105, 287, { align: 'center' });

    doc.save(`${facture.numero}.pdf`);

    try {
      await api.post('/logs/manuel', {
        action: 'GENERATION_FACTURE',
        details: `Facture ${facture.numero} générée (PDF) - ${formatMontant(facture.montant)}`
      });
    } catch { /* silencieux */ }

    toast.success('Facture téléchargée !');
  };

  const getStatut = (statut) => {
    if (statut === 'PAYEE')
      return { label:'Payée', bg:'#e8f5e9', color:'#2e7d32' };
    if (statut === 'ANNULEE')
      return { label:'Annulée', bg:'#ffebee', color:'#c62828' };
    return { label:'Émise', bg:'#fff3e0', color:'#e65100' };
  };

  const facturesFiltrees = factures.filter(f =>
    f.numero?.toLowerCase().includes(search.toLowerCase())
  );

  const montantTotal = factures.reduce((s, f) => s + (f.montant || 0), 0);

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
              Gestion des Factures
            </h1>
            <p style={{ fontSize:'13px', color:'var(--text-light)', marginTop:'3px' }}>
              {factures.length} facture{factures.length > 1 ? 's' : ''} au total
            </p>
          </div>
        </div>

        {/* STATS */}
        <div style={{
          display:'grid', gridTemplateColumns:'repeat(4,1fr)',
          gap:'14px', marginBottom:'22px'
        }}>
          {[
            { label:'Total factures', val:factures.length, icon:'ti-receipt', color:'var(--primary)' },
            { label:'Payées', val:factures.filter(f => f.statut === 'PAYEE').length, icon:'ti-check', color:'#2e7d32' },
            { label:'Annulées', val:factures.filter(f => f.statut === 'ANNULEE').length, icon:'ti-x', color:'#c62828' },
            { label:'Montant total', val:formatMontant(montantTotal), icon:'ti-cash', color:'#b8960c' },
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
                  fontSize: i === 3 ? '13px' : '24px',
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
              placeholder="Rechercher par numéro..."
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
                  <th>Numéro</th>
                  <th>Date</th>
                  <th>Cliente</th>
                  <th>Vente</th>
                  <th>Montant</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {facturesFiltrees.map(f => {
                  const st = getStatut(f.statut);
                  const client = f.vente?.client;
                  return (
                    <tr key={f.id}>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                          <div style={{
                            width:'36px', height:'36px',
                            background:'var(--noir)', borderRadius:'9px',
                            display:'flex', alignItems:'center', justifyContent:'center',
                            border:'1px solid rgba(212,175,55,0.2)',
                          }}>
                            <i className="ti ti-receipt" style={{ fontSize:'16px', color:'var(--primary)' }} />
                          </div>
                          <span style={{ fontWeight:800, color:'var(--primary)', fontSize:'13px' }}>
                            {f.numero}
                          </span>
                        </div>
                      </td>
                      <td style={{ fontSize:'12px', color:'var(--text-mid)' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                          <i className="ti ti-calendar" style={{ fontSize:'13px', color:'var(--primary)' }} />
                          {new Date(f.dateFacture).toLocaleDateString('fr-FR')}
                        </div>
                      </td>
                      <td>
                        {client ? (
                          <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                            <div style={{
                              width:'30px', height:'30px',
                              background:'var(--noir)', borderRadius:'8px',
                              display:'flex', alignItems:'center', justifyContent:'center',
                              fontSize:'9px', fontWeight:800, color:'var(--primary)',
                              border:'1px solid rgba(212,175,55,0.2)',
                            }}>
                              {client.nom?.[0]}{client.prenom?.[0] || ''}
                            </div>
                            <span style={{ fontSize:'13px', color:'var(--text-dark)' }}>
                              {client.nom} {client.prenom || ''}
                            </span>
                          </div>
                        ) : (
                          <span style={{ fontSize:'12px', color:'var(--text-light)', fontStyle:'italic' }}>
                            Anonyme
                          </span>
                        )}
                      </td>
                      <td>
                        <span style={{
                          background:'var(--creme)', color:'var(--text-mid)',
                          padding:'3px 9px', borderRadius:'20px',
                          fontSize:'12px', fontWeight:600,
                        }}>
                          Vente #{f.vente?.id || '-'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight:800, color:'var(--noir)', fontSize:'14px' }}>
                          {formatMontant(f.montant)}
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
                        <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>

                          {/* PDF — tout le monde */}
                          <button
                            onClick={() => genererPDF(f)}
                            style={{
                              display:'flex', alignItems:'center', gap:'6px',
                              background:'var(--noir)', color:'var(--primary)',
                              border:'1px solid rgba(212,175,55,0.3)',
                              padding:'7px 14px', borderRadius:'8px',
                              fontSize:'12px', fontWeight:600,
                              cursor:'pointer', transition:'all 0.2s',
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = 'var(--primary)';
                              e.currentTarget.style.color = 'var(--noir)';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = 'var(--noir)';
                              e.currentTarget.style.color = 'var(--primary)';
                            }}
                          >
                            <i className="ti ti-download" style={{ fontSize:'14px' }} />
                            PDF + QR
                          </button>

                          {/* Supprimer — ADMIN seulement, facture annulée seulement */}
                          {hasRole('ADMIN') && f.statut === 'ANNULEE' && (
                            <button
                              onClick={() => handleSupprimer(f.id)}
                              title="Supprimer cette facture annulée"
                              className="btn-icon btn-delete"
                            >
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
                Aucune facture trouvée
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Factures;
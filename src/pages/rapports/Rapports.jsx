import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import Navbar from '../../components/Navbar';
import api from '../../services/api';

const Rapports = () => {
  const [rapport, setRapport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [periode, setPeriode] = useState('mois');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');

  useEffect(() => {
    appliquerPeriodeRapide('mois');
  }, []);

  const appliquerPeriodeRapide = (type) => {
    setPeriode(type);
    const maintenant = new Date();
    let debut, fin;

    if (type === 'aujourdhui') {
      debut = new Date(maintenant.setHours(0, 0, 0, 0));
      fin = new Date();
    } else if (type === 'semaine') {
      debut = new Date();
      debut.setDate(debut.getDate() - 7);
      fin = new Date();
    } else if (type === 'mois') {
      debut = new Date();
      debut.setDate(1);
      debut.setHours(0, 0, 0, 0);
      fin = new Date();
    } else if (type === 'annee') {
      debut = new Date(maintenant.getFullYear(), 0, 1);
      fin = new Date();
    }

    const debutStr = debut.toISOString().slice(0, 19);
    const finStr = fin.toISOString().slice(0, 19);
    setDateDebut(debutStr);
    setDateFin(finStr);
    fetchRapport(debutStr, finStr);
  };

  const fetchRapport = async (debut, fin) => {
    setLoading(true);
    try {
      const r = await api.get('/admin/rapports', {
        params: { debut, fin }
      });
      setRapport(r.data);
    } catch {
      toast.error('Erreur chargement du rapport');
    } finally {
      setLoading(false);
    }
  };

  const handleRechercheManuelle = () => {
    if (!dateDebut || !dateFin) {
      toast.error('Veuillez sélectionner les deux dates');
      return;
    }
    setPeriode('manuel');
    fetchRapport(dateDebut, dateFin);
  };

  const formatMontant = (m) => {
    if (!m) return '0 GNF';
    return Math.round(m).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' GNF';
  };

  const exporterPDF = () => {
    if (!rapport) return;
    try {
      const doc = new jsPDF();

      // En-tête
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
      doc.text('Rapport de performance', 15, 48);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const debutFormate = new Date(dateDebut).toLocaleDateString('fr-FR');
      const finFormate = new Date(dateFin).toLocaleDateString('fr-FR');
      doc.text(`Période : du ${debutFormate} au ${finFormate}`, 15, 56);
      doc.text(`Généré le : ${new Date().toLocaleDateString('fr-FR')}`, 15, 62);

      // KPIs
      let y = 78;
      doc.setFillColor(245, 240, 235);
      doc.rect(15, y, 180, 32, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text('CHIFFRE D\'AFFAIRES', 22, y + 10);
      doc.text('NOMBRE DE VENTES', 90, y + 10);
      doc.text('PANIER MOYEN', 150, y + 10);

      doc.setFontSize(14);
      doc.setTextColor(184, 150, 12);
      doc.text(formatMontant(rapport.chiffreAffaires), 22, y + 22);
      doc.setTextColor(0, 0, 0);
      doc.text(String(rapport.nombreVentes), 90, y + 22);
      doc.text(formatMontant(rapport.panierMoyen), 150, y + 22);

      y += 44;

      // Évolution
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      const evolutionTexte = rapport.evolutionPourcentage >= 0
        ? `Évolution : +${rapport.evolutionPourcentage.toFixed(1)}% par rapport à la période précédente`
        : `Évolution : ${rapport.evolutionPourcentage.toFixed(1)}% par rapport à la période précédente`;
      doc.text(evolutionTexte, 15, y);

      y += 16;

      // Top produits
      doc.setFillColor(13, 13, 13);
      doc.rect(15, y, 180, 8, 'F');
      doc.setTextColor(212, 175, 55);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Produit', 18, y + 5.5);
      doc.text('Quantité vendue', 110, y + 5.5);
      doc.text('Montant', 160, y + 5.5);

      y += 8;
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);

      (rapport.topProduits || []).forEach((p, i) => {
        const rowY = y + (i * 8) + 6;
        if (i % 2 === 0) {
          doc.setFillColor(245, 240, 235);
          doc.rect(15, y + (i * 8), 180, 8, 'F');
        }
        doc.text(String(p.nomProduit || '-'), 18, rowY);
        doc.text(String(p.quantiteVendue || 0), 118, rowY);
        doc.text(formatMontant(p.montantTotal).replace(' GNF', ''), 160, rowY);
      });

      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text("KANDIOU'S Fashion — Rapport confidentiel", 15, 285);

      doc.save(`Rapport-${dateDebut.slice(0, 10)}-au-${dateFin.slice(0, 10)}.pdf`);
      toast.success('Rapport exporté !');
    } catch {
      toast.error('Erreur lors de l\'export');
    }
  };

  const periodeBoutons = [
    { key: 'aujourdhui', label: "Aujourd'hui" },
    { key: 'semaine', label: '7 derniers jours' },
    { key: 'mois', label: 'Ce mois' },
    { key: 'annee', label: 'Cette année' },
  ];

  return (
    <div className="page-container">
      <Navbar />
      <div className="page-content">

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontFamily: 'Playfair Display,serif', fontSize: '26px', fontWeight: 700, color: 'var(--noir)' }}>
              Rapports & Statistiques
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-light)', marginTop: '3px' }}>
              Analysez l'activité de votre boutique par période
            </p>
          </div>
          {rapport && (
            <button onClick={exporterPDF} className="btn-primary">
              <i className="ti ti-download" /> Exporter en PDF
            </button>
          )}
        </div>

        {/* Sélecteur de période */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
            {periodeBoutons.map(p => (
              <button
                key={p.key}
                onClick={() => appliquerPeriodeRapide(p.key)}
                style={{
                  padding: '8px 16px', borderRadius: '8px',
                  border: periode === p.key ? '1.5px solid var(--primary)' : '1.5px solid var(--border)',
                  background: periode === p.key ? 'rgba(212,175,55,0.1)' : 'white',
                  color: periode === p.key ? 'var(--primary-dark)' : 'var(--text-mid)',
                  fontSize: '12.5px', fontWeight: 700, cursor: 'pointer',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-mid)', marginBottom: '5px', textTransform: 'uppercase' }}>
                Du
              </label>
              <input
                type="date"
                value={dateDebut.slice(0, 10)}
                onChange={e => setDateDebut(e.target.value + 'T00:00:00')}
                style={{ padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '13px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-mid)', marginBottom: '5px', textTransform: 'uppercase' }}>
                Au
              </label>
              <input
                type="date"
                value={dateFin.slice(0, 10)}
                onChange={e => setDateFin(e.target.value + 'T23:59:59')}
                style={{ padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '13px' }}
              />
            </div>
            <button onClick={handleRechercheManuelle} className="btn-primary">
              <i className="ti ti-filter" /> Appliquer
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-container"><div className="loading-spinner" /></div>
        ) : rapport ? (
          <>
            {/* KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px', marginBottom: '20px' }}>
              <div style={{ background: 'var(--noir)', borderRadius: '14px', padding: '20px', border: '1px solid rgba(212,175,55,0.12)' }}>
                <div style={{ fontSize: '10px', color: 'rgba(212,175,55,0.65)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                  Chiffre d'affaires
                </div>
                <div style={{ fontFamily: 'Playfair Display,serif', fontSize: '22px', fontWeight: 700, color: '#fff' }}>
                  {formatMontant(rapport.chiffreAffaires)}
                </div>
                <div style={{ fontSize: '11px', marginTop: '8px', color: rapport.evolutionPourcentage >= 0 ? '#81c784' : '#e57373' }}>
                  {rapport.evolutionPourcentage >= 0 ? '↑' : '↓'} {Math.abs(rapport.evolutionPourcentage).toFixed(1)}% vs période précédente
                </div>
              </div>
              <div style={{ background: 'var(--noir)', borderRadius: '14px', padding: '20px', border: '1px solid rgba(212,175,55,0.12)' }}>
                <div style={{ fontSize: '10px', color: 'rgba(212,175,55,0.65)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                  Nombre de ventes
                </div>
                <div style={{ fontFamily: 'Playfair Display,serif', fontSize: '22px', fontWeight: 700, color: '#fff' }}>
                  {rapport.nombreVentes}
                </div>
              </div>
              <div style={{ background: 'var(--noir)', borderRadius: '14px', padding: '20px', border: '1px solid rgba(212,175,55,0.12)' }}>
                <div style={{ fontSize: '10px', color: 'rgba(212,175,55,0.65)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                  Panier moyen
                </div>
                <div style={{ fontFamily: 'Playfair Display,serif', fontSize: '22px', fontWeight: 700, color: '#fff' }}>
                  {formatMontant(rapport.panierMoyen)}
                </div>
              </div>
            </div>

            {/* Top produits */}
            <div className="card">
              <h3 style={{ fontFamily: 'Playfair Display,serif', fontSize: '15px', color: 'var(--noir)', marginBottom: '16px' }}>
                Top produits vendus
              </h3>
              {rapport.topProduits?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {rapport.topProduits.map((p, i) => {
                    const maxQte = rapport.topProduits[0]?.quantiteVendue || 1;
                    const pct = Math.round((p.quantiteVendue / maxQte) * 100);
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', background: 'var(--creme-2)', borderRadius: '10px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary-dark)', width: '20px' }}>#{i + 1}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--noir)' }}>{p.nomProduit}</div>
                          <div style={{ height: '4px', background: 'var(--creme-3)', borderRadius: '2px', marginTop: '6px' }}>
                            <div style={{ height: '4px', background: 'linear-gradient(90deg,var(--primary-dark),var(--primary))', borderRadius: '2px', width: `${pct}%` }} />
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--noir)' }}>{p.quantiteVendue} vendus</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>{formatMontant(p.montantTotal)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p style={{ textAlign: 'center', color: 'var(--text-light)', padding: '30px' }}>Aucune vente sur cette période</p>
              )}
            </div>
          </>
        ) : null}

      </div>
    </div>
  );
};

export default Rapports;
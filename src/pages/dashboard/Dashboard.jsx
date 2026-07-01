import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import api from '../../services/api';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale,
  BarElement, Title, Tooltip, Legend, ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale,
  BarElement, Title, Tooltip, Legend, ArcElement
);

const Dashboard = () => {
  const { user, hasRole } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      let endpoint = '/dashboard/caissier';
      if (hasRole('ADMIN')) endpoint = '/dashboard/admin';
      else if (hasRole('VENDEUR')) endpoint = '/dashboard/vendeur';
      const response = await api.get(endpoint);
      setStats(response.data);
    } catch {
      toast.error('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  const formatMontant = (m) => {
    if (!m) return '0 GNF';
    const n = Math.round(m);
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' GNF';
  };

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner" />
      <p style={{ color:'var(--primary)', fontFamily:'Playfair Display,serif', fontSize:'14px' }}>
        Chargement...
      </p>
    </div>
  );

  return (
    <div className="page-container">
      <Navbar />
      <div className="page-content">

        {/* PAGE TOP */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'24px' }}>
          <div>
            <h1 style={{ fontFamily:'Playfair Display,serif', fontSize:'26px', fontWeight:700, color:'var(--noir)' }}>
              Tableau de bord
            </h1>
            <p style={{ fontSize:'13px', color:'var(--text-light)', marginTop:'3px' }}>
              Bienvenue, {user?.prenom} {user?.nom} — activité de votre boutique
            </p>
          </div>
          <div style={{
            display:'flex', alignItems:'center', gap:'8px',
            background:'var(--white)', border:'1px solid var(--border)',
            borderRadius:'10px', padding:'9px 15px',
            fontSize:'12px', color:'var(--text-light)',
            boxShadow:'var(--shadow)',
          }}>
            <i className="ti ti-calendar" style={{ color:'var(--primary)', fontSize:'14px' }} />
            {new Date().toLocaleDateString('fr-FR', {
              weekday:'long', year:'numeric',
              month:'long', day:'numeric'
            })}
          </div>
        </div>

        {/* HERO BANNER */}
        <div style={{
          borderRadius:'18px', overflow:'hidden',
          position:'relative', height:'220px',
          marginBottom:'22px', background:'var(--noir)',
          border:'1px solid rgba(212,175,55,0.15)',
        }}>
          <div style={{
            position:'absolute', inset:0,
            backgroundImage:'url(https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80)',
            backgroundSize:'cover', backgroundPosition:'center',
            opacity:0.25,
          }} />
          <div style={{
            position:'absolute', inset:0,
            background:'linear-gradient(90deg, var(--noir) 40%, transparent 100%)',
          }} />
          <div style={{ position:'relative', zIndex:2, padding:'28px 36px' }}>
            <div style={{
              fontSize:'10px', color:'var(--primary)',
              letterSpacing:'3px', textTransform:'uppercase',
              fontWeight:600, marginBottom:'8px',
            }}>
              Élégance · Qualité · Exclusivité
            </div>
            <div style={{
              fontFamily:'Playfair Display,serif',
              fontSize:'28px', fontWeight:700, color:'#fff', lineHeight:1.2,
            }}>
              KANDIOU'S <span style={{ color:'var(--primary)', fontStyle:'italic' }}>Fashion</span>
            </div>
            <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.45)', marginTop:'8px' }}>
              Boutique de vêtements féminins — Conakry, Guinée
            </div>

            {/* Bannière chiffres — ADMIN seulement */}
            {stats && hasRole('ADMIN') && (
              <div style={{ display:'flex', gap:'32px', marginTop:'18px', alignItems:'flex-end' }}>
                {[
                  { val: stats.totalClients || 0, label:'Clientes' },
                  { val: stats.totalProduits || 0, label:'Produits' },
                  { val: stats.totalFactures || 0, label:'Factures' },
                  { val: formatMontant(stats.caMois), label:'CA du mois' },
                ].map((s, i) => (
                  <div key={i} style={{ display:'flex', flexDirection:'column', gap:'3px' }}>
                    <span style={{
                      fontFamily:'Playfair Display,serif',
                      fontSize:'22px', fontWeight:700,
                      color:'var(--primary)', lineHeight:1,
                    }}>
                      {s.val}
                    </span>
                    <span style={{
                      fontSize:'10px', color:'rgba(255,255,255,0.75)',
                      textTransform:'uppercase', letterSpacing:'1.5px',
                      fontWeight:700, display:'block',
                    }}>
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Bannière chiffres — VENDEUR */}
            {stats && hasRole('VENDEUR') && (
              <div style={{ display:'flex', gap:'32px', marginTop:'18px', alignItems:'flex-end' }}>
                {[
                  { val: stats.totalProduits || 0, label:'Produits' },
                  { val: stats.produitsEnRupture || 0, label:'En rupture' },
                  { val: stats.produitsStockBas || 0, label:'Stock bas' },
                ].map((s, i) => (
                  <div key={i} style={{ display:'flex', flexDirection:'column', gap:'3px' }}>
                    <span style={{
                      fontFamily:'Playfair Display,serif',
                      fontSize:'22px', fontWeight:700,
                      color: i === 0 ? 'var(--primary)' : i === 1 ? '#e53935' : '#ef6c00',
                      lineHeight:1,
                    }}>
                      {s.val}
                    </span>
                    <span style={{
                      fontSize:'10px', color:'rgba(255,255,255,0.75)',
                      textTransform:'uppercase', letterSpacing:'1.5px',
                      fontWeight:700, display:'block',
                    }}>
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* KPIs ADMIN */}
        {hasRole('ADMIN') && stats && (
          <div style={{
            display:'grid', gridTemplateColumns:'repeat(4,1fr)',
            gap:'14px', marginBottom:'22px',
          }}>
            {[
              { label:'Ventes du jour', val:stats.ventesJour || 0, icon:'🛒' },
              { label:'CA du jour', val:formatMontant(stats.caJour), icon:'💰' },
              { label:'Total clients', val:stats.totalClients || 0, icon:'👥' },
              { label:'Total factures', val:stats.totalFactures || 0, icon:'🧾' },
            ].map((kpi, i) => (
              <div key={i} style={{
                background:'var(--noir)', borderRadius:'16px', padding:'22px',
                border:'1px solid rgba(212,175,55,0.12)',
                position:'relative', overflow:'hidden',
              }}>
                <div style={{ position:'absolute', top:0, left:0, right:0, height:'2px', background:'linear-gradient(90deg,transparent,var(--primary),transparent)' }} />
                <div style={{ fontSize:'10px', fontWeight:600, color:'rgba(212,175,55,0.65)', textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:'10px' }}>{kpi.label}</div>
                <div style={{ fontFamily:'Playfair Display,serif', fontSize:'30px', fontWeight:700, color:'#fff', lineHeight:1 }}>{kpi.val}</div>
                <div style={{ textAlign:'right', marginTop:'12px', fontSize:'28px', opacity:0.15 }}>{kpi.icon}</div>
              </div>
            ))}
          </div>
        )}

        {/* KPIs VENDEUR */}
        {hasRole('VENDEUR') && stats && (
          <div style={{
            display:'grid', gridTemplateColumns:'repeat(3,1fr)',
            gap:'14px', marginBottom:'22px',
          }}>
            {[
              { label:'Total produits', val:stats.totalProduits || 0, icon:'👗', color:'var(--primary)' },
              { label:'Produits en rupture', val:stats.produitsEnRupture || 0, icon:'⚠️', color:'#e53935' },
              { label:'Stock bas', val:stats.produitsStockBas || 0, icon:'📉', color:'#ef6c00' },
            ].map((kpi, i) => (
              <div key={i} style={{
                background:'var(--noir)', borderRadius:'16px', padding:'22px',
                border:`1px solid ${i === 0 ? 'rgba(212,175,55,0.12)' : i === 1 ? 'rgba(229,57,53,0.2)' : 'rgba(239,108,0,0.2)'}`,
                position:'relative', overflow:'hidden',
              }}>
                <div style={{ position:'absolute', top:0, left:0, right:0, height:'2px', background:`linear-gradient(90deg,transparent,${kpi.color},transparent)` }} />
                <div style={{ fontSize:'10px', fontWeight:600, color:'rgba(212,175,55,0.65)', textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:'10px' }}>{kpi.label}</div>
                <div style={{ fontFamily:'Playfair Display,serif', fontSize:'30px', fontWeight:700, color: i === 0 ? '#fff' : kpi.color, lineHeight:1 }}>{kpi.val}</div>
                <div style={{ textAlign:'right', marginTop:'8px', fontSize:'28px', opacity:0.15 }}>{kpi.icon}</div>
              </div>
            ))}
          </div>
        )}

        {/* KPIs CAISSIER */}
        {hasRole('CAISSIER') && stats && (
          <div style={{
            display:'grid', gridTemplateColumns:'repeat(2,1fr)',
            gap:'14px', marginBottom:'22px',
          }}>
            {[
              { label:'Ventes du jour', val:stats.ventesJour || 0, icon:'🛒' },
              { label:'Factures du jour', val:stats.facturesJour || 0, icon:'🧾' },
            ].map((kpi, i) => (
              <div key={i} style={{
                background:'var(--noir)', borderRadius:'16px', padding:'22px',
                border:'1px solid rgba(212,175,55,0.12)', position:'relative', overflow:'hidden',
              }}>
                <div style={{ position:'absolute', top:0, left:0, right:0, height:'2px', background:'linear-gradient(90deg,transparent,var(--primary),transparent)' }} />
                <div style={{ fontSize:'10px', fontWeight:600, color:'rgba(212,175,55,0.65)', textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:'10px' }}>{kpi.label}</div>
                <div style={{ fontFamily:'Playfair Display,serif', fontSize:'30px', fontWeight:700, color:'#fff', lineHeight:1 }}>{kpi.val}</div>
                <div style={{ textAlign:'right', marginTop:'8px', fontSize:'28px', opacity:0.15 }}>{kpi.icon}</div>
              </div>
            ))}
          </div>
        )}

        {/* IMAGE CARDS — tous les rôles */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'14px', marginBottom:'22px' }}>
          {[
            { img:'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80', label:'Collection', title:'Robes & Ensembles' },
            { img:'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&q=80', label:'Tendance', title:'Voiles & Jeans' },
            { img:'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&q=80', label:'Arrivage', title:'Nouvelle Collection' },
          ].map((card, i) => (
            <div key={i} style={{
              borderRadius:'16px', overflow:'hidden',
              position:'relative', height:'160px', cursor:'pointer',
            }}
            onMouseEnter={e => e.currentTarget.querySelector('img').style.transform = 'scale(1.06)'}
            onMouseLeave={e => e.currentTarget.querySelector('img').style.transform = 'scale(1)'}>
              <img src={card.img} alt={card.title} style={{
                width:'100%', height:'100%', objectFit:'cover',
                transition:'transform 0.4s',
              }}
              onError={e => {
                e.target.src = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80';
              }}
              />
              <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 60%)' }} />
              <div style={{ position:'absolute', top:'12px', right:'12px', background:'var(--primary)', color:'var(--noir)', fontSize:'10px', fontWeight:800, padding:'3px 10px', borderRadius:'20px' }}>Explorer</div>
              <div style={{ position:'absolute', bottom:'14px', left:'16px' }}>
                <div style={{ fontSize:'9px', color:'var(--primary)', letterSpacing:'2px', textTransform:'uppercase', fontWeight:600 }}>{card.label}</div>
                <div style={{ fontFamily:'Playfair Display,serif', fontSize:'16px', color:'#fff', fontWeight:700, marginTop:'2px' }}>{card.title}</div>
              </div>
            </div>
          ))}
        </div>

        {/* DIVIDER OR */}
        <div className="gold-divider">
          <div className="gold-line" />
          <div className="gold-dot" />
          <div className="gold-line" />
        </div>

        {/* SECTION ANALYTIQUE — ADMIN : graphiques + ventes + top + alertes */}
        {hasRole('ADMIN') && stats && (
          <>
            {/* CHARTS */}
            <div style={{ display:'grid', gridTemplateColumns:'1.6fr 1fr', gap:'14px', marginBottom:'14px' }}>
              <div className="card">
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'18px' }}>
                  <h3 style={{ fontFamily:'Playfair Display,serif', fontSize:'15px', color:'var(--noir)' }}>
                    Chiffre d'affaires — 7 jours
                  </h3>
                  <span className="chip chip-gold">En GNF</span>
                </div>
                <Bar
                  data={{
                    labels: stats?.ca7Jours?.map(j => j.jour) || ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'],
                    datasets:[{
                      label:'CA (GNF)',
                      data: stats?.ca7Jours?.map(j => j.montant) || [0,0,0,0,0,0,0],
                      backgroundColor: stats?.ca7Jours?.map((j) => {
                        const isMax = j.montant === Math.max(...stats.ca7Jours.map(x => x.montant));
                        return isMax ? 'rgba(212,175,55,0.9)' : 'rgba(212,175,55,0.3)';
                      }) || ['rgba(212,175,55,0.3)'],
                      borderColor:'var(--primary)',
                      borderWidth:1,
                      borderRadius:6,
                    }],
                  }}
                  options={{
                    responsive:true,
                    plugins:{
                      legend:{ display:false },
                      tooltip:{
                        callbacks:{
                          label:(ctx) => ' ' + Math.round(ctx.raw).toString().replace(/\B(?=(\d{3})+(?!\d))/g,' ') + ' GNF'
                        }
                      }
                    },
                    scales:{
                      y:{
                        grid:{ color:'rgba(0,0,0,0.04)' },
                        ticks:{
                          color:'#bbb', font:{ size:10 },
                          callback:(val) => {
                            if (val >= 1000000) return (val/1000000).toFixed(1) + 'M';
                            if (val >= 1000) return (val/1000).toFixed(0) + 'K';
                            return val;
                          }
                        },
                      },
                      x:{ grid:{ display:false }, ticks:{ color:'#bbb', font:{ size:10 } } },
                    },
                  }}
                />
              </div>

              <div className="card">
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'18px' }}>
                  <h3 style={{ fontFamily:'Playfair Display,serif', fontSize:'15px', color:'var(--noir)' }}>
                    État du stock
                  </h3>
                </div>
                <Doughnut
                  data={{
                    labels:['Normal','Stock bas','Rupture'],
                    datasets:[{
                      data:[
                        Math.max(0,(stats.totalProduits||0)-(stats.produitsStockBas||0)-(stats.produitsEnRupture||0)),
                        stats.produitsStockBas||0,
                        stats.produitsEnRupture||0,
                      ],
                      backgroundColor:['#2e7d32','#ef6c00','#e53935'],
                      borderWidth:0,
                    }],
                  }}
                  options={{
                    responsive:true, cutout:'70%',
                    plugins:{
                      legend:{
                        position:'bottom',
                        labels:{ color:'#555', font:{ size:11 }, padding:16, usePointStyle:true },
                      },
                    },
                  }}
                />
              </div>
            </div>

            {/* DERNIÈRES VENTES + TOP + ALERTES */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:'14px' }}>
              <div className="card">
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'18px' }}>
                  <h3 style={{ fontFamily:'Playfair Display,serif', fontSize:'15px', color:'var(--noir)' }}>
                    Dernières ventes
                  </h3>
                  <span className="chip">Aujourd'hui</span>
                </div>
                <table className="data-table" style={{ fontSize:'12.5px' }}>
                  <thead>
                    <tr>
                      {['N°','Cliente','Montant','Paiement','Statut'].map((h,i) => (
                        <th key={i}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {stats?.listeVentesJour?.length > 0 ? (
                      stats.listeVentesJour.slice(0,5).map((v, i) => (
                        <tr key={i}>
                          <td style={{ color:'var(--primary)', fontWeight:800 }}>#{v.id}</td>
                          <td>
                            <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                              <div style={{ width:'26px', height:'26px', background:'var(--noir)', borderRadius:'7px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'9px', fontWeight:800, color:'var(--primary)' }}>
                                {v.client ? `${v.client.nom?.[0] || ''}${v.client.prenom?.[0] || ''}` : '?'}
                              </div>
                              {v.client ? `${v.client.nom} ${v.client.prenom || ''}` : 'Client anonyme'}
                            </div>
                          </td>
                          <td style={{ fontWeight:800, color:'var(--noir)' }}>
                            {Math.round(v.montantTotal || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} GNF
                          </td>
                          <td>{v.modePaiement?.replace(/_/g,' ')}</td>
                          <td>
                            <span className={v.statut === 'VALIDEE' ? 'badge badge-success' : 'badge badge-danger'}>
                              {v.statut === 'VALIDEE' ? 'Validée' : 'Annulée'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} style={{ textAlign:'center', color:'var(--text-light)', padding:'30px', fontStyle:'italic' }}>
                          Aucune vente aujourd'hui
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
                {/* TOP PRODUITS — ADMIN */}
                <div className="card">
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}>
                    <h3 style={{ fontFamily:'Playfair Display,serif', fontSize:'15px', color:'var(--noir)' }}>Top produits</h3>
                    <span className="chip chip-gold">Ce mois</span>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                    {stats?.topProduits?.length > 0 ? (
                      stats.topProduits.slice(0, 3).map((p, i) => {
                        const nom = p[1] || 'Produit';
                        const count = Number(p[2] || 0);
                        const maxCount = Number(stats.topProduits[0]?.[2] || 1);
                        const pct = Math.round((count / maxCount) * 100);
                        const ranks = ['🥇', '🥈', '🥉'];
                        return (
                          <div key={i} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 12px', background:'var(--creme-2)', borderRadius:'11px', border:'1px solid var(--border)' }}>
                            <span style={{ fontSize:'15px', width:'22px', textAlign:'center' }}>{ranks[i]}</span>
                            <div style={{ flex:1, minWidth:0 }}>
                              <div style={{ fontSize:'12px', fontWeight:700, color:'var(--noir)' }}>{nom}</div>
                              <div style={{ fontSize:'10px', color:'var(--text-light)', marginTop:'1px' }}>{count} vendu{count > 1 ? 's' : ''}</div>
                              <div style={{ height:'3px', background:'var(--creme-3)', borderRadius:'2px', marginTop:'5px' }}>
                                <div style={{ height:'3px', background:'linear-gradient(90deg,var(--primary-dark),var(--primary))', borderRadius:'2px', width:`${pct}%`, transition:'width 0.5s ease' }} />
                              </div>
                            </div>
                            <span style={{ fontSize:'13px', fontWeight:800, color:'var(--primary-dark)' }}>{count}</span>
                          </div>
                        );
                      })
                    ) : (
                      <p style={{ textAlign:'center', color:'var(--text-light)', padding:'20px', fontSize:'13px' }}>Aucune vente enregistrée</p>
                    )}
                  </div>
                </div>

                {/* ALERTES — ADMIN */}
                <div className="card">
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}>
                    <h3 style={{ fontFamily:'Playfair Display,serif', fontSize:'15px', color:'var(--noir)' }}>Alertes stock</h3>
                    <span className="chip" style={{
                      background: (stats?.produitsEnRupture || 0) + (stats?.produitsStockBas || 0) > 0
                        ? '#ffebee' : '#e8f5e9',
                      color: (stats?.produitsEnRupture || 0) + (stats?.produitsStockBas || 0) > 0
                        ? '#c62828' : '#2e7d32'
                    }}>
                      {(stats?.produitsEnRupture || 0) + (stats?.produitsStockBas || 0)} alerte{((stats?.produitsEnRupture || 0) + (stats?.produitsStockBas || 0)) > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                    {[
                      { icon:'🔴', title:`${stats?.produitsEnRupture || 0} produit(s) en rupture`, sub:'Réapprovisionnement urgent', cls:'r', show: (stats?.produitsEnRupture || 0) > 0 },
                      { icon:'🟡', title:`${stats?.produitsStockBas || 0} produit(s) stock bas`, sub:'Seuil minimum atteint', cls:'o', show: (stats?.produitsStockBas || 0) > 0 },
                    ].filter(a => a.show).map((a, i) => (
                      <div key={i} style={{
                        display:'flex', alignItems:'flex-start', gap:'10px',
                        padding:'11px 12px', borderRadius:'11px',
                        background: a.cls==='r' ? '#fff5f5' : '#fff8f0',
                        border: `1px solid ${a.cls==='r' ? '#ffcdd2' : '#ffe0b2'}`,
                      }}>
                        <span style={{ fontSize:'16px', flexShrink:0, marginTop:'1px' }}>{a.icon}</span>
                        <div>
                          <div style={{ fontSize:'12.5px', fontWeight:700, color: a.cls==='r' ? '#c62828' : '#e65100' }}>{a.title}</div>
                          <div style={{ fontSize:'11px', color:'var(--text-light)', marginTop:'2px' }}>{a.sub}</div>
                        </div>
                      </div>
                    ))}
                    {(stats?.produitsEnRupture || 0) === 0 && (stats?.produitsStockBas || 0) === 0 && (
                      <div style={{ display:'flex', alignItems:'center', gap:'10px', padding:'11px 12px', borderRadius:'11px', background:'#f1f8f0', border:'1px solid #c8e6c9' }}>
                        <span style={{ fontSize:'16px' }}>🟢</span>
                        <div>
                          <div style={{ fontSize:'12.5px', fontWeight:700, color:'#2e7d32' }}>Stock en bon état</div>
                          <div style={{ fontSize:'11px', color:'var(--text-light)', marginTop:'2px' }}>Aucun produit en alerte</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* SECTION ANALYTIQUE — VENDEUR : top produits + alertes stock */}
        {hasRole('VENDEUR') && stats && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>

            {/* TOP PRODUITS — VENDEUR */}
            <div className="card">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}>
                <h3 style={{ fontFamily:'Playfair Display,serif', fontSize:'15px', color:'var(--noir)' }}>
                  Top produits
                </h3>
                <span className="chip chip-gold">Ce mois</span>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                {stats?.topProduits?.length > 0 ? (
                  stats.topProduits.slice(0, 3).map((p, i) => {
                    const nom = p[1] || 'Produit';
                    const count = Number(p[2] || 0);
                    const maxCount = Number(stats.topProduits[0]?.[2] || 1);
                    const pct = Math.round((count / maxCount) * 100);
                    const ranks = ['🥇', '🥈', '🥉'];
                    return (
                      <div key={i} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 12px', background:'var(--creme-2)', borderRadius:'11px', border:'1px solid var(--border)' }}>
                        <span style={{ fontSize:'15px', width:'22px', textAlign:'center' }}>{ranks[i]}</span>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:'12px', fontWeight:700, color:'var(--noir)' }}>{nom}</div>
                          <div style={{ fontSize:'10px', color:'var(--text-light)', marginTop:'1px' }}>{count} vendu{count > 1 ? 's' : ''}</div>
                          <div style={{ height:'3px', background:'var(--creme-3)', borderRadius:'2px', marginTop:'5px' }}>
                            <div style={{ height:'3px', background:'linear-gradient(90deg,var(--primary-dark),var(--primary))', borderRadius:'2px', width:`${pct}%`, transition:'width 0.5s ease' }} />
                          </div>
                        </div>
                        <span style={{ fontSize:'13px', fontWeight:800, color:'var(--primary-dark)' }}>{count}</span>
                      </div>
                    );
                  })
                ) : (
                  <p style={{ textAlign:'center', color:'var(--text-light)', padding:'20px', fontSize:'13px' }}>
                    Aucune vente enregistrée
                  </p>
                )}
              </div>
            </div>

            {/* ALERTES STOCK — VENDEUR */}
            <div className="card">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}>
                <h3 style={{ fontFamily:'Playfair Display,serif', fontSize:'15px', color:'var(--noir)' }}>
                  Alertes stock
                </h3>
                <span className="chip" style={{
                  background: (stats?.produitsEnRupture || 0) + (stats?.produitsStockBas || 0) > 0
                    ? '#ffebee' : '#e8f5e9',
                  color: (stats?.produitsEnRupture || 0) + (stats?.produitsStockBas || 0) > 0
                    ? '#c62828' : '#2e7d32'
                }}>
                  {(stats?.produitsEnRupture || 0) + (stats?.produitsStockBas || 0)} alerte{((stats?.produitsEnRupture || 0) + (stats?.produitsStockBas || 0)) > 1 ? 's' : ''}
                </span>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                {(stats?.produitsEnRupture || 0) > 0 && (
                  <div style={{ display:'flex', alignItems:'flex-start', gap:'10px', padding:'11px 12px', borderRadius:'11px', background:'#fff5f5', border:'1px solid #ffcdd2' }}>
                    <span style={{ fontSize:'16px', flexShrink:0 }}>🔴</span>
                    <div>
                      <div style={{ fontSize:'12.5px', fontWeight:700, color:'#c62828' }}>
                        {stats.produitsEnRupture} produit(s) en rupture
                      </div>
                      <div style={{ fontSize:'11px', color:'var(--text-light)', marginTop:'2px' }}>
                        Réapprovisionnement urgent
                      </div>
                    </div>
                  </div>
                )}
                {(stats?.produitsStockBas || 0) > 0 && (
                  <div style={{ display:'flex', alignItems:'flex-start', gap:'10px', padding:'11px 12px', borderRadius:'11px', background:'#fff8f0', border:'1px solid #ffe0b2' }}>
                    <span style={{ fontSize:'16px', flexShrink:0 }}>🟡</span>
                    <div>
                      <div style={{ fontSize:'12.5px', fontWeight:700, color:'#e65100' }}>
                        {stats.produitsStockBas} produit(s) stock bas
                      </div>
                      <div style={{ fontSize:'11px', color:'var(--text-light)', marginTop:'2px' }}>
                        Seuil minimum atteint
                      </div>
                    </div>
                  </div>
                )}
                {(stats?.produitsEnRupture || 0) === 0 && (stats?.produitsStockBas || 0) === 0 && (
                  <div style={{ display:'flex', alignItems:'center', gap:'10px', padding:'11px 12px', borderRadius:'11px', background:'#f1f8f0', border:'1px solid #c8e6c9' }}>
                    <span style={{ fontSize:'16px' }}>🟢</span>
                    <div>
                      <div style={{ fontSize:'12.5px', fontWeight:700, color:'#2e7d32' }}>Stock en bon état</div>
                      <div style={{ fontSize:'11px', color:'var(--text-light)', marginTop:'2px' }}>Aucun produit en alerte</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;
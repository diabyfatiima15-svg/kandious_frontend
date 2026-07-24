import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import ParametresDrawer from './ParametresDrawer';
import api from '../services/api';

const Navbar = () => {
  const { user, logout, hasRole, hasAnyRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [totalNotifs, setTotalNotifs] = useState(0);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

   const handleLogout = () => {
  logout();
  toast.info('Déconnexion réussie');
  navigate('/', { replace: true });
};

  // Fermer dropdowns au clic extérieur
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current &&
          !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (notifRef.current &&
          !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () =>
      document.removeEventListener('mousedown', handleClick);
  }, []);

  // Fermer le menu mobile au changement de page
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Charger notifications réelles
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const r = await api.get('/dashboard/notifications');
        setNotifications(r.data.notifications || []);
        setTotalNotifs(r.data.total || 0);
      } catch {
        setNotifications([]);
        setTotalNotifs(0);
      }
    };
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 120000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const isActive = (path) => location.pathname === path;
  const initiales = user
    ? `${user.prenom?.[0] || ''}${user.nom?.[0] || ''}` : 'U';

  const navLinks = [
    { path:'/dashboard', icon:'ti-layout-dashboard',
      label:'Dashboard', show:true },
    { path:'/produits', icon:'ti-hanger',
      label:'Produits',
      show:hasAnyRole('ADMIN','VENDEUR') },
    { path:'/clients', icon:'ti-users',
      label:'Clients',
      show:hasAnyRole('ADMIN','VENDEUR','CAISSIER') },
    { path:'/ventes', icon:'ti-shopping-cart',
      label:'Ventes',
      show:hasAnyRole('ADMIN','CAISSIER') },
    { path:'/achats', icon:'ti-package',
      label:'Achats',
      show:hasAnyRole('ADMIN','VENDEUR') },
    { path:'/factures', icon:'ti-receipt',
      label:'Factures',
      show:hasAnyRole('ADMIN','CAISSIER') },
    { path:'/rapports', icon:'ti-chart-bar',
      label:'Rapports',
      show:hasRole('ADMIN') },
    { path:'/utilisateurs', icon:'ti-shield',
      label:'Utilisateurs',
      show:hasRole('ADMIN') },
    { path:'/historique', icon:'ti-history',
      label:'Historique', show:hasRole('ADMIN') },
    { path:'/categories', icon:'ti-tag',
      label:'Catégories', show:hasRole('ADMIN') },
    { path:'/fournisseurs', icon:'ti-truck',
      label:'Fournisseurs', show:hasRole('ADMIN') },
  ].filter(l => l.show);

  const iconBtnStyle = {
    width:'36px', height:'36px',
    background:'rgba(255,255,255,0.04)',
    border:'1px solid rgba(212,175,55,0.2)',
    borderRadius:'8px', cursor:'pointer',
    display:'flex', alignItems:'center', justifyContent:'center',
    transition:'all 0.2s', position:'relative', flexShrink:0,
  };

  return (
    <>
      <nav style={{
        display:'flex', alignItems:'center',
        padding:'0 24px', height:'64px',
        background:'var(--noir)',
        borderBottom:'1px solid rgba(212,175,55,0.15)',
        position:'sticky', top:0, zIndex:300,
        boxShadow:'0 2px 20px rgba(0,0,0,0.3)',
        gap:'0',
      }}
      className="kandious-navbar"
      >

        {/* LOGO */}
        <div style={{
          display:'flex', alignItems:'center', gap:'10px',
          marginRight:'20px', flexShrink:0
        }}>
          <div style={{
            width:'38px', height:'38px',
            border:'1.5px solid var(--primary)',
            borderRadius:'4px',
            display:'flex', alignItems:'center',
            justifyContent:'center',
          }}>
            <span style={{
              fontFamily:'Playfair Display,serif',
              fontSize:'20px', fontWeight:900,
              color:'var(--primary)', fontStyle:'italic',
            }}>K</span>
          </div>
          <div>
            <div style={{
              fontFamily:'Playfair Display,serif',
              fontSize:'14px', fontWeight:700, color:'#fff',
              letterSpacing:'2px', textTransform:'uppercase',
            }}>Kandiou's</div>
            <div style={{
              fontSize:'7px', color:'var(--primary)',
              letterSpacing:'3px', textTransform:'uppercase',
            }}>Fashion</div>
          </div>
        </div>

        {/* SÉPARATEUR — masqué sur mobile */}
        <div className="navbar-separator" style={{
          width:'1px', height:'26px',
          background:'rgba(212,175,55,0.2)',
          marginRight:'16px', flexShrink:0
        }} />

        {/* NAV LINKS — desktop uniquement */}
        <div className="navbar-links-desktop" style={{
          display:'flex', gap:'0', flex:1,
          alignItems:'center', overflow:'hidden'
        }}>
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              title={link.label}
              style={{
                display:'flex', flexDirection:'column',
                alignItems:'center', gap:'3px',
                padding:'6px 10px',
                color: isActive(link.path)
                  ? 'var(--primary)'
                  : 'rgba(255,255,255,0.38)',
                fontSize:'9px', fontWeight:600,
                textDecoration:'none',
                letterSpacing:'0.6px',
                textTransform:'uppercase',
                borderBottom: isActive(link.path)
                  ? '2px solid var(--primary)'
                  : '2px solid transparent',
                transition:'all 0.2s',
                whiteSpace:'nowrap', flexShrink:0,
              }}
              onMouseEnter={e => {
                if (!isActive(link.path))
                  e.currentTarget.style.color = 'var(--primary)';
              }}
              onMouseLeave={e => {
                if (!isActive(link.path))
                  e.currentTarget.style.color =
                    'rgba(255,255,255,0.38)';
              }}
            >
              <i className={`ti ${link.icon}`}
                style={{ fontSize:'19px' }} />
              {link.label}
            </Link>
          ))}
        </div>

        {/* BOUTON HAMBURGER — mobile uniquement */}
        <button
          className="navbar-hamburger"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            display:'none',
            background:'rgba(255,255,255,0.04)',
            border:'1px solid rgba(212,175,55,0.2)',
            borderRadius:'8px',
            width:'40px', height:'40px',
            alignItems:'center', justifyContent:'center',
            cursor:'pointer', flexShrink:0, marginRight:'8px',
          }}
        >
          <i className={`ti ${mobileMenuOpen ? 'ti-x' : 'ti-menu-2'}`}
            style={{ fontSize:'20px', color:'var(--primary)' }} />
        </button>

        {/* RIGHT */}
        <div style={{
          display:'flex', alignItems:'center',
          gap:'8px', marginLeft:'auto', flexShrink:0
        }}>

          {/* NOTIFICATIONS */}
          <div ref={notifRef} style={{ position:'relative' }}>
            <div
              style={iconBtnStyle}
              onClick={() => {
                setNotifOpen(!notifOpen);
                setDropdownOpen(false);
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background =
                  'rgba(212,175,55,0.08)';
                e.currentTarget.style.borderColor =
                  'var(--primary)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background =
                  'rgba(255,255,255,0.04)';
                e.currentTarget.style.borderColor =
                  'rgba(212,175,55,0.2)';
              }}
            >
              <i className="ti ti-bell" style={{
                color:'rgba(255,255,255,0.45)', fontSize:'18px'
              }} />
              {totalNotifs > 0 && (
                <div style={{
                  width:'7px', height:'7px',
                  background:'var(--primary)',
                  borderRadius:'50%', position:'absolute',
                  top:'7px', right:'7px',
                  border:'1.5px solid var(--noir)',
                }} />
              )}
            </div>

            {/* DROPDOWN NOTIFICATIONS */}
            {notifOpen && (
              <div style={{
                position:'absolute', top:'calc(100% + 10px)',
                right:0, width:'320px', background:'#111',
                border:'1px solid rgba(212,175,55,0.2)',
                borderRadius:'12px', overflow:'hidden',
                boxShadow:'0 16px 40px rgba(0,0,0,0.4)',
                zIndex:400, animation:'fadeIn 0.18s ease',
                maxWidth:'90vw',
              }}>
                <div style={{
                  padding:'14px 16px',
                  borderBottom:'1px solid rgba(212,175,55,0.12)',
                  display:'flex', justifyContent:'space-between',
                  alignItems:'center',
                }}>
                  <span style={{
                    fontFamily:'Playfair Display,serif',
                    fontSize:'14px', fontWeight:700, color:'#fff',
                  }}>Notifications</span>
                  <span style={{
                    fontSize:'10px', fontWeight:700,
                    color:'var(--primary)',
                    background:'rgba(212,175,55,0.12)',
                    padding:'2px 7px', borderRadius:'10px',
                  }}>
                    {totalNotifs} nouvelle
                    {totalNotifs > 1 ? 's' : ''}
                  </span>
                </div>

                {notifications.length > 0
                  ? notifications.map((n, i) => (
                    <div key={i} style={{
                      display:'flex', alignItems:'flex-start',
                      gap:'11px', padding:'13px 16px',
                      borderBottom: i < notifications.length - 1
                        ? '1px solid rgba(255,255,255,0.04)'
                        : 'none',
                      cursor:'pointer',
                      transition:'background 0.18s',
                    }}
                    onClick={() => {
                      setNotifOpen(false);
                      navigate(n.lien || '/dashboard');
                    }}
                    onMouseEnter={e =>
                      e.currentTarget.style.background =
                        'rgba(212,175,55,0.04)'}
                    onMouseLeave={e =>
                      e.currentTarget.style.background =
                        'transparent'}
                    >
                      <span style={{
                        fontSize:'20px', flexShrink:0
                      }}>
                        {n.icon}
                      </span>
                      <div style={{ flex:1 }}>
                        <div style={{
                          fontSize:'12.5px', fontWeight:600,
                          color:'#fff'
                        }}>
                          {n.titre}
                        </div>
                        <div style={{
                          fontSize:'11px',
                          color:'rgba(255,255,255,0.35)',
                          marginTop:'2px'
                        }}>
                          {n.detail}
                        </div>
                        <div style={{
                          fontSize:'10px', color:n.couleur,
                          marginTop:'4px', fontWeight:600
                        }}>
                          Cliquer pour voir →
                        </div>
                      </div>
                    </div>
                  ))
                  : (
                    <div style={{
                      padding:'30px', textAlign:'center',
                      color:'rgba(255,255,255,0.3)', fontSize:'12px'
                    }}>
                      <i className="ti ti-bell-off" style={{
                        fontSize:'32px', display:'block',
                        marginBottom:'8px', opacity:0.3
                      }} />
                      Aucune notification
                    </div>
                  )
                }

                <div style={{
                  padding:'10px 16px',
                  borderTop:'1px solid rgba(212,175,55,0.1)'
                }}>
                  <button
                    onClick={() => {
                      setNotifOpen(false);
                      navigate('/produits');
                    }}
                    style={{
                      width:'100%', padding:'8px',
                      background:'rgba(212,175,55,0.08)',
                      border:'1px solid rgba(212,175,55,0.2)',
                      borderRadius:'8px', color:'var(--primary)',
                      fontSize:'12px', fontWeight:600,
                      cursor:'pointer',
                    }}
                  >
                    Voir toutes les alertes stock →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* PARAMÈTRES */}
          {hasRole('ADMIN') && (
            <div
              style={iconBtnStyle}
              onClick={() => setDrawerOpen(true)}
              onMouseEnter={e => {
                e.currentTarget.style.background =
                  'rgba(212,175,55,0.08)';
                e.currentTarget.style.borderColor =
                  'var(--primary)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background =
                  'rgba(255,255,255,0.04)';
                e.currentTarget.style.borderColor =
                  'rgba(212,175,55,0.2)';
              }}
            >
              <i className="ti ti-settings" style={{
                color:'rgba(255,255,255,0.45)', fontSize:'18px'
              }} />
            </div>
          )}

          {/* USER PILL + DROPDOWN */}
          <div ref={dropdownRef} style={{ position:'relative' }}>
            <div
              onClick={() => {
                setDropdownOpen(!dropdownOpen);
                setNotifOpen(false);
              }}
              style={{
                display:'flex', alignItems:'center', gap:'8px',
                background: dropdownOpen
                  ? 'rgba(212,175,55,0.08)'
                  : 'rgba(255,255,255,0.04)',
                border:`1px solid ${dropdownOpen
                  ? 'var(--primary)'
                  : 'rgba(212,175,55,0.2)'}`,
                borderRadius:'10px',
                padding:'5px 10px 5px 5px',
                cursor:'pointer', transition:'all 0.2s',
                flexShrink:0,
              }}
            >
              <div style={{
                width:'28px', height:'28px',
                background:'linear-gradient(135deg,#b8960c,#d4af37)',
                borderRadius:'7px', flexShrink:0,
                display:'flex', alignItems:'center',
                justifyContent:'center',
                fontSize:'10px', fontWeight:800, color:'#0d0d0d',
              }}>{initiales}</div>
              <div className="navbar-user-info">
                <div style={{
                  fontSize:'11.5px', fontWeight:700,
                  color:'#fff', whiteSpace:'nowrap'
                }}>
                  {user?.prenom}
                </div>
                <div style={{
                  fontSize:'8px', color:'var(--primary)',
                  fontWeight:700,
                  background:'rgba(212,175,55,0.12)',
                  padding:'1px 4px', borderRadius:'3px',
                }}>
                  {user?.role}
                </div>
              </div>
              <i className="ti ti-chevron-down" style={{
                fontSize:'12px', color:'rgba(212,175,55,0.5)',
                transform: dropdownOpen
                  ? 'rotate(180deg)' : 'rotate(0)',
                transition:'transform 0.2s', flexShrink:0,
              }} />
            </div>

            {/* DROPDOWN USER */}
            {dropdownOpen && (
              <div style={{
                position:'absolute', top:'calc(100% + 10px)',
                right:0, width:'220px', background:'#111',
                border:'1px solid rgba(212,175,55,0.2)',
                borderRadius:'12px', overflow:'hidden',
                boxShadow:'0 16px 40px rgba(0,0,0,0.4)',
                zIndex:400, animation:'fadeIn 0.18s ease',
                maxWidth:'90vw',
              }}>
                <div style={{
                  padding:'14px 16px',
                  background:'rgba(212,175,55,0.06)',
                  borderBottom:'1px solid rgba(212,175,55,0.12)',
                }}>
                  <div style={{
                    fontSize:'13px', fontWeight:700, color:'#fff'
                  }}>
                    {user?.prenom} {user?.nom}
                  </div>
                  <div style={{
                    fontSize:'11px',
                    color:'rgba(255,255,255,0.35)', marginTop:'2px'
                  }}>
                    {user?.email}
                  </div>
                  <div style={{
                    display:'inline-block', marginTop:'5px',
                    fontSize:'9px', fontWeight:700,
                    color:'var(--primary)',
                    background:'rgba(212,175,55,0.12)',
                    padding:'2px 7px', borderRadius:'4px',
                  }}>
                    {user?.role}
                  </div>
                </div>

                {hasRole('ADMIN') && (
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      setDrawerOpen(true);
                    }}
                    style={{
                      display:'flex', alignItems:'center',
                      gap:'10px', padding:'10px 16px',
                      cursor:'pointer',
                      color:'rgba(255,255,255,0.5)',
                      fontSize:'12.5px', fontWeight:500,
                      background:'none', border:'none',
                      width:'100%', textAlign:'left',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background =
                        'rgba(212,175,55,0.06)';
                      e.currentTarget.style.color =
                        'var(--primary)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'none';
                      e.currentTarget.style.color =
                        'rgba(255,255,255,0.5)';
                    }}>
                    <i className="ti ti-settings"
                      style={{ fontSize:'15px' }} />
                    Paramètres
                  </button>
                )}

                <div style={{
                  height:'1px',
                  background:'rgba(212,175,55,0.1)',
                  margin:'4px 0'
                }} />

                <button
                  onClick={handleLogout}
                  style={{
                    display:'flex', alignItems:'center',
                    gap:'10px', padding:'10px 16px',
                    cursor:'pointer', color:'#e53935',
                    fontSize:'12.5px', fontWeight:600,
                    background:'none', border:'none',
                    width:'100%', textAlign:'left',
                  }}
                  onMouseEnter={e =>
                    e.currentTarget.style.background =
                      'rgba(229,57,53,0.08)'}
                  onMouseLeave={e =>
                    e.currentTarget.style.background = 'none'}
                >
                  <i className="ti ti-logout"
                    style={{ fontSize:'15px' }} />
                  Se déconnecter
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* MENU MOBILE — dropdown plein écran */}
      {mobileMenuOpen && (
        <div className="navbar-mobile-menu" style={{
          position:'fixed', top:'64px', left:0, right:0,
          bottom:0, background:'var(--noir)',
          zIndex:299, overflowY:'auto',
          borderTop:'1px solid rgba(212,175,55,0.15)',
          padding:'12px',
        }}>
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                display:'flex', alignItems:'center', gap:'14px',
                padding:'14px 16px',
                color: isActive(link.path)
                  ? 'var(--primary)'
                  : 'rgba(255,255,255,0.7)',
                background: isActive(link.path)
                  ? 'rgba(212,175,55,0.08)'
                  : 'transparent',
                fontSize:'14px', fontWeight:600,
                textDecoration:'none',
                borderRadius:'10px',
                marginBottom:'4px',
                borderLeft: isActive(link.path)
                  ? '3px solid var(--primary)'
                  : '3px solid transparent',
              }}
            >
              <i className={`ti ${link.icon}`}
                style={{ fontSize:'20px', width:'24px' }} />
              {link.label}
            </Link>
          ))}
        </div>
      )}

      <ParametresDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      <style>{`
        @keyframes fadeIn {
          from { opacity:0; transform:translateY(-6px); }
          to { opacity:1; transform:translateY(0); }
        }

        @media (max-width: 900px) {
          .navbar-links-desktop {
            display: none !important;
          }
          .navbar-hamburger {
            display: flex !important;
          }
          .navbar-separator {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .navbar-user-info {
            display: none;
          }
        }
      `}</style>
    </>
  );
};

export default Navbar;
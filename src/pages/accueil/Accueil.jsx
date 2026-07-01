import { useNavigate } from 'react-router-dom';
import './Accueil.css';

const Accueil = () => {
  const navigate = useNavigate();

  const scrollToDecouvrir = () => {
    document.getElementById('decouvrir')?.scrollIntoView({
      behavior: 'smooth'
    });
  };

  return (
    <div className="accueil-page">
      <div className="accueil-bg-glow" />

      <div className="accueil-content">

        {/* HEADER */}
        <div className="accueil-header">
          <div className="accueil-logo">
            <div className="accueil-logo-box">
              <span>K</span>
            </div>
            <span className="accueil-logo-text">Kandiou's Fashion</span>
          </div>
          <div className="accueil-location">
            <i className="ti ti-map-pin" />
            Conakry, Guinée
          </div>
        </div>

        {/* HERO */}
        <div className="accueil-hero-content">

          <div className="accueil-hero-text">
            <div className="accueil-kicker">
              <span className="accueil-kicker-line" />
              Conakry — Depuis l'essentiel
            </div>
            <h1 className="accueil-title">
              L'élégance n'est<br />
              jamais <span>un hasard</span>
            </h1>
            <p className="accueil-desc">
              Chez Kandiou's Fashion, chaque pièce est choisie avec soin
              pour sublimer la femme moderne. Découvrez l'espace qui
              orchestre cette expérience.
            </p>

            <div className="accueil-actions">
              <button
                className="accueil-btn-primary"
                onClick={() => navigate('/login')}
              >
                <i className="ti ti-login-2" />
                Accéder à mon espace
              </button>
              <button
                className="accueil-btn-secondary"
                onClick={scrollToDecouvrir}
              >
                Découvrir la maison
                <i className="ti ti-arrow-down" />
              </button>
            </div>
          </div>

          <div className="accueil-hero-visual">
            <div className="accueil-frame-ring" />
            <div className="accueil-frame-deco" />
            <div className="accueil-frame">
              <img
                src="https://i.pinimg.com/originals/64/34/d2/6434d2dd67b35d2723446ca2c9db0bc3.jpg"
                alt="Kandiou's Fashion"
              />
              <div className="accueil-frame-overlay" />
            </div>
            <div className="accueil-badge accueil-badge-top">
              <div className="accueil-badge-number">3</div>
              <div className="accueil-badge-label">niveaux fidélité</div>
            </div>
            <div className="accueil-badge accueil-badge-bottom">
              <i className="ti ti-qrcode" />
              <span>Facture vérifiable</span>
            </div>
          </div>

        </div>

        <div className="accueil-separator" />

        {/* DÉCOUVRIR */}
        <div id="decouvrir" className="accueil-decouvrir">

          <div className="accueil-decouvrir-top">

            <div>
              <div className="accueil-kicker">
                <span className="accueil-kicker-line" />
                Notre histoire
              </div>
              <h2 className="accueil-h2-histoire">
                Née à Conakry, pensée pour la femme guinéenne
              </h2>
              <p className="accueil-text">
                Kandiou's Fashion est née d'une conviction simple : la
                femme moderne mérite des pièces choisies avec exigence,
                sans compromis sur le style ni sur le service.
              </p>
            </div>

            <div>
              <div className="accueil-kicker">
                <span className="accueil-kicker-line" />
                Nos valeurs
              </div>
              <div className="accueil-valeurs-list">
                <div className="accueil-valeur-item">
                  <i className="ti ti-sparkles" />
                  <div>
                    <div className="accueil-valeur-titre">Élégance</div>
                    <div className="accueil-valeur-desc">
                      Des pièces qui subliment chaque silhouette.
                    </div>
                  </div>
                </div>
                <div className="accueil-valeur-item">
                  <i className="ti ti-diamond" />
                  <div>
                    <div className="accueil-valeur-titre">Qualité</div>
                    <div className="accueil-valeur-desc">
                      Sélection rigoureuse de chaque article.
                    </div>
                  </div>
                </div>
                <div className="accueil-valeur-item">
                  <i className="ti ti-crown" />
                  <div>
                    <div className="accueil-valeur-titre">Exclusivité</div>
                    <div className="accueil-valeur-desc">
                      Collections limitées, clientes uniques.
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className="accueil-pourquoi-titre">
            <h2>
              Ce que vous <span>gagnez</span> en venant chez nous
            </h2>
          </div>

          <div className="accueil-cards">

            <div className="accueil-card">
              <i className="ti ti-hanger" />
              <div className="accueil-card-titre">Robes et tenues</div>
              <div className="accueil-card-desc">
                Voiles, ensembles et jeans.
              </div>
            </div>

            <div className="accueil-card">
              <i className="ti ti-medal" />
              <div className="accueil-card-titre">Fidélité récompensée</div>
              <div className="accueil-card-desc">
                VIP, Gold et Silver.
              </div>
            </div>

            <div className="accueil-card">
              <i className="ti ti-receipt" />
              <div className="accueil-card-titre">Achat en confiance</div>
              <div className="accueil-card-desc">
                Facture PDF avec QR code.
              </div>
            </div>

            <div className="accueil-card accueil-card-galerie">
              <div className="accueil-card-tag">Aperçu</div>
              <div className="accueil-card-titre">Notre collection</div>
              <div className="accueil-galerie-grid">
                <img src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=140&q=70" alt="Robe" />
                <img src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=140&q=70" alt="Voile" />
                <img src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=140&q=70" alt="Sac" />
                <img src="https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=140&q=70" alt="Chaussures" />
              </div>
            </div>

          </div>

        </div>

        {/* FOOTER */}
        <div className="accueil-footer">
          KANDIOU'S Fashion © 2026 — Conakry, Guinée
        </div>

      </div>
    </div>
  );
};

export default Accueil;
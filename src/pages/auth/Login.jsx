import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/auth/login', {
        email,
        motDePasse
      });

      const { token, ...userData } = response.data;
      login(userData, token);
      toast.success(`Bienvenue ${userData.prenom} !`);
      navigate('/dashboard');

    } catch (error) {
      const message = error.response?.data?.message
        || 'Email ou mot de passe incorrect';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg-glow" />

      <div className="login-content">

        <div className="login-header">
          <div className="login-logo">
            <div className="login-logo-box">
              <span>K</span>
            </div>
            <span className="login-logo-text">Kandiou's Fashion</span>
          </div>
          <div className="login-location">
            <i className="ti ti-map-pin" />
            Conakry, Guinée
          </div>
        </div>

        <div className="login-center">
          <div className="login-card">

            <div className="login-card-deco" />

            <div className="login-card-header">
              <div className="login-card-logo">
                <i className="ti ti-building-store" />
              </div>
              <h1>
                KANDIOU'<span>S</span> Fashion
              </h1>
              <p>
                <i className="ti ti-hanger" />
                Système de gestion de boutique
              </p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label>
                  <i className="ti ti-mail" />
                  Email
                </label>
                <div className="input-wrapper">
                  <i className="ti ti-at input-icon" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Entrez votre email"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>
                  <i className="ti ti-lock" />
                  Mot de passe
                </label>
                <div className="input-wrapper">
                  <i className="ti ti-key input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={motDePasse}
                    onChange={(e) => setMotDePasse(e.target.value)}
                    placeholder="Entrez votre mot de passe"
                    required
                    style={{ paddingRight: '42px' }}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    <i className={`ti ${showPassword ? 'ti-eye-off' : 'ti-eye'}`} />
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="login-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <i className="ti ti-loader-2" />
                    Connexion...
                  </>
                ) : (
                  <>
                    <i className="ti ti-login-2" />
                    Se connecter
                  </>
                )}
              </button>
            </form>

            <button
              className="login-back"
              onClick={() => navigate('/')}
            >
              <i className="ti ti-arrow-left" />
              Retour à l'accueil
            </button>

          </div>
        </div>

        <div className="login-footer">
          KANDIOU'S Fashion © 2026 — Conakry, Guinée
        </div>

      </div>
    </div>
  );
};

export default Login;
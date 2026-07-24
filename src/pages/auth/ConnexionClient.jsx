import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';

const ConnexionClient = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', motDePasse: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/client-auth/login', form);
      localStorage.setItem('clientToken', response.data.token);
      localStorage.setItem('clientUser', JSON.stringify(response.data));
      toast.success(`Bienvenue ${response.data.prenom} !`);
      navigate('/mon-compte');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      backgroundImage: `radial-gradient(circle at 15% 15%, rgba(212,175,55,0.12) 0%, transparent 35%),
                         radial-gradient(circle at 85% 75%, rgba(212,175,55,0.10) 0%, transparent 40%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px 16px', fontFamily: 'Inter, sans-serif',
    }}>
      <div style={{
        width: '100%', maxWidth: '420px',
        background: 'linear-gradient(160deg, rgba(212,175,55,0.06), rgba(20,20,20,0.9))',
        border: '1px solid rgba(212,175,55,0.25)',
        borderRadius: '18px',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      }}>
        {/* Header */}
        <div style={{ padding: '32px 24px 22px', textAlign: 'center' }}>
          <div style={{
            width: '52px', height: '52px', margin: '0 auto 14px',
            border: '1.5px solid #d4af37', borderRadius: '9px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(212,175,55,0.08)',
          }}>
            <span style={{
              fontFamily: 'Playfair Display, serif', fontSize: '26px',
              fontWeight: 900, color: '#d4af37', fontStyle: 'italic',
            }}>K</span>
          </div>
          <h1 style={{
            fontFamily: 'Playfair Display, serif', fontSize: '22px',
            fontWeight: 700, color: '#fff', margin: 0,
          }}>
            KANDIOU'S <span style={{ color: '#d4af37', fontStyle: 'italic' }}>Fashion</span>
          </h1>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', marginTop: '6px', letterSpacing: '1px', textTransform: 'uppercase' }}>
            Espace Client
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} style={{ padding: '8px 24px 28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <div>
            <label style={labelStyle}>Email</label>
            <input
              type="email" style={inputStyle} required value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="vous@exemple.com"
            />
          </div>

          <div>
            <label style={labelStyle}>Mot de passe</label>
            <input
              type="password" style={inputStyle} required value={form.motDePasse}
              onChange={e => setForm({ ...form, motDePasse: e.target.value })}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '6px', padding: '13px',
              background: loading ? '#555' : 'linear-gradient(135deg, #e8c659, #d4af37, #b8960c)',
              color: '#0d0d0d', border: 'none', borderRadius: '10px',
              fontSize: '13px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 10px 26px rgba(212,175,55,0.3)',
              transition: 'all 0.25s',
            }}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>

          <p style={{ textAlign: 'center', fontSize: '12.5px', color: 'rgba(255,255,255,0.45)', marginTop: '4px' }}>
            Pas encore de compte ?{' '}
            <Link to="/inscription-client" style={{ color: '#d4af37', fontWeight: 600, textDecoration: 'none' }}>
              S'inscrire
            </Link>
          </p>

          <Link
            to="/"
            style={{
              textAlign: 'center', fontSize: '11.5px',
              color: 'rgba(255,255,255,0.35)', textDecoration: 'none',
              marginTop: '4px',
            }}
          >
            ← Retour à l'accueil
          </Link>
        </form>
      </div>
    </div>
  );
};

const labelStyle = {
  display: 'block', fontSize: '10.5px', fontWeight: 700,
  color: 'rgba(212,175,55,0.85)', marginBottom: '6px',
  textTransform: 'uppercase', letterSpacing: '0.8px',
};

const inputStyle = {
  width: '100%', padding: '12px 14px',
  border: '1.5px solid rgba(212,175,55,0.2)',
  borderRadius: '9px', fontSize: '14px', outline: 'none',
  fontFamily: 'inherit', boxSizing: 'border-box',
  background: 'rgba(255,255,255,0.04)', color: '#fff',
};

export default ConnexionClient;
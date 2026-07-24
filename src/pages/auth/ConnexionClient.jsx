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
      minHeight: '100vh', background: 'var(--creme, #f5f0eb)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px 16px',
    }}>
      <div style={{
        width: '100%', maxWidth: '420px',
        background: '#fff', borderRadius: '18px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
        overflow: 'hidden',
      }}>
        {/* Header doré */}
        <div style={{
          background: '#0d0d0d', padding: '32px 24px 26px',
          textAlign: 'center',
        }}>
          <div style={{
            width: '52px', height: '52px', margin: '0 auto 14px',
            border: '1.5px solid #d4af37', borderRadius: '6px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
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
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '6px' }}>
            Connectez-vous à votre espace
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} style={{ padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

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
              background: loading ? '#ccc' : '#0d0d0d',
              color: '#d4af37', border: 'none', borderRadius: '10px',
              fontSize: '14px', fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>

          <p style={{ textAlign: 'center', fontSize: '13px', color: '#666', marginTop: '4px' }}>
            Pas encore de compte ?{' '}
            <Link to="/inscription-client" style={{ color: '#b8960c', fontWeight: 600, textDecoration: 'none' }}>
              S'inscrire
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

const labelStyle = {
  display: 'block', fontSize: '11px', fontWeight: 700,
  color: '#555', marginBottom: '5px', textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const inputStyle = {
  width: '100%', padding: '12px 14px', border: '1.5px solid #ede8df',
  borderRadius: '9px', fontSize: '14px', outline: 'none',
  fontFamily: 'inherit', boxSizing: 'border-box',
};

export default ConnexionClient;
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';

const InscriptionClient = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nom: '', prenom: '', email: '', motDePasse: '',
    confirmMotDePasse: '', telephone: '', adresse: '',
  });

  const criteres = {
    longueur: form.motDePasse.length >= 8,
    majuscule: /[A-Z]/.test(form.motDePasse),
    minuscule: /[a-z]/.test(form.motDePasse),
    chiffre: /[0-9]/.test(form.motDePasse),
  };
  const tousCriteresOk = Object.values(criteres).every(Boolean);
  const motsDePasseIdentiques = form.motDePasse === form.confirmMotDePasse
    && form.confirmMotDePasse.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!tousCriteresOk) {
      toast.error('Le mot de passe ne respecte pas tous les critères');
      return;
    }
    if (!motsDePasseIdentiques) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);
    try {
      await api.post('/client-auth/inscription', {
        nom: form.nom,
        prenom: form.prenom,
        email: form.email,
        motDePasse: form.motDePasse,
        telephone: form.telephone,
        adresse: form.adresse,
      });
      toast.success('Compte créé ! Vérifiez votre email pour l\'activer.');
      navigate('/connexion-client');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'inscription');
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
        width: '100%', maxWidth: '440px',
        background: 'linear-gradient(160deg, rgba(212,175,55,0.06), rgba(20,20,20,0.9))',
        border: '1px solid rgba(212,175,55,0.25)',
        borderRadius: '18px',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      }}>
        <div style={{ padding: '28px 24px 18px', textAlign: 'center' }}>
          <div style={{
            width: '48px', height: '48px', margin: '0 auto 12px',
            border: '1.5px solid #d4af37', borderRadius: '9px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(212,175,55,0.08)',
          }}>
            <span style={{
              fontFamily: 'Playfair Display, serif', fontSize: '24px',
              fontWeight: 900, color: '#d4af37', fontStyle: 'italic',
            }}>K</span>
          </div>
          <h1 style={{
            fontFamily: 'Playfair Display, serif', fontSize: '20px',
            fontWeight: 700, color: '#fff', margin: 0,
          }}>
            Créer un compte
          </h1>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', marginTop: '4px', letterSpacing: '1px', textTransform: 'uppercase' }}>
            Rejoignez KANDIOU'S Fashion
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '8px 24px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={labelStyle}>Nom *</label>
              <input
                style={inputStyle} required value={form.nom}
                onChange={e => setForm({ ...form, nom: e.target.value })}
              />
            </div>
            <div>
              <label style={labelStyle}>Prénom</label>
              <input
                style={inputStyle} value={form.prenom}
                onChange={e => setForm({ ...form, prenom: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Email *</label>
            <input
              type="email" style={inputStyle} required value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div>
            <label style={labelStyle}>Téléphone</label>
            <input
              style={inputStyle} value={form.telephone}
              onChange={e => setForm({ ...form, telephone: e.target.value })}
              placeholder="+224 6XX XXX XXX"
            />
          </div>

          <div>
            <label style={labelStyle}>Adresse</label>
            <input
              style={inputStyle} value={form.adresse}
              onChange={e => setForm({ ...form, adresse: e.target.value })}
            />
          </div>

          <div>
            <label style={labelStyle}>Mot de passe *</label>
            <input
              type="password" style={inputStyle} required value={form.motDePasse}
              onChange={e => setForm({ ...form, motDePasse: e.target.value })}
            />
            {form.motDePasse.length > 0 && (
              <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <CritereItem ok={criteres.longueur} label="Au moins 8 caractères" />
                <CritereItem ok={criteres.majuscule} label="Une majuscule" />
                <CritereItem ok={criteres.minuscule} label="Une minuscule" />
                <CritereItem ok={criteres.chiffre} label="Un chiffre" />
              </div>
            )}
          </div>

          <div>
            <label style={labelStyle}>Confirmer le mot de passe *</label>
            <input
              type="password" style={inputStyle} required value={form.confirmMotDePasse}
              onChange={e => setForm({ ...form, confirmMotDePasse: e.target.value })}
            />
            {form.confirmMotDePasse.length > 0 && !motsDePasseIdentiques && (
              <p style={{ fontSize: '11px', color: '#e57373', marginTop: '4px' }}>
                Les mots de passe ne correspondent pas
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !tousCriteresOk || !motsDePasseIdentiques}
            style={{
              marginTop: '8px', padding: '13px',
              background: (loading || !tousCriteresOk || !motsDePasseIdentiques)
                ? '#444'
                : 'linear-gradient(135deg, #e8c659, #d4af37, #b8960c)',
              color: '#0d0d0d', border: 'none', borderRadius: '10px',
              fontSize: '13px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase',
              cursor: (loading || !tousCriteresOk || !motsDePasseIdentiques) ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {loading ? 'Création en cours...' : 'Créer mon compte'}
          </button>

          <p style={{ textAlign: 'center', fontSize: '12.5px', color: 'rgba(255,255,255,0.45)', marginTop: '4px' }}>
            Déjà un compte ?{' '}
            <Link to="/connexion-client" style={{ color: '#d4af37', fontWeight: 600, textDecoration: 'none' }}>
              Se connecter
            </Link>
          </p>

          <Link
            to="/"
            style={{
              textAlign: 'center', fontSize: '11.5px',
              color: 'rgba(255,255,255,0.35)', textDecoration: 'none',
            }}
          >
            ← Retour à l'accueil
          </Link>
        </form>
      </div>
    </div>
  );
};

const CritereItem = ({ ok, label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: ok ? '#81c784' : 'rgba(255,255,255,0.35)' }}>
    <span>{ok ? '✓' : '○'}</span>
    {label}
  </div>
);

const labelStyle = {
  display: 'block', fontSize: '10.5px', fontWeight: 700,
  color: 'rgba(212,175,55,0.85)', marginBottom: '6px',
  textTransform: 'uppercase', letterSpacing: '0.8px',
};

const inputStyle = {
  width: '100%', padding: '11px 13px',
  border: '1.5px solid rgba(212,175,55,0.2)',
  borderRadius: '9px', fontSize: '14px', outline: 'none',
  fontFamily: 'inherit', boxSizing: 'border-box',
  background: 'rgba(255,255,255,0.04)', color: '#fff',
};

export default InscriptionClient;
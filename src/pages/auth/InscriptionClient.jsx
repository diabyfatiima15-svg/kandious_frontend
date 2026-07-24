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

  // Critères de force du mot de passe
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
      minHeight: '100vh', background: 'var(--creme, #f5f0eb)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px 16px',
    }}>
      <div style={{
        width: '100%', maxWidth: '440px',
        background: '#fff', borderRadius: '18px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
        overflow: 'hidden',
      }}>
        {/* Header doré */}
        <div style={{
          background: '#0d0d0d', padding: '28px 24px 22px',
          textAlign: 'center',
        }}>
          <div style={{
            width: '48px', height: '48px', margin: '0 auto 12px',
            border: '1.5px solid #d4af37', borderRadius: '6px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
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
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
            Rejoignez KANDIOU'S Fashion
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

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
            {/* Indicateur de force */}
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
              <p style={{ fontSize: '11px', color: '#c62828', marginTop: '4px' }}>
                Les mots de passe ne correspondent pas
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !tousCriteresOk || !motsDePasseIdentiques}
            style={{
              marginTop: '8px', padding: '13px',
              background: (loading || !tousCriteresOk || !motsDePasseIdentiques) ? '#ccc' : '#0d0d0d',
              color: '#d4af37', border: 'none', borderRadius: '10px',
              fontSize: '14px', fontWeight: 700,
              cursor: (loading || !tousCriteresOk || !motsDePasseIdentiques) ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {loading ? 'Création en cours...' : 'Créer mon compte'}
          </button>

          <p style={{ textAlign: 'center', fontSize: '13px', color: '#666', marginTop: '4px' }}>
            Déjà un compte ?{' '}
            <Link to="/connexion-client" style={{ color: '#b8960c', fontWeight: 600, textDecoration: 'none' }}>
              Se connecter
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

const CritereItem = ({ ok, label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: ok ? '#2e7d32' : '#999' }}>
    <span>{ok ? '✓' : '○'}</span>
    {label}
  </div>
);

const labelStyle = {
  display: 'block', fontSize: '11px', fontWeight: 700,
  color: '#555', marginBottom: '5px', textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const inputStyle = {
  width: '100%', padding: '11px 13px', border: '1.5px solid #ede8df',
  borderRadius: '9px', fontSize: '14px', outline: 'none',
  fontFamily: 'inherit', boxSizing: 'border-box',
};

export default InscriptionClient;
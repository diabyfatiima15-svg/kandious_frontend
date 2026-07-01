import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect,useRef } from 'react';
import { loadSavedTheme } from './themes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import Produits from './pages/produits/Produits';
import Clients from './pages/clients/Clients';
import Ventes from './pages/ventes/Ventes';
import Achats from './pages/achats/Achats';
import Factures from './pages/factures/Factures';
import Utilisateurs from './pages/utilisateurs/Utilisateurs';
import Parametres from './pages/parametres/Parametres';
import Historique from './pages/historique/Historique';
import Fournisseurs from './pages/fournisseurs/Fournisseurs';
import Categories from './pages/categories/Categories';

import Accueil from './pages/accueil/Accueil';

// Route protégée — redirige vers l'accueil si non connecté
const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, hasAnyRole } = useAuth();

  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  if (roles && !hasAnyRole(...roles)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AppRoutes = () => {
  
  const { isAuthenticated } = useAuth();

       const location = useLocation();
  const wasAuthenticated = useRef(false);

  useEffect(() => {
    if (isAuthenticated()) {
      wasAuthenticated.current = true;
    } else if (wasAuthenticated.current) {
      // L'utilisateur vient de se déconnecter
      window.history.pushState(null, '', '/');
      wasAuthenticated.current = false;
    }
  }, [isAuthenticated, location]);

  return (
    <Routes>
      {/* Route publique — accueil */}
      <Route
        path="/"
        element={!isAuthenticated()
          ? <Accueil />
          : <Navigate to="/dashboard" replace />}
      />

      {/* Route publique — login */}
      <Route
        path="/login"
        element={!isAuthenticated()
          ? <Login />
          : <Navigate to="/dashboard" replace />}
      />

      {/* Routes protégées */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />

      <Route path="/produits" element={
        <ProtectedRoute roles={['ADMIN', 'VENDEUR']}>
          <Produits />
        </ProtectedRoute>
      } />

      <Route path="/clients" element={
        <ProtectedRoute roles={['ADMIN', 'VENDEUR', 'CAISSIER']}>
          <Clients />
        </ProtectedRoute>
      } />

      <Route path="/ventes" element={
        <ProtectedRoute roles={['ADMIN', 'CAISSIER']}>
          <Ventes />
        </ProtectedRoute>
      } />

      <Route path="/achats" element={
        <ProtectedRoute roles={['ADMIN', 'VENDEUR']}>
          <Achats />
        </ProtectedRoute>
      } />

      <Route path="/factures" element={
        <ProtectedRoute roles={['ADMIN', 'CAISSIER']}>
          <Factures />
        </ProtectedRoute>
      } />

      <Route path="/utilisateurs" element={
        <ProtectedRoute roles={['ADMIN']}>
          <Utilisateurs />
        </ProtectedRoute>
      } />

      <Route path="/parametres" element={
        <ProtectedRoute roles={['ADMIN']}>
          <Parametres />
        </ProtectedRoute>
      } />

      <Route path="/historique" element={
        <ProtectedRoute roles={['ADMIN']}>
          <Historique />
        </ProtectedRoute>
      } />

      <Route path="/fournisseurs" element={
        <ProtectedRoute roles={['ADMIN']}>
          <Fournisseurs />
        </ProtectedRoute>
      } />
      <Route path="/categories" element={
        <ProtectedRoute roles={['ADMIN']}>
          <Categories />
        </ProtectedRoute>
      } />

      {/* Toute route inconnue → accueil si non connecté,
          dashboard si connecté */}
      <Route path="*" element={
        !isAuthenticated()
          ? <Navigate to="/" replace />
          : <Navigate to="/dashboard" replace />
      } />
    </Routes>
  );
};

function App() {
  useEffect(() => {
    loadSavedTheme();
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
        />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
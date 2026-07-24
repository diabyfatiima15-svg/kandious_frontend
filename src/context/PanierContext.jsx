import { createContext, useContext, useState } from 'react';
import { toast } from 'react-toastify';

const PanierContext = createContext();

export const usePanier = () => useContext(PanierContext);

export const PanierProvider = ({ children }) => {
  const [articles, setArticles] = useState([]);

  const ajouterAuPanier = (produit) => {
    setArticles(prev => {
      const existant = prev.find(a => a.produitId === produit.id);
      if (existant) {
        return prev.map(a =>
          a.produitId === produit.id
            ? { ...a, quantite: a.quantite + 1 }
            : a
        );
      }
      return [...prev, {
        produitId: produit.id,
        nom: produit.nom,
        prixVente: produit.prixVente,
        photo: produit.photo,
        categorie: produit.categorie?.nom,
        quantite: 1,
      }];
    });
    toast.success(`${produit.nom} ajouté au panier`);
  };

  const modifierQuantite = (produitId, nouvelleQuantite) => {
    if (nouvelleQuantite <= 0) {
      retirerDuPanier(produitId);
      return;
    }
    setArticles(prev => prev.map(a =>
      a.produitId === produitId ? { ...a, quantite: nouvelleQuantite } : a
    ));
  };

  const retirerDuPanier = (produitId) => {
    setArticles(prev => prev.filter(a => a.produitId !== produitId));
  };

  const viderPanier = () => setArticles([]);

  const totalArticles = articles.reduce((sum, a) => sum + a.quantite, 0);
  const totalMontant = articles.reduce((sum, a) => sum + (a.prixVente * a.quantite), 0);

  return (
    <PanierContext.Provider value={{
      articles, ajouterAuPanier, modifierQuantite,
      retirerDuPanier, viderPanier, totalArticles, totalMontant,
    }}>
      {children}
    </PanierContext.Provider>
  );
};
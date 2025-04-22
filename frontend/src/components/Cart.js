import React, { useEffect, useState } from 'react';
import { formatDateTime, getCart } from '../services/cartService';


const Cart = () => {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);

        // Utiliser la fonction getCart du cartService
        const fetchedCart = await getCart();
        console.log('Panier récupéré :', fetchedCart);
        setCart(fetchedCart);
      } catch (error) {
        console.error('Erreur lors de la récupération du panier :', error);
        setCart({ items: [] }); // En cas d'erreur, afficher un panier vide
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  const handleUpdateCartItem = (representationId, newQuantity) => {
    try {
      const localCart = { ...cart };
      const itemIndex = localCart.items.findIndex((item) => item.representationId === representationId);

      if (itemIndex !== -1) {
        if (newQuantity > 0) {
          // Mettre à jour la quantité
          localCart.items[itemIndex].quantity = newQuantity;
        } else {
          // Supprimer l'article si la quantité est 0
          localCart.items.splice(itemIndex, 1);
        }
      }

      // Sauvegarder dans le localStorage
      localStorage.setItem('cart', JSON.stringify(localCart));
      setCart(localCart); // Mettre à jour l'état local
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'article :', error);
    }
  };

  const handleRemoveFromCart = (representationId) => {
    try {
      const localCart = { ...cart };
      // Supprimer complètement l'article du panier
      localCart.items = localCart.items.filter((item) => item.representationId !== representationId);

      // Sauvegarder dans le localStorage
      localStorage.setItem('cart', JSON.stringify(localCart));

      // Mettre à jour l'état local pour refléter la suppression
      setCart(localCart);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'article du panier :', error);
    }
  };

  if (loading) return <p>Chargement du panier...</p>;

  return (
    <div>
      <h1>Votre panier</h1>
      {cart.items && cart.items.length === 0 ? (
        <p>Votre panier est vide.</p>
      ) : (
        <ul className="list-group">
 {cart.items.map((item, index) => {
  // Vérification de la structure des données
  if (!item.representationId || typeof item.quantity !== 'number') {
    console.warn('Article invalide dans le panier :', item);
    return (
      <li key={`invalid-item-${index}`} className="list-group-item text-danger">
        Article invalide dans le panier
      </li>
    );
  }

  return (
    <li
      key={item.representationId} // Utiliser representationId comme clé unique
      className="list-group-item d-flex justify-content-between align-items-center"
    >
      <div>
        <h5>{item.title || 'Titre indisponible'}</h5>
        <p>Date : {item.schedule ? formatDateTime(item.schedule) : 'Date inconnue'}</p>
        <p>Quantité : {item.quantity}</p>
      </div>
      <div>
        <button
          className="btn btn-sm btn-primary me-2"
          onClick={() => handleUpdateCartItem(item.representationId, item.quantity + 1)}
        >
          +
        </button>
        <button
          className="btn btn-sm btn-secondary me-2"
          onClick={() => handleUpdateCartItem(item.representationId, item.quantity - 1)}
          disabled={item.quantity <= 1}
        >
          -
        </button>
        <button
          className="btn btn-sm btn-danger"
          onClick={() => handleRemoveFromCart(item.representationId)}
        >
          Supprimer
        </button>
      </div>
    </li>
  );
})}
</ul>
      )}
    </div>
  );
};

export default Cart;
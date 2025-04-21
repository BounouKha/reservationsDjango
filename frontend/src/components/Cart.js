import React, { useEffect, useState } from 'react';
import { getCart, updateCartItem, removeFromCart } from '../services/api';
import { isUserLoggedIn } from '../auth/authService';
import { formatDateTime } from '../services/cartService'; 

const Cart = () => {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
    
        const loggedIn = await isUserLoggedIn();
    
        if (loggedIn) {
          // Si l'utilisateur est connecté, récupérer le panier depuis le backend
          const data = await getCart();
          if (data && data.items) {
            setCart(data);
          } else {
            console.warn("Le panier récupéré depuis le serveur est vide ou invalide.");
            setCart({ items: [] });
          }
        } else {
          // Sinon, récupérer le panier local
          const localCart = JSON.parse(localStorage.getItem('cart')) || { items: [] };
          setCart(localCart);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du panier :', error);
        setCart({ items: [] }); // En cas d'erreur, afficher un panier vide
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  const handleUpdateCartItem = async (cartItemId, quantity) => {
    try {
      const loggedIn = await isUserLoggedIn();

      if (loggedIn) {
        const response = await updateCartItem(cartItemId, quantity);
        alert(response.message);
        const updatedCart = await getCart();
        setCart(updatedCart);
      } else {
        const localCart = { ...cart };
        const itemIndex = localCart.items.findIndex((item) => item.id === cartItemId);
        if (itemIndex !== -1) {
          localCart.items[itemIndex].quantity = quantity;
          localStorage.setItem('cart', JSON.stringify(localCart));
          setCart(localCart);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du panier :', error);
    }
  };

  const handleRemoveFromCart = async (cartItemId) => {
    try {
      const loggedIn = await isUserLoggedIn();

      if (loggedIn) {
        const response = await removeFromCart(cartItemId);
        alert(response.message);
        const updatedCart = await getCart();
        setCart(updatedCart);
      } else {
        const localCart = { ...cart };
        localCart.items = localCart.items.filter((item) => item.id !== cartItemId);
        localStorage.setItem('cart', JSON.stringify(localCart));
        setCart(localCart);
      }
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
          {cart.items.map((item) => (
            <li key={item.representation.id} className="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <h5>{item.representation.show?.title || 'Titre indisponible'}</h5>
                <p>Date : {formatDateTime(item.representation.schedule)}</p> {/* Utilisation de la fonction */}
                <p>Quantité : {item.quantity}</p>
              </div>
              <div>
                <button
                  className="btn btn-sm btn-primary me-2"
                  onClick={() => handleUpdateCartItem(item.representation.id, item.quantity + 1)}
                >
                  +
                </button>
                <button
                  className="btn btn-sm btn-secondary me-2"
                  onClick={() => handleUpdateCartItem(item.representation.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  -
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleRemoveFromCart(item.representation.id)}
                >
                  Supprimer
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Cart;
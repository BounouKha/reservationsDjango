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

        // S'assurer que chaque article a une clé `quantities` qui est un tableau
        const sanitizedCart = {
          ...fetchedCart,
          items: fetchedCart.items.map((item) => ({
            ...item,
            quantities: Array.isArray(item.quantities) ? item.quantities : [],
          })),
        };

        setCart(sanitizedCart);
      } catch (error) {
        console.error('Erreur lors de la récupération du panier :', error);
        setCart({ items: [] }); // En cas d'erreur, afficher un panier vide
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);


  const handleRemoveFromCart = (representationId) => {
    try {
      const updatedCart = {
        ...cart,
        items: cart.items.filter((item) => item.id !== representationId),
      };
  
      // Mettre à jour le localStorage
      localStorage.setItem('cart', JSON.stringify(updatedCart));
  
      // Mettre à jour l'état local
      setCart(updatedCart);
  
      alert('Article supprimé du panier.');
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'article du panier :', error);
    }
  };

  const handleUpdateQuantity = (representationId, type, newCount) => {
    try {
      const localCart = { ...cart };
      const itemIndex = localCart.items.findIndex((item) => item.id === representationId);

      if (itemIndex !== -1) {
        const quantities = localCart.items[itemIndex].quantities;
        const quantityIndex = quantities.findIndex((q) => q.type === type);

        if (quantityIndex !== -1) {
          if (newCount > 0) {
            // Mettre à jour la quantité
            quantities[quantityIndex].count = newCount;
          } else {
            // Supprimer la catégorie si la quantité est 0
            quantities.splice(quantityIndex, 1);
          }
        }

        // Supprimer l'article si toutes les catégories sont vides
        if (quantities.length === 0) {
          localCart.items.splice(itemIndex, 1);
        }
      }

      // Sauvegarder dans le localStorage
      localStorage.setItem('cart', JSON.stringify(localCart));
      setCart(localCart); // Mettre à jour l'état local
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la quantité :', error);
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
            <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <h5>{item.title}</h5>
              <p>Date : {formatDateTime(item.schedule)}</p>
              <p>Lieu : {item.location}</p>
              <h6>Quantités :</h6>
              <ul>
                {Array.isArray(item.quantities) && item.quantities.map((quantity, index) => (
                  <li key={index} className="d-flex justify-content-between align-items-center">
                    <span>
                      {quantity.type} : {quantity.count} x {quantity.price}€ ={' '}
                      {(quantity.count * quantity.price).toFixed(2)}€
                    </span>
                    <div>
                      <button
                        className="btn btn-sm btn-primary me-2"
                        onClick={() =>
                          handleUpdateQuantity(item.id, quantity.type, quantity.count + 1)
                        }
                      >
                        +
                      </button>
                      <button
                        className="btn btn-sm btn-secondary me-2"
                        onClick={() =>
                          handleUpdateQuantity(item.id, quantity.type, quantity.count - 1)
                        }
                        disabled={quantity.count <= 1}
                      >
                        -
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <button
              className="btn btn-sm btn-danger"
              onClick={() => handleRemoveFromCart(item.id)}
            >
              Supprimer
            </button>
          </li>
          ))}
        </ul>
      )}
      <div className="mt-4">
        <h4>
          Total :{' '}
          {cart.items
            .reduce(
              (total, item) =>
                total +
                (Array.isArray(item.quantities)
                  ? item.quantities.reduce(
                      (sum, quantity) => sum + quantity.count * quantity.price,
                      0
                    )
                  : 0),
              0
            )
            .toFixed(2)}
          €
        </h4>
      </div>
    </div>
  );
};

export default Cart;
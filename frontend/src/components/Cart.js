import React, { useEffect, useState } from 'react';
import { formatDateTime } from '../services/cartService';

const Cart = () => {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const userId = JSON.parse(localStorage.getItem('user'))?.id;

        if (!token || !userId) {
          console.error('Utilisateur non connecté.');
          setCart({ items: [] });
          return;
        }

        const response = await fetch(`http://127.0.0.1:8000/accounts/api/user-cart/${userId}/`, {
          method: 'GET',
          headers: {
            Authorization: `Token ${token}`,
          },
        });

        if (response.ok) {
          const fetchedCart = await response.json();
          setCart(fetchedCart);
        } else {
          console.error('Erreur lors de la récupération du panier.');
          setCart({ items: [] });
        }
      } catch (error) {
        console.error('Erreur réseau :', error);
        setCart({ items: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  const handleRemoveFromCart = async (representationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://127.0.0.1:8000/catalogue/api/cart/remove/`, {
        method: 'POST',
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ representationId }),
      });

      if (response.ok) {
        const updatedCart = await response.json();
        setCart(updatedCart);
      } else {
        console.error('Erreur lors de la suppression de l\'article.');
      }
    } catch (error) {
      console.error('Erreur réseau :', error);
    }
  };

  const handleUpdateQuantity = async (representationId, type, newCount) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://127.0.0.1:8000/catalogue/api/cart/update/`, {
        method: 'POST',
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ representationId, type, count: newCount }),
      });

      if (response.ok) {
        const updatedCart = await response.json();
        setCart(updatedCart);
      } else {
        console.error('Erreur lors de la mise à jour de la quantité.');
      }
    } catch (error) {
      console.error('Erreur réseau :', error);
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
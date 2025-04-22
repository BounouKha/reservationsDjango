import { isUserLoggedIn } from '../auth/authService'; // Importer la fonction pour vérifier si l'utilisateur est connecté



const BASE_URL = "http://127.0.0.1:8000/catalogue/api"; //


// Fonction pour formater la date et l'heure
export const formatDateTime = (isoString) => {
  const date = new Date(isoString);
  const formattedDate = date.toLocaleDateString('fr-FR'); // Format de date : JJ/MM/AAAA
  const formattedTime = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }); // Format de l'heure : HH:mm
  return `${formattedDate} à ${formattedTime}`;
};

export const getCart = async () => {
  try {
    const loggedIn = await isUserLoggedIn(); // Vérifier si l'utilisateur est connecté

    if (loggedIn) {
      // Si l'utilisateur est connecté, récupérer le panier depuis le serveur
      const response = await fetch(`${BASE_URL}/cart/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }

      const serverCart = await response.json();
      console.log('Panier récupéré depuis le serveur :', serverCart);

      return { id: serverCart.id, items: serverCart.items };
    } else {
      // Si l'utilisateur n'est pas connecté, utiliser uniquement le panier local
      console.log('Utilisateur non connecté, récupération du panier local.');
      const cart = JSON.parse(localStorage.getItem('cart')) || { items: [] };
      return cart;
    }
  } catch (error) {
    console.warn('Erreur lors de la récupération du panier :', error);
    const cart = JSON.parse(localStorage.getItem('cart')) || { items: [] };
    return cart;
  }
};

// Fonction pour ajouter une représentation au panier
export const addToCart = async (representationId, representationDetails) => {
  const loggedIn = await isUserLoggedIn();

  if (loggedIn) {
    try {
      const response = await fetch(`${BASE_URL}/cart/add/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ representation_id: representationId, quantity: 1 }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to add to cart');
      }

      const data = await response.json();
      console.log('Article ajouté au panier côté serveur :', data);
      return data;
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier côté serveur :', error);
      throw error;
    }
  } else {
    const cart = JSON.parse(localStorage.getItem('cart')) || { items: [] };

    console.log('Ajout au panier local :', { representationId, representationDetails });

    // Vérifier si l'article existe déjà
    const existingItemIndex = cart.items.findIndex((item) => item.representationId === representationId);
    if (existingItemIndex !== -1) {
      cart.items[existingItemIndex].quantity += 1;
    } else {
      cart.items.push({
        representationId, // Inclure l'ID de la représentation
        quantity: 1,
        ...representationDetails, // Inclure les détails de la représentation
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    console.log('Article ajouté au panier local :', cart);
    return { message: 'Article ajouté au panier local.' };
  }
};

// supprimer le panier local
export const clearCart = async () => {
  const response = await fetch(BASE_URL, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to clear cart");
  }
  return response.json();
};

// Fonction pour synchroniser le panier local avec le serveur
export const syncLocalCartWithServer = async () => {
  const cart = JSON.parse(localStorage.getItem('cart')) || {};
  console.log('Synchronisation du panier local avec le serveur :', cart);

  const promises = Object.entries(cart).map(async ([representationId, quantity]) => {
    try {
      await addToCart(parseInt(representationId), quantity); // Ajouter chaque article au serveur
    } catch (error) {
      console.error(`Erreur lors de la synchronisation de l'article ${representationId} :`, error);
    }
  });

  await Promise.all(promises);
  localStorage.removeItem('cart'); // Nettoyer le stockage local après synchronisation
  console.log('Panier local synchronisé avec le serveur.');
};


export const updateCartItem = async (representationId, quantity) => {
  const loggedIn = await isUserLoggedIn(); // Vérifier si l'utilisateur est connecté

  if (loggedIn) {
    // Si l'utilisateur est connecté, synchroniser avec le serveur
    try {
      const response = await fetch(`${BASE_URL}/cart/update/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ representation_id: representationId, quantity }),
        credentials: 'include', // Inclut les cookies pour l'authentification
      });

      if (!response.ok) {
        throw new Error('Failed to update cart item on server');
      }

      const data = await response.json();
      console.log('Article mis à jour dans le panier côté serveur :', data);
      return data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du panier côté serveur :', error);
      throw error;
    }
  } else {
    // Si l'utilisateur n'est pas connecté, mettre à jour le panier local
    const cart = JSON.parse(localStorage.getItem('cart')) || {};
    console.log(JSON.parse(localStorage.getItem('cart')));
    if (quantity > 0) {
      cart[representationId] = quantity; // Mettre à jour la quantité
    } else {
      delete cart[representationId]; // Supprimer l'article si la quantité est 0
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    console.log('Article mis à jour dans le panier local :', cart);
    return { message: 'Article mis à jour dans le panier local.' };
  }
};

export const removeFromCart = async (representationId) => {
  const loggedIn = await isUserLoggedIn(); // Vérifier si l'utilisateur est connecté

  if (loggedIn) {
    // Si l'utilisateur est connecté, synchroniser avec le serveur
    try {
      const response = await fetch(`${BASE_URL}/cart/remove/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ representation_id: representationId }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to remove item from cart on server');
      }

      const data = await response.json();
      console.log('Article supprimé du panier côté serveur :', data);
      return data;
    } catch (error) {
      console.error('Erreur lors de la suppression du panier côté serveur :', error);
      throw error;
    }
  } else {
    // Si l'utilisateur n'est pas connecté, supprimer du panier local
    const cart = JSON.parse(localStorage.getItem('cart')) || {};
    delete cart[representationId];
    localStorage.setItem('cart', JSON.stringify(cart));
    console.log('Article supprimé du panier local :', cart);
    return { message: 'Article supprimé du panier local.' };
  }
};
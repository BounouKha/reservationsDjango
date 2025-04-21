const BASE_URL = 'http://127.0.0.1:8000/catalogue/api'; // URL de base pour votre backend

// Fonction pour récupérer le panier
export const getCart = async () => {
  try {
    const response = await fetch(`${BASE_URL}/cart/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Inclut les cookies pour l'authentification
    });

    if (!response.ok) {
      throw new Error('Failed to fetch cart');
    }

    const data = await response.json();
    console.log('Panier récupéré depuis le serveur :', data);

    // Si le panier du serveur est vide ou invalide, basculer vers le panier local
    if (!data || !data.items || data.items.length === 0) {
      console.warn('Le panier du serveur est vide ou invalide. Utilisation du panier local.');
      const localCart = JSON.parse(localStorage.getItem('cart')) || {};
      console.log('Panier récupéré depuis le stockage local :', localCart);

      // Récupérer toutes les représentations
      const representationsById = await getAllRepresentations();

      // Compléter les informations des articles du panier local
      return {
        items: Object.entries(localCart).map(([representationId, quantity]) => ({
          representation: representationsById[representationId] || {
            id: representationId,
            show: {
              title: 'Titre indisponible',
              description: 'Description indisponible',
            },
            schedule: 'Date indisponible',
          },
          quantity,
        })),
      };
    }

    return data;
  } catch (error) {
    console.warn('Serveur inaccessible, récupération du panier local.');
    // Récupérer depuis Local Storage si le serveur est inaccessible
    const localCart = JSON.parse(localStorage.getItem('cart')) || {};
    console.log('Panier récupéré depuis le stockage local :', localCart);

    // Récupérer toutes les représentations
    const representationsById = await getAllRepresentations();

    // Compléter les informations des articles du panier local
    return {
      items: Object.entries(localCart).map(([representationId, quantity]) => ({
        representation: representationsById[representationId] || {
          id: representationId,
          show: {
            title: 'Titre indisponible',
            description: 'Description indisponible',
          },
          schedule: 'Date indisponible',
        },
        quantity,
      })),
    };
  }
};

// Fonction pour ajouter une représentation au panier
export const addToCart = async (representationId, quantity = 1) => {
  try {
    const response = await fetch(`${BASE_URL}/cart/add/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ representation_id: representationId, quantity }),
      credentials: 'include',
    });

    const data = await response.json();
    console.log('Réponse du serveur :', data);

    if (data.message === 'Representation added to cart in cookies!') {
      // Stocker dans Local Storage si le serveur utilise les cookies
      const cart = JSON.parse(localStorage.getItem('cart')) || {};
      cart[representationId] = (cart[representationId] || 0) + quantity;
      localStorage.setItem('cart', JSON.stringify(cart));
      console.log('Article ajouté au panier local :', cart);
    }

    return data;
  } catch (error) {
    console.warn('Serveur inaccessible, stockage local activé.');
    const cart = JSON.parse(localStorage.getItem('cart')) || {};
    cart[representationId] = (cart[representationId] || 0) + quantity;
    localStorage.setItem('cart', JSON.stringify(cart));
    console.log('Article ajouté au panier local :', cart);
    return { message: 'Article ajouté au panier local.' };
  }
};

// Fonction pour mettre à jour un article dans le panier
export const updateCartItem = async (cartItemId, quantity) => {
  try {
    const response = await fetch(`${BASE_URL}/cart/update/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cart_item_id: cartItemId, quantity }),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to update cart item');
    }

    const data = await response.json();
    console.log('Article mis à jour dans le panier côté serveur :', data);
    return data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du panier :', error);
    throw error;
  }
};

// Fonction pour supprimer un article du panier
export const removeFromCart = async (cartItemId) => {
  try {
    const response = await fetch(`${BASE_URL}/cart/remove/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cart_item_id: cartItemId }),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to remove cart item');
    }

    const data = await response.json();
    console.log('Article supprimé du panier côté serveur :', data);
    return data;
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'article du panier :', error);
    throw error;
  }
};

// Fonction pour synchroniser le panier local avec le serveur
export const syncLocalCartWithServer = async () => {
  const cart = JSON.parse(localStorage.getItem('cart')) || {};
  console.log('Synchronisation du panier local avec le serveur :', cart);

  const promises = Object.entries(cart).map(async ([representationId, quantity]) => {
    try {
      await addToCart(parseInt(representationId), quantity);
    } catch (error) {
      console.error(`Erreur lors de la synchronisation de l'article ${representationId} :`, error);
    }
  });

  await Promise.all(promises);
  localStorage.removeItem('cart'); // Nettoyer le stockage local après synchronisation
  console.log('Panier local synchronisé avec le serveur.');
};


// Fonction pour récupérer toutes les représentations
export const getAllRepresentations = async () => {
  try {
    const response = await fetch(`${BASE_URL}/representations/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch representations');
    }

    const data = await response.json();
    console.log('Représentations récupérées :', data);

    // Convertir la liste en un objet avec l'ID comme clé pour un accès rapide
    const representationsById = data.reduce((acc, representation) => {
      acc[representation.id] = representation;
      return acc;
    }, {});

    return representationsById;
  } catch (error) {
    console.error('Erreur lors de la récupération des représentations :', error);
    return {};
  }
};
const BASE_URL = "http://127.0.0.1:8000/catalogue/api/cart"; // Définir BASE_URL


// Fonction pour formater la date et l'heure
export const formatDateTime = (isoString) => {
  const date = new Date(isoString);
  const formattedDate = date.toLocaleDateString('fr-FR'); // Format de date : JJ/MM/AAAA
  const formattedTime = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }); // Format de l'heure : HH:mm
  return `${formattedDate} à ${formattedTime}`;
};

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

    const serverCart = await response.json();
    console.log('Panier récupéré depuis le serveur :', serverCart);

    // Récupérer les articles du Local Storage
    const localCart = JSON.parse(localStorage.getItem('cart')) || {};
    console.log('Panier récupéré depuis le stockage local :', localCart);

    // Combiner les articles du serveur et du Local Storage
    const combinedItems = [
      ...serverCart.items,
      ...Object.entries(localCart).map(([representationId, quantity]) => ({
        representationId: parseInt(representationId),
        quantity,
      })),
    ];

    return { id: serverCart.id, items: combinedItems };
  } catch (error) {
    console.warn('Serveur inaccessible, récupération du panier local.');
    const cart = JSON.parse(localStorage.getItem('cart')) || {};
    console.log('Panier récupéré depuis le stockage local :', cart);
    return { items: Object.entries(cart).map(([representationId, quantity]) => ({ representationId, quantity })) };
  }
};

// Fonction pour ajouter une représentation au panier
export const addToCart = async (representationId, quantity = 1) => {
  try {
    const response = await fetch(`${BASE_URL}/add/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ representation_id: representationId, quantity }),
      credentials: "include", // Inclut les cookies pour l'authentification
    });

    if (!response.ok) {
      throw new Error("Failed to add to cart");
    }

    const data = await response.json();
    console.log("Article ajouté au panier côté serveur :", data);
    return data;
  } catch (error) {
    console.warn("Serveur inaccessible, stockage local activé.");
    // Stocker dans Local Storage si le serveur est inaccessible
    const cart = JSON.parse(localStorage.getItem("cart")) || {};
    cart[representationId] = (cart[representationId] || 0) + quantity;
    localStorage.setItem("cart", JSON.stringify(cart));
    console.log("Article ajouté au panier local :", cart);
    return { message: "Article ajouté au panier local." };
  }
};

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
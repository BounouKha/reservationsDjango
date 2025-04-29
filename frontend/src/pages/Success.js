import React, { useEffect } from 'react';

const fetchShowIdByTitle = async (title) => {
    try {
        console.log('Titre recherché :', title);

        const response = await fetch(`http://127.0.0.1:8000/catalogue/api/shows/?title=${encodeURIComponent(title)}`);
        if (!response.ok) {
            console.error('Erreur lors de la récupération de l\'ID du spectacle.');
            return null;
        }

        const shows = await response.json();
        const show = shows.results?.find((s) => s.title.toLowerCase() === title.toLowerCase());
        if (show) {
            console.log(`ID trouvé pour le titre "${title}" :`, show.id);
            return show.id;
        } else {
            console.log(`Aucun spectacle trouvé pour le titre "${title}".`);
            return null;
        }
    } catch (error) {
        console.error('Erreur réseau lors de la récupération de l\'ID du spectacle :', error);
        return null;
    }
};

const fetchPrices = async () => {
    try {
        const response = await fetch('http://127.0.0.1:8000/accounts/api/prices/');
        if (!response.ok) {
            console.error('Erreur lors de la récupération des prix.');
            return null;
        }
        const prices = await response.json();
        console.log('Prix récupérés depuis l\'API :', prices);
        return prices;
    } catch (error) {
        console.error('Erreur réseau lors de la récupération des prix :', error);
        return null;
    }
};

const Success = () => {
    useEffect(() => {
        const clearCartAndProcessPayment = async () => {
            try {
                const token = localStorage.getItem('token');
                const userId = JSON.parse(localStorage.getItem('user'))?.id;

                if (!token || !userId) {
                    console.error('Utilisateur non connecté.');
                    return;
                }

                // Étape 0 : Récupérer les prix depuis l'API
                const prices = await fetchPrices();
                if (!prices) {
                    console.error('Impossible de récupérer les prix.');
                    return;
                }

                // Créer un mapping dynamique entre les types de prix et leurs IDs
                const priceTypeToId = prices.reduce((acc, price) => {
                    acc[price.type] = price.id;
                    return acc;
                }, {});
                console.log('Mapping des types de prix vers leurs IDs :', priceTypeToId);

                // Étape 1 : Récupérer les données du panier
                console.log('Récupération des données du panier...');
                const cartResponse = await fetch(`http://127.0.0.1:8000/accounts/api/user-cart/${userId}/`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Token ${token}`,
                    },
                });

                if (!cartResponse.ok) {
                    console.error('Erreur lors de la récupération du panier.');
                    return;
                }

                const cartData = await cartResponse.json();
                console.log('Données du panier récupérées :', cartData);

                if (!cartData.items || cartData.items.length === 0) {
                    console.error('Le panier est vide ou les données sont invalides.');
                    return;
                }

                // Étape 2 : Récupérer les IDs des spectacles et des prix
                const quantities = await Promise.all(
                    cartData.items.map(async (item) => {
                        const showId = await fetchShowIdByTitle(item.title);
                        if (!showId) {
                            console.error(`Impossible de trouver l'ID du spectacle pour le titre : ${item.title}`);
                            return null;
                        }

                        // Convertir price_id en entier à partir du mapping
                        const priceId = priceTypeToId[item.price?.type];
                        if (!priceId) {
                            console.error(`Type de prix invalide : ${item.price?.type}`);
                            return null;
                        }

                        return {
                            representation_id: showId,
                            price_id: priceId,
                            quantity: item.quantity,
                        };
                    })
                );

                // Filtrer les données invalides
                const validQuantities = quantities.filter((q) => q !== null);
                console.log('Données de paiement générées :', validQuantities);

                if (validQuantities.length === 0) {
                    console.error('Aucune donnée valide pour le paiement.');
                    return;
                }

                // Étape 3 : Vider le panier
                const clearCartResponse = await fetch('http://127.0.0.1:8000/accounts/api/clear-cart/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Token ${token}`,
                    },
                });

                if (clearCartResponse.ok) {
                    console.log('Panier vidé avec succès.');
                } else {
                    console.error('Erreur lors de la suppression du panier.');
                }

                // Étape 4 : Envoyer les données du paiement
                const paymentData = { quantities: validQuantities };

                const paymentResponse = await fetch('http://127.0.0.1:8000/accounts/api/payment-success/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Token ${token}`,
                    },
                    body: JSON.stringify(paymentData),
                });

                if (paymentResponse.ok) {
                    const data = await paymentResponse.json();
                    console.log('Paiement traité avec succès :', data);
                } else {
                    console.error('Erreur lors du traitement du paiement.');
                }
            } catch (error) {
                console.error('Erreur réseau :', error);
            }
        };

        clearCartAndProcessPayment();
    }, []); // Assurez-vous que le tableau de dépendances est vide

    return (
        <div className="container mt-5">
            <h1>Paiement réussi !</h1>
            <p>Merci pour votre achat. Votre réservation a été confirmée.</p>
        </div>
    );
};

export default Success;
import React, { useEffect } from 'react';

const Success = () => {
    useEffect(() => {
        const clearCart = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://127.0.0.1:8000/accounts/api/clear-cart/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Token ${token}`,
                    },
                });

                if (response.ok) {
                    console.log('Panier vidé avec succès.');
                } else {
                    console.error('Erreur lors de la suppression du panier.');
                }
            } catch (error) {
                console.error('Erreur réseau :', error);
            }
        };

        clearCart();
    }, []);

    return (
        <div className="container mt-5">
            <h1>Paiement réussi !</h1>
            <p>Merci pour votre achat. Votre panier a été vidé.</p>
        </div>
    );
};

export default Success;
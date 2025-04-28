import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [user, setUser] = useState(null); // État pour stocker les informations utilisateur
  const [reservations, setReservations] = useState([]); // État pour stocker les réservations
  const [loading, setLoading] = useState(true); // État pour gérer le chargement
  const navigate = useNavigate(); // Hook pour la navigation

  useEffect(() => {
    const fetchProfileAndReservations = async () => {
      const token = localStorage.getItem('token'); // Récupérer le token
      const userId = JSON.parse(localStorage.getItem('user'))?.id; // Récupérer l'ID utilisateur depuis localStorage

      if (!token || !userId) {
        console.error('Aucun token ou ID utilisateur trouvé. Redirection vers la page de connexion.');
        navigate('/login'); // Rediriger vers la page de connexion si non connecté
        return;
      }

      try {
        // Récupérer les informations utilisateur
        const userResponse = await fetch(`http://127.0.0.1:8000/catalogue/api/user-meta/${userId}/`, {
          method: 'GET',
          headers: {
            Authorization: `Token ${token}`, // Ajouter le token dans l'en-tête
          },
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData.user); // Mettre à jour les informations utilisateur
        } else {
          console.error('Erreur lors de la récupération des données utilisateur.');
          navigate('/login');
          return;
        }

        // Récupérer les réservations
        const reservationsResponse = await fetch(`http://127.0.0.1:8000/accounts/api/user-reservations/${userId}/`, {
          method: 'GET',
          headers: {
            Authorization: `Token ${token}`, // Ajouter le token dans l'en-tête
          },
        });

        if (reservationsResponse.ok) {
          const reservationsData = await reservationsResponse.json();
          setReservations(reservationsData); // Mettre à jour les réservations
        } else {
          console.error('Erreur lors de la récupération des réservations.');
        }
      } catch (err) {
        console.error('Erreur réseau :', err);
        navigate('/login'); // Rediriger en cas d'erreur réseau
      } finally {
        setLoading(false); // Arrêter le chargement
      }
    };

    fetchProfileAndReservations();
  }, [navigate]);

  if (loading) return <p>Chargement...</p>; // Afficher un message de chargement

  return (
    <div className="container mt-5">
      <h1>Profil</h1>
      {user ? (
        <div>
          <h2>{user.first_name} {user.last_name}</h2>
          <p>Nom d'utilisateur : {user.username}</p>
          <p>Email : {user.email}</p>
          <p>Langue : Français</p> {/* Vous pouvez remplacer par une valeur dynamique si nécessaire */}
        </div>
      ) : (
        <p>Aucune information utilisateur disponible.</p>
      )}

      <h2 className="mt-4">Vos Réservations</h2>
      {reservations.length > 0 ? (
        <ul className="list-group">
          {reservations.map((reservation) => (
            <li key={reservation.id} className="list-group-item">
              <p><strong>Spectacle :</strong> {reservation.title}</p>
              <p><strong>Quantité :</strong> {reservation.quantity} places</p>
              <p><strong>Date de réservation :</strong> {new Date(reservation.booking_date).toLocaleString()}</p>
              <p><strong>Statut :</strong> {reservation.status}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>Vous n'avez aucune réservation.</p>
      )}
    </div>
  );
};

export default Profile;
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [user, setUser] = useState(null); // État pour stocker les informations utilisateur
  const [loading, setLoading] = useState(true); // État pour gérer le chargement
  const navigate = useNavigate(); // Hook pour la navigation

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token'); // Récupérer le token
      const userId = JSON.parse(localStorage.getItem('user'))?.id; // Récupérer l'ID utilisateur depuis localStorage

      if (!token || !userId) {
        console.error('Aucun token ou ID utilisateur trouvé. Redirection vers la page de connexion.');
        navigate('/login'); // Rediriger vers la page de connexion si non connecté
        return;
      }

      try {
        const response = await fetch(`http://127.0.0.1:8000/catalogue/api/user-meta/${userId}/`, {
          method: 'GET',
          headers: {
            Authorization: `Token ${token}`, // Ajouter le token dans l'en-tête
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Données utilisateur reçues :', data); // Log des données utilisateur
          setUser(data.user); // Mettre à jour les informations utilisateur
        } else {
          console.error('Erreur lors de la récupération des données utilisateur.');
          navigate('/login'); // Rediriger si la réponse n'est pas autorisée
        }
      } catch (err) {
        console.error('Erreur réseau :', err);
        navigate('/login'); // Rediriger en cas d'erreur réseau
      } finally {
        setLoading(false); // Arrêter le chargement
      }
    };

    fetchProfile();
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
    </div>
  );
};

export default Profile;
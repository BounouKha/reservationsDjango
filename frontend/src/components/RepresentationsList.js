import React, { useEffect, useState } from 'react';
import '../RepresentationsList.css'; // Importer le fichier CSS pour les animations
import { addToCart } from '../services/cartService'; // Importer le service pour ajouter au panier

// Fonction pour formater la date et l'heure
const formatDateTime = (isoString) => {
  const date = new Date(isoString);
  const formattedDate = date.toLocaleDateString('fr-FR'); // Format de date : JJ/MM/AAAA
  const formattedTime = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }); // Format de l'heure : HH:mm
  return `${formattedDate} à ${formattedTime}`;
};

const RepresentationsList = () => {
  const [representations, setRepresentations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPast, setShowPast] = useState(false); // État pour le filtre "Passés"
  const [selectedRepresentation, setSelectedRepresentation] = useState(null); // Spectacle sélectionné pour le modal
  const [quantities, setQuantities] = useState({}); // État pour les quantités par catégorie

  // Fonction pour gérer l'incrémentation
  const incrementQuantity = (categoryId) => {
    setQuantities((prev) => ({
      ...prev,
      [categoryId]: (prev[categoryId] || 0) + 1,
    }));
  };

  // Fonction pour gérer la décrémentation
  const decrementQuantity = (categoryId) => {
    setQuantities((prev) => ({
      ...prev,
      [categoryId]: Math.max((prev[categoryId] || 0) - 1, 0), // Empêche les valeurs négatives
    }));
  };

  useEffect(() => {
    fetch('http://127.0.0.1:8000/catalogue/api/representations/')
      .then((response) => response.json())
      .then((data) => {
        setRepresentations(data);
        setLoading(false);
      })
      .catch((error) => console.error('Error fetching representations:', error));
  }, []);

  const today = new Date(); // Date actuelle




  const handleAddToCart = async (representationId) => {
    try {
      console.log('Représentation ID :', representationId);
      console.log('Quantités sélectionnées :', quantities);

      const representationDetails = {
        id: representationId,
        title: selectedRepresentation.show?.title || 'Titre indisponible',
        schedule: selectedRepresentation.schedule || 'Date inconnue',
        location: selectedRepresentation.location || 'Lieu inconnu',
        locality: selectedRepresentation.locality || 'Localité inconnue',
        quantities: Object.entries(quantities).map(([type, count]) => ({
          type,
          count,
          price: selectedRepresentation.show.prices.find((price) => price.type === type)?.price || 0,
        })),
      };

      // Vérifier que quantities est bien un tableau
      if (!Array.isArray(representationDetails.quantities)) {
        representationDetails.quantities = [];
      }

      const response = await addToCart(representationId, representationDetails);
      alert(response.message);
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier :', error);
      alert('Impossible d\'ajouter au panier.');
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Filtrer les représentations
  const filteredRepresentations = representations.filter((representation) => {
    const eventDate = new Date(representation.schedule); // Convertir la date en objet Date

    // Afficher les événements passés si "Afficher les passés" est coché
    if (showPast) {
      return eventDate < today; // Afficher uniquement les événements passés
    }

    // Sinon, afficher uniquement les événements à venir
    return eventDate >= today;
  });

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">Representations List</h1>

      {/* Checkbox pour le filtre "Passés" */}
      <div className="form-check mb-4">
        <input
          className="form-check-input"
          type="checkbox"
          id="pastFilter"
          checked={showPast}
          onChange={() => setShowPast(!showPast)} // Inverser l'état du filtre
        />
        <label className="form-check-label" htmlFor="pastFilter">
          Afficher uniquement les événements passés
        </label>
      </div>

      <ul className="list-group">
        {filteredRepresentations.map((representation) => {
          const eventDate = new Date(representation.schedule); // Convertir la date en objet Date
          const isExpired = eventDate < today; // Vérifier si l'événement est expiré

          return (
            <li
              key={representation.id}
              className="list-group-item"
              onClick={() => setSelectedRepresentation(representation)} // Ouvrir le modal avec les détails
              style={{ cursor: 'pointer' }}
            >
              <div>
                <h5 className="mb-1">
                  {representation.show.title}{' '}
                  {isExpired ? (
                    <span className="badge bg-danger">Expiré</span>
                  ) : representation.show.bookable ? (
                    <span className="badge bg-success">Disponible</span>
                  ) : (
                    <span className="badge bg-warning">Non disponible</span>
                  )}
                </h5>
                <p className="mb-0 text-muted">Date: {formatDateTime(representation.schedule)}</p>
                <p className="mb-0 text-muted">Localisation: {representation.location}</p>
                <p className="mb-0 text-muted">Localité: {representation.locality}</p>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Modal pour afficher les détails */}
      {selectedRepresentation && (
        <div
          className="modal fade show d-block custom-modal-animation"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{selectedRepresentation.show.title}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedRepresentation(null)} // Fermer le modal
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <p><strong>Date :</strong> {formatDateTime(selectedRepresentation.schedule)}</p>
                <p><strong>Localisation :</strong> {selectedRepresentation.location}</p>
                <p><strong>Localité :</strong> {selectedRepresentation.locality}</p>
                <p><strong>Spectacle :</strong> {selectedRepresentation.show.title}</p>
                <p><strong>Description :</strong> {selectedRepresentation.show.description}</p>
                <p><strong>Durée :</strong> {selectedRepresentation.show.duration} minutes</p>
                <p>
                  <strong>Artistes :</strong>{' '}
                  {selectedRepresentation.show.artists.length > 0
                    ? selectedRepresentation.show.artists.map(artist => `${artist.firstname} ${artist.lastname}`).join(', ')
                    : 'Aucun artiste disponible'}
                </p>

                {selectedRepresentation.show.bookable ? (
                  <>
                    <h5>Prix disponibles :</h5>
                    {selectedRepresentation.show.prices.map((price, index) => (
                      <div key={index} className="mb-3">
                        <label>
                          {price.type} ({price.price}€) :
                        </label>
                        <div className="d-flex align-items-center">
                          <button
                            type="button"
                            className="btn btn-secondary me-2"
                            onClick={() => decrementQuantity(price.type)}
                          >
                            -
                          </button>
                          <span>{quantities[price.type] || 0}</span>
                          <button
                            type="button"
                            className="btn btn-secondary ms-2"
                            onClick={() => incrementQuantity(price.type)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="btn btn-primary mt-3"
                      onClick={() => handleAddToCart(selectedRepresentation.id)}
                    >
                      Ajouter au panier
                    </button>
                  </>
                ) : (
                  <button type="button" className="btn btn-secondary" disabled>
                    Non réservable
                  </button>
                )}

                <button
                  type="button"
                  className="btn btn-secondary mt-3"
                  onClick={() => setSelectedRepresentation(null)}
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RepresentationsList;
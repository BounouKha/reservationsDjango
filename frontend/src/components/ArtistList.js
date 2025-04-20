import React, { useEffect, useState } from 'react';
import '../ArtistList.css';

const ArtistList = () => {
  const [allArtists, setAllArtists] = useState([]); // Liste complète des artistes
  const [filteredArtists, setFilteredArtists] = useState([]); // Liste filtrée
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [nextPage, setNextPage] = useState(null);
  const [previousPage, setPreviousPage] = useState(null);
  const [searchTerm, setSearchTerm] = useState(''); // Terme de recherche

  // Charger tous les artistes pour la recherche globale
  const fetchAllArtists = () => {
    fetch('http://127.0.0.1:8000/catalogue/api/artists/?all=true')
      .then((response) => response.json())
      .then((data) => {
        setAllArtists(data); // Stocker tous les artistes
        setFilteredArtists(data); // Initialiser la liste filtrée
      })
      .catch((error) => console.error('Error fetching all artists:', error));
  };

  // Charger les artistes paginés pour l'affichage
  const fetchArtists = (page = 1) => {
    setLoading(true);
    fetch(`http://127.0.0.1:8000/catalogue/api/artists/?page=${page}`)
      .then((response) => response.json())
      .then((data) => {
        setFilteredArtists(data.results); // Afficher uniquement les artistes de la page actuelle
        setNextPage(data.next);
        setPreviousPage(data.previous);
        setCurrentPage(page);
        setLoading(false);
      })
      .catch((error) => console.error('Error fetching artists:', error));
  };

  useEffect(() => {
    fetchAllArtists(); // Charger tous les artistes pour la recherche
    fetchArtists(); // Charger les artistes paginés pour l'affichage
  }, []);

  // Fonction pour gérer la recherche
  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);

    // Filtrer les artistes en fonction du prénom ou du nom
    const filtered = allArtists.filter((artist) =>
      artist.firstname.toLowerCase().includes(value) ||
      artist.lastname.toLowerCase().includes(value)
    );
    setFilteredArtists(filtered);
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="artist-list-container">
      <h1>Artist List</h1>
      {/* Barre de recherche */}
      <input
        type="text"
        placeholder="Search artists..."
        value={searchTerm}
        onChange={handleSearch}
        className="search-bar"
      />
      <ul>
        {filteredArtists.map((artist) => (
          <li key={artist.id}>
            <span className="font-medium">{artist.firstname} {artist.lastname}</span>
          </li>
        ))}
      </ul>
      <div className="pagination">
        <button
          onClick={() => fetchArtists(currentPage - 1)}
          disabled={!previousPage}
          className="pagination-button"
        >
          Previous
        </button>
        <span>Page {currentPage}</span>
        <button
          onClick={() => fetchArtists(currentPage + 1)}
          disabled={!nextPage}
          className="pagination-button"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ArtistList;
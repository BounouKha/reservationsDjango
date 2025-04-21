import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import UserMetaList from './components/UserMetaList';
import ArtistList from './components/ArtistList';
import RepresentationsList from './components/RepresentationsList';
import ShowDetail from './components/ShowDetail';
import Cart from './components/Cart'; // Importer le composant Cart
import { getCart, syncLocalCartWithServer } from './services/cartService'; // Importer le service pour récupérer le panier
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css'; // Importer les icônes Bootstrap
import { isUserLoggedIn } from './auth/authService'; 

function App() {
  const [hasItemsInCart, setHasItemsInCart] = useState(false); // État pour indiquer si le panier contient des articles

  // Fonction pour vérifier si le panier contient des articles
  const fetchCartStatus = async () => {
    try {
      const loggedIn = await isUserLoggedIn();
  
      if (loggedIn) {
        // Synchroniser le panier local avec le serveur
        await syncLocalCartWithServer();
  
        // Récupérer le panier depuis le serveur
        const cart = await getCart();
        if (cart && cart.items) {
          setHasItemsInCart(cart.items.length > 0);
        } else {
          console.warn("Le panier récupéré depuis le serveur est vide ou invalide.");
          setHasItemsInCart(false);
        }
      } else {
        // Utiliser le panier local
        const localCart = JSON.parse(localStorage.getItem('cart')) || { items: [] };
        setHasItemsInCart(localCart.items.length > 0);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du panier :', error);
      setHasItemsInCart(false); // En cas d'erreur, considérer le panier comme vide
    }
  };

  return (
    <Router>
      <div className="bg-gray-100 min-h-screen">
        <h1>Reservations</h1>
        <nav className="p-4 bg-white shadow-md d-flex justify-content-between align-items-center">
          <ul className="flex space-x-4">
            <li>
              <Link to="/user-meta" className="text-blue-500 hover:underline">User Meta</Link>
            </li>
            <li>
              <Link to="/artists" className="text-blue-500 hover:underline">Nos artistes</Link>
            </li>
            <li>
              <Link to="/representations" className="text-blue-500 hover:underline">Nos spectacles</Link>
            </li>
          </ul>
          {/* Icône de panier */}
          <div>
            <Link to="/cart" className="btn btn-outline-primary position-relative">
              <i className="bi bi-cart"></i> {/* Icône de panier */}
              {hasItemsInCart && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {/* Petit point rouge pour indiquer qu'il y a des articles */}
                  <span className="visually-hidden">Articles dans le panier</span>
                </span>
              )}
            </Link>
          </div>
        </nav>
        <div className="p-4">
          <Routes>
            <Route path="/user-meta" element={<UserMetaList />} />
            <Route path="/artists" element={<ArtistList />} />
            <Route
              path="/representations"
              element={<RepresentationsList onCartUpdate={fetchCartStatus} />}
            />
            <Route
              path="/show/:id"
              element={<ShowDetail show={{ id: 1, title: "Spectacle 1", description: "Description du spectacle 1" }} />}
            />
            <Route path="/cart" element={<Cart />} /> {/* Route pour le panier */}
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
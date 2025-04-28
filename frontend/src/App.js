import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import UserMetaList from './components/UserMetaList';
import ArtistList from './components/ArtistList';
import RepresentationsList from './components/RepresentationsList';
import ShowDetail from './components/ShowDetail';
import Cart from './components/Cart';
import Login from './auth/Login';
import Profile from './auth/Profile';
import { isUserLoggedIn } from './auth/authService';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

function App() {
    const [hasItemsInCart, setHasItemsInCart] = useState(false);
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const fetchUserAndCartStatus = async () => {
        try {
            const token = localStorage.getItem('token');
            const userId = user?.id;

            if (!token || !userId) {
                setHasItemsInCart(false);
                setUser(null);
                return;
            }

            const loggedIn = await isUserLoggedIn(userId);

            if (loggedIn) {
                const localCart = JSON.parse(localStorage.getItem('cart')) || { items: [] };
                setHasItemsInCart(localCart.items.length > 0);
            } else {
                setUser(null);
                setHasItemsInCart(false);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des données utilisateur ou du panier :', error);
            setHasItemsInCart(false);
            setUser(null);
        }
    };

    useEffect(() => {
        fetchUserAndCartStatus();
    }, []);

    const handleLogout = () => {
        setUser(null);
        setHasItemsInCart(false);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
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
                    <div className="d-flex align-items-center">
                        {user ? (
                            <>
                                <Link to="/profile" className="btn btn-outline-primary me-3">
                                    <i className="bi bi-person-circle"></i> Profil
                                </Link>
                                <button
                                    className="btn btn-danger text-white px-4 py-2 rounded shadow-sm"
                                    style={{
                                        backgroundColor: "#dc3545", // Rouge Bootstrap
                                        border: "none",
                                        fontWeight: "bold",
                                        transition: "all 0.3s ease",
                                    }}
                                    onMouseOver={(e) => (e.target.style.backgroundColor = "#c82333")} // Couleur plus foncée au survol
                                    onMouseOut={(e) => (e.target.style.backgroundColor = "#dc3545")} // Couleur normale après le survol
                                    onClick={handleLogout}
                                >
                                    <i className="bi bi-box-arrow-right me-2"></i> Déconnexion
                                </button>
                            </>
                        ) : (
                            <Link to="/login" className="btn btn-outline-primary">Connexion</Link>
                        )}
                        <Link to={user ? "/cart" : "/login"} className="btn btn-outline-primary position-relative ms-3">
                            <i className="bi bi-cart"></i>
                            {hasItemsInCart && user && (
                                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
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
                        <Route path="/representations" element={<RepresentationsList />} />
                        <Route path="/show/:id" element={<ShowDetail />} />
                        <Route path="/cart" element={user ? <Cart /> : <Navigate to="/login" />} />
                        <Route path="/login" element={user ? <Navigate to="/profile" /> : <Login onLoginSuccess={setUser} />} />
                        <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
}

export default App;
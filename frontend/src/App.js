import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import UserMetaList from './components/UserMetaList';
import ArtistList from './components/ArtistList';
import RepresentationsList from './components/RepresentationsList';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Router>
      <div className="bg-gray-100 min-h-screen">
        <h1>Reservations</h1>
        <nav className="p-4 bg-white shadow-md">
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
        </nav>
        <div className="p-4">
          <Routes>
            <Route path="/user-meta" element={<UserMetaList />} />
            <Route path="/artists" element={<ArtistList />} />
            <Route path="/representations" element={<RepresentationsList />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
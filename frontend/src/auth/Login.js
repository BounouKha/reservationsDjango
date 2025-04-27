import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://127.0.0.1:8000/accounts/api/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();

        // Stocker le token dans le localStorage
        localStorage.setItem('token', data.token);

        // Stocker les informations utilisateur dans le localStorage
        localStorage.setItem('user', JSON.stringify(data.user));

        // Appeler la fonction onLoginSuccess si elle est définie
        if (onLoginSuccess) {
          onLoginSuccess(data.user);
        }

        // Rediriger vers la page de profil
        navigate('/profile');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Erreur lors de la connexion.');
      }
    } catch (err) {
      console.error('Erreur lors de la connexion :', err);
      setError('Une erreur est survenue. Veuillez réessayer.');
    }
  };

  return (
    <div className="container mt-5">
      <h1>Connexion</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="username" className="form-label">Nom d'utilisateur</label>
          <input
            type="text"
            className="form-control"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Mot de passe</label>
          <input
            type="password"
            className="form-control"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">Se connecter</button>
      </form>
    </div>
  );
};

export default Login;
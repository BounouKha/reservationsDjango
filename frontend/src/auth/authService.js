const BASE_URL = 'http://localhost:8000/accounts'; // Remplacez par l'URL de votre API


export const isUserLoggedIn = async () => {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/check/`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.isAuthenticated; // Assurez-vous que le backend retourne cette information
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'authentification :', error);
    return false;
  }
};
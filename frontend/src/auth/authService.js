function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

export const isUserLoggedIn = async () => {
  const csrftoken = getCookie('csrftoken');
  console.log("CSRF Token:", csrftoken);

  try {
    const response = await fetch("http://127.0.0.1:8000/accounts/api/auth/check/", {
      method: "GET",
      credentials: "include", // Inclut les cookies pour l'authentification
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrftoken, // Ajout du CSRF token
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.warn("Endpoint non trouvé : Vérifiez l'URL de l'API.");
        return false; // Considérer comme non connecté
      }
      throw new Error("Erreur lors de la vérification de l'authentification");
    }

    const data = await response.json();
    return data.authenticated || false;
  } catch (error) {
    console.error("Erreur lors de la vérification de l'authentification :", error);
    return false; // Considérer comme non connecté en cas d'erreur
  }
};
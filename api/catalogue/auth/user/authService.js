export const checkAuth = async () => {
    const response = await fetch("/api/auth/user/", {
      method: "GET",
      credentials: "include", // Inclut les cookies pour l'authentification
    });
  
    if (!response.ok) {
      throw new Error("Not authenticated");
    }
  
    return response.json();
  };
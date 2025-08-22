// contexts/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const storedToken = localStorage.getItem("token");

      if (!storedToken) {
        setLoading(false);
        return;
      }

      setToken(storedToken);
      setIsAuthenticated(true);

      const hasSeenWelcome = localStorage.getItem("hasSeenWelcome");
      if (!hasSeenWelcome) {
        setShowWelcomeModal(true);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (authToken, userData = null) => {
    localStorage.setItem("token", authToken);
    setToken(authToken);
    setIsAuthenticated(true);
    setUser(userData);

    const hasSeenWelcome = localStorage.getItem("hasSeenWelcome");
    if (!hasSeenWelcome) {
      setShowWelcomeModal(true);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("pendingLogin");
    localStorage.removeItem("hasSeenWelcome");
    setToken(null);
    setIsAuthenticated(false);
    setUser(null);
    setShowWelcomeModal(false);
  };

  const completeWelcome = async (welcomeData) => {
    try {
      // Отправляем данные на сервер
      const response = await fetch(
        `https://us-central1-akcent-course.cloudfunctions.net/api/user?token=${token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            questions: welcomeData.questions,
            age: welcomeData.age,
            email: welcomeData.email || user?.email,
          }),
        }
      );

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser.user);
        setShowWelcomeModal(false);
        localStorage.setItem("hasSeenWelcome", "true");
        return { success: true };
      } else {
        throw new Error("Failed to save welcome data");
      }
    } catch (error) {
      console.error("Failed to complete welcome:", error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    isAuthenticated,
    user,
    token,
    loading,
    showWelcomeModal,
    login,
    logout,
    checkAuthStatus,
    completeWelcome,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

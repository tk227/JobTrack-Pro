
import { useEffect, useState } from "react";
import Login from "./Login";
import Dashboard from "./Dashboard";
import { logoutUser } from "./api";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return Boolean(localStorage.getItem("jobtrack_access"));
  });

  useEffect(() => {
    function handleAuthExpired() {
      logoutUser();
      setIsAuthenticated(false);
    }

    window.addEventListener("auth-expired", handleAuthExpired);

    return () => {
      window.removeEventListener(
        "auth-expired",
        handleAuthExpired
      );
    };
  }, []);

  function handleLogin() {
    setIsAuthenticated(true);
  }

  function handleLogout() {
    logoutUser();
    setIsAuthenticated(false);
  }

  return isAuthenticated ? (
    <Dashboard onLogout={handleLogout} />
  ) : (
    <Login onLogin={handleLogin} />
  );
}

export default App;

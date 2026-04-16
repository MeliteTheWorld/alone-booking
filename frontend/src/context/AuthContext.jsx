import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("booking-token");
    const storedUser = localStorage.getItem("booking-user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  const persistAuth = (payload) => {
    localStorage.setItem("booking-token", payload.token);
    localStorage.setItem("booking-user", JSON.stringify(payload.user));
    setToken(payload.token);
    setUser(payload.user);
  };

  const login = async (credentials) => {
    const payload = await api.auth.login(credentials);
    persistAuth(payload);
    return payload;
  };

  const register = async (credentials) => {
    const payload = await api.auth.register(credentials);
    persistAuth(payload);
    return payload;
  };

  const refreshProfile = async () => {
    const payload = await api.auth.me();
    const nextUser = payload.user;
    localStorage.setItem("booking-user", JSON.stringify(nextUser));
    setUser(nextUser);
    return nextUser;
  };

  const updateProfile = async (payload) => {
    const result = await api.auth.updateProfile(payload);
    persistAuth(result);
    return result;
  };

  const logout = () => {
    localStorage.removeItem("booking-token");
    localStorage.removeItem("booking-user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: Boolean(token),
        isAdmin: user?.role === "admin",
        login,
        register,
        refreshProfile,
        updateProfile,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

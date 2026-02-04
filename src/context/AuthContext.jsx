import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accounts, setAccounts] = useState([]); // Array of { user, token }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const storedAccounts = JSON.parse(localStorage.getItem("accounts") || "[]");
        const currentToken = localStorage.getItem("token");

        setAccounts(storedAccounts);

        if (currentToken) {
          // If we have a token, verify the current user
          try {
            const res = await api.get("/auth/me");
            setUser(res.data.user);

            // Sync with accounts list
            const updatedAccounts = storedAccounts.map(acc =>
              acc.user._id === res.data.user._id ? { ...acc, user: res.data.user } : acc
            );
            setAccounts(updatedAccounts);
            localStorage.setItem("accounts", JSON.stringify(updatedAccounts));
          } catch (err) {
            // Token invalid, check other accounts or logout
            console.error("Token invalid, logging out current account");
            logout();
          }
        }
      } catch (err) {
        console.error("Auth init error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAccounts();
  }, []);

  const login = (data) => {
    const newAccount = { user: data.user, token: data.token };

    // Add or update account in list
    const otherAccounts = accounts.filter(acc => acc.user._id !== data.user._id);
    const updatedAccounts = [newAccount, ...otherAccounts];

    setAccounts(updatedAccounts);
    localStorage.setItem("accounts", JSON.stringify(updatedAccounts));

    // Set active
    localStorage.setItem("token", data.token);
    setUser(data.user);
  };

  const switchAccount = (userId) => {
    const account = accounts.find(acc => acc.user._id === userId);
    if (account) {
      // 1. Update localStorage first (Synchronous)
      localStorage.setItem("token", account.token);

      // 2. Clear current user state to trigger loaders if any
      setUser(null);

      // 3. Force a hard reload to ensure all axios instances and states are reset
      // We use href to ensure the entire page lifecycle is destroyed and rebuilt
      window.location.href = "/";
    }
  };

  const removeAccount = (userId) => {
    const updatedAccounts = accounts.filter(acc => acc.user._id !== userId);
    setAccounts(updatedAccounts);
    localStorage.setItem("accounts", JSON.stringify(updatedAccounts));

    if (user?._id === userId) {
      if (updatedAccounts.length > 0) {
        switchAccount(updatedAccounts[0].user._id);
      } else {
        logout();
      }
    }
  };

  const logout = () => {
    const updatedAccounts = accounts.filter(acc => acc.user._id !== user?._id);
    setAccounts(updatedAccounts);
    localStorage.setItem("accounts", JSON.stringify(updatedAccounts));

    localStorage.removeItem("token");
    setUser(null);

    if (updatedAccounts.length > 0) {
      switchAccount(updatedAccounts[0].user._id);
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        accounts,
        login,
        logout,
        switchAccount,
        removeAccount,
        loading,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}

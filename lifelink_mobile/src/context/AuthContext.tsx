import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { safeStorage } from '../utils/safeStorage';

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Bootstrap: restore session on mount ──────────────────────────────────
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const cachedUser = await safeStorage.getItem('lifelink_user');
        const cachedToken = await safeStorage.getItem('lifelink_token');

        if (cachedUser && cachedToken) {
          setUser(JSON.parse(cachedUser));
          setToken(cachedToken);
        }
      } catch (e) {
        console.warn('Failed to restore mobile session', e);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const cachedUser = await safeStorage.getItem('lifelink_user');
      if (cachedUser) {
        setUser(JSON.parse(cachedUser));
      }
    } catch (e) {}
  }, []);

  const login = useCallback(async (userData: any, authToken: string) => {
    setUser(userData);
    setToken(authToken);
    await safeStorage.setItem('lifelink_user', JSON.stringify(userData));
    await safeStorage.setItem('lifelink_token', authToken);
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    setToken(null);
    await safeStorage.removeItem('lifelink_user');
    await safeStorage.removeItem('lifelink_token');
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, refreshUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
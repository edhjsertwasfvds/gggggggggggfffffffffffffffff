import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { api } from '../services/api';
import type { User, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  login: () => {},
  logout: () => {},
  hasPermission: () => false,
  hasLevel: () => false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.setToken(token);
      api.getMe()
        .then((res) => {
          if (res.success && res.data) {
            setUser(res.data);
          } else {
            logout();
          }
        })
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = useCallback(() => {
    api.getLoginUrl().then((url) => {
      window.location.href = url;
    });
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    api.setToken(null);
    localStorage.removeItem('token');
  }, []);

  const hasPermission = useCallback((perm: string) => {
    if (!user) return false;
    if (user.permissions.includes('staff.manage')) return true;
    return user.permissions.includes(perm);
  }, [user]);

  const hasLevel = useCallback((level: number) => {
    if (!user) return false;
    return user.level >= level;
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, hasPermission, hasLevel }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

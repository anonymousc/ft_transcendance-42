import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { API_BASE_URL } from '../lib/api';
import type { InterestsProfile } from '../lib/interestsOnboarding';

const ACCESS_TOKEN_STORAGE_KEY = 'access_token';

interface UserData {
  id: string;
  email: string;
  displayName: string | null;
  username: string | null;
  avatar: string | null;
  bio: string | null;
  status: string;
  interests?: InterestsProfile | null;
}

export interface SignupInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface SigninInput {
  email: string;
  password: string;
}

interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
  refreshUser: () => Promise<UserData | null>;
  signup: (data: SignupInput) => Promise<UserData | null>;
  signin: (data: SigninInput) => Promise<UserData | null>;
  setUserInterests: (interests: InterestsProfile | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = async () => {
    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    setUser(null);
  };

  const refreshUser = useCallback(async () => {
    try {
      const headers: Record<string, string> = {};
      try {
        const stored = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
        if (stored) headers.Authorization = `Bearer ${stored}`;
      } catch {
        /* ignore */
      }
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        credentials: 'include',
        headers: Object.keys(headers).length ? headers : undefined,
      });
      if (!res.ok) {
        setUser(null);
        return null;
      }
      const payload = (await res.json().catch(() => ({}))) as UserData | undefined;
      if (payload?.id) {
        setUser(payload);
        return payload;
      }
      setUser(null);
      return null;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        await refreshUser();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshUser]);

  const signup = async (data: SignupInput) => {
    const res = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { message?: string }).message || 'Registration failed');
    }
    const payload = (await res.json().catch(() => ({}))) as UserData & {
      accessToken?: string;
      verificationSent?: boolean;
    };
    const { accessToken, verificationSent: _verificationSent, ...userFields } = payload;
    if (accessToken) {
      localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken);
    }
    const nextUser: UserData = {
      ...userFields,
      status: userFields.status ?? 'offline',
    };
    setUser(nextUser);
    return nextUser;
  };

  const signin = async (data: SigninInput) => {
    const res = await fetch(`${API_BASE_URL}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { message?: string }).message || 'Invalid email or password');
    }
    const payload = (await res.json().catch(() => ({}))) as UserData & {
      accessToken?: string;
      user?: UserData;
    };
    if (payload.accessToken) {
      localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, payload.accessToken);
    }
    const nextUser = payload.user ?? {
      id: payload.id,
      email: payload.email,
      displayName: payload.displayName,
      username: payload.username,
      avatar: payload.avatar,
      bio: payload.bio,
      status: payload.status,
      interests: payload.interests,
    };
    setUser(nextUser);
    return nextUser;
  };

  const setUserInterests = (interests: InterestsProfile | null) => {
    if (!user) return;
    setUser({ ...user, interests });
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, logout, refreshUser, signup, signin, setUserInterests }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

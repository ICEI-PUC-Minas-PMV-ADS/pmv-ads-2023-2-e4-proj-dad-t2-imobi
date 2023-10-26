import { createContext, useCallback, useEffect, useState } from "react";
import { localStorageKeys } from "../config/localStorageKeys";
import { useQuery } from "@tanstack/react-query";
import { userService } from "../services/userService";
import toast from "react-hot-toast";

interface AuthContextValue {
  signedIn: boolean;
  login(token: string): void;
  logout(): void;
}

export const AuthContext = createContext({} as AuthContextValue);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [signedIn, setSignedIn] = useState<boolean>(() => {
    const storedToken = localStorage.getItem(localStorageKeys.TOKEN);

    return Boolean(storedToken);
  });

  const { isError } = useQuery({
    queryKey: ['users', 'validate'],
    queryFn: () => userService.validate(),
    enabled: signedIn
  });

  const login = useCallback((token: string) => {
    localStorage.setItem(localStorageKeys.TOKEN, token);

    setSignedIn(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(localStorageKeys.TOKEN);
    setSignedIn(false)
  }, []);

  useEffect(() => {
    if (isError) {
      toast.error('Sua sessão expirou!')

      logout();
    }
  }, [isError, logout])

  return (
    <AuthContext.Provider value={{ signedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

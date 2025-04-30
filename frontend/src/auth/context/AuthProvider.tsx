import { ReactNode, useEffect, useState } from "react";
import { User } from "../../types/models";
import AuthContext from "./AuthContext";
import { me } from "../services/authService";

interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  useEffect(() => {
    me()
      .then(({ data }) => setUser(data))
      .finally(() => setAuthLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{ user, authLoading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

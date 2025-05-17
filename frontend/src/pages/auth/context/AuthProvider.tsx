import { ReactNode, useEffect, useState } from "react";

import AuthContext from "./AuthContext";
import { User } from "../../../types/models";
import { me } from "../../../services/authService";

interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  useEffect(() => {
    me()
      .then((user) => setUser(user))
      .finally(() => setAuthLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{ user, authLoading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

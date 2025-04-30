import { createContext } from "react";
import { User } from "../../types/models";

interface AuthContextProps {
  user: User | null;
  authLoading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  authLoading: true,
  setUser: () => {},
});

export default AuthContext;

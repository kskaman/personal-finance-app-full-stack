import { useState, ReactNode } from "react";
import { PotsActionContext, PotsDataContext } from "./PotsContext";
import { Pot } from "../../../types/models";

interface PotsProviderProps {
  children: ReactNode;
  pots: Pot[];
}

export const PotsProvider = ({ children, pots }: PotsProviderProps) => {
  const [potsState, setPotsState] = useState<Pot[]>(pots);

  return (
    <PotsDataContext.Provider value={{ pots: potsState }}>
      <PotsActionContext.Provider value={{ setPots: setPotsState }}>
        {children}
      </PotsActionContext.Provider>
    </PotsDataContext.Provider>
  );
};

import { useState, ReactNode } from "react";
import { SettingsContext } from "./SettingsContext";

import { ThemeManager } from "../../../context/ThemeManager";
import { Currency, Font } from "../../../types/models";
import { DisplayedModules } from "../../../types/Data";

interface SettingsProviderProps {
  children: ReactNode;
  font: Font;
  currency: Currency;
  pots: boolean;
  bills: boolean;
  budgets: boolean;
}

export const SettingsProvider = ({
  children,
  font,
  currency,
  pots,
  bills,
  budgets,
}: SettingsProviderProps) => {
  const [selectedFont, setSelectedFont] = useState<Font>(font);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(currency);
  const [modules, setDisplayedModules] = useState<DisplayedModules>({
    pots,
    bills,
    budgets,
  });

  return (
    <SettingsContext.Provider
      value={{
        selectedFont,
        setSelectedFont,
        selectedCurrency,
        setSelectedCurrency,
        displayedModules: modules,
        setDisplayedModules,
      }}
    >
      <ThemeManager>{children}</ThemeManager>
    </SettingsContext.Provider>
  );
};

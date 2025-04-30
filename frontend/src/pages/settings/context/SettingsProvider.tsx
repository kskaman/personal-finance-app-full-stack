import { useState, ReactNode } from "react";
import { SettingsContext } from "./SettingsContext";

import { ThemeManager } from "../../../context/ThemeManager";
import { Currency, DisplayedModules, Font } from "../../../types/models";

interface SettingsProviderProps {
  children: ReactNode;
  font: Font;
  currency: Currency;
  displayedModules: DisplayedModules;
}

export const SettingsProvider = ({
  children,
  font,
  currency,
  displayedModules,
}: SettingsProviderProps) => {
  const [selectedFont, setSelectedFont] = useState<Font>(font);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(currency);
  const [modules, setDisplayedModules] =
    useState<DisplayedModules>(displayedModules);

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

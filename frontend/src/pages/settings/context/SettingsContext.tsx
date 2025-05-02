import { createContext } from "react";
import { Currency, Font } from "../../../types/models";
import { DisplayedModules } from "../../../types/Data";

export interface SettingsContextType {
  selectedFont: Font;
  setSelectedFont: React.Dispatch<React.SetStateAction<Font>>;
  selectedCurrency: Currency;
  setSelectedCurrency: React.Dispatch<React.SetStateAction<Currency>>;
  displayedModules: DisplayedModules;
  setDisplayedModules: React.Dispatch<React.SetStateAction<DisplayedModules>>;
}

export const SettingsContext = createContext<SettingsContextType>({
  selectedFont: Font.public_sans,
  setSelectedFont: () => {},
  selectedCurrency: Currency.us_dollar,
  setSelectedCurrency: () => {},
  displayedModules: {
    pots: true,
    bills: true,
    budgets: true,
  },
  setDisplayedModules: () => {},
});

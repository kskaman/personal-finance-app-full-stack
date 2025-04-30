import { createContext } from "react";
import { Currency, DisplayedModules, Font } from "../../../types/models";

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
    pots: { label: "Pots", using: true },
    recurringBills: { label: "Recurring Bills", using: true },
    budgets: { label: "Budgets", using: true },
  },
  setDisplayedModules: () => {},
});

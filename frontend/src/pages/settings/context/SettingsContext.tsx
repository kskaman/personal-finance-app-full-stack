import { createContext } from "react";
import { Currency, Font } from "../../../types/models";
import { DisplayedModules } from "../../../types/Data";

export interface SettingsContextType {
  selectedFont: Font;
  handleFontSelect: (font: Font) => Promise<void>;
  selectedCurrency: Currency;
  handleCurrencySelect: (currency: Currency) => Promise<void>;
  displayedModules: DisplayedModules;
  handleTogglePots: (value: boolean) => Promise<void>;
  handleToggleBills: (value: boolean) => Promise<void>;
  handleToggleBudgets: (value: boolean) => Promise<void>;
}

export const SettingsContext = createContext<SettingsContextType>({
  selectedFont: Font.public_sans,
  handleFontSelect: async () => {},
  selectedCurrency: Currency.us_dollar,
  handleCurrencySelect: async () => {},
  displayedModules: {
    pots: true,
    bills: true,
    budgets: true,
  },
  handleTogglePots: async () => {},
  handleToggleBills: async () => {},
  handleToggleBudgets: async () => {},
});

import { useState, ReactNode } from "react";
import { SettingsContext } from "./SettingsContext";

import { ThemeManager } from "../../../context/ThemeManager";
import { Currency, Font } from "../../../types/models";
import { DisplayedModules } from "../../../types/Data";
import {
  updateCurrency,
  updateDisplayedBills,
  updateDisplayedBudgets,
  updateDisplayedPots,
  updateFont,
} from "../../../services/settingsService";
import { CurrencyReverseMap, FontReverseMap } from "../../../types/maps";

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

  // Inside SettingsProvider
  const handleFontSelect = async (font: Font) => {
    try {
      const fontKey = FontReverseMap[font];
      await updateFont(fontKey);
      setSelectedFont(font);
    } catch (err) {
      console.error("Failed to update font", err);
    }
  };

  const handleCurrencySelect = async (currency: Currency) => {
    try {
      const currencyKey = CurrencyReverseMap[currency];
      await updateCurrency(currencyKey);
      setSelectedCurrency(currency);
    } catch (err) {
      console.error("Failed to update currency", err);
    }
  };

  const handleTogglePots = async (value: boolean) => {
    try {
      await updateDisplayedPots(value);
      setDisplayedModules((prev) => ({ ...prev, pots: value }));
    } catch (err) {
      console.error("Failed to update pots visibility", err);
    }
  };

  const handleToggleBills = async (value: boolean) => {
    try {
      await updateDisplayedBills(value);
      setDisplayedModules((prev) => ({ ...prev, bills: value }));
    } catch (err) {
      console.error("Failed to update bills visibility", err);
    }
  };

  const handleToggleBudgets = async (value: boolean) => {
    try {
      await updateDisplayedBudgets(value);
      setDisplayedModules((prev) => ({ ...prev, budgets: value }));
    } catch (err) {
      console.error("Failed to update budgets visibility", err);
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        selectedFont,
        handleFontSelect,
        selectedCurrency,
        handleCurrencySelect,
        displayedModules: modules,
        handleTogglePots,
        handleToggleBills,
        handleToggleBudgets,
      }}
    >
      <ThemeManager>{children}</ThemeManager>
    </SettingsContext.Provider>
  );
};

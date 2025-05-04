import { DisplayedModules } from "./Data";
import { Currency, Font } from "./models";

export const FontReverseMap: Record<string, keyof typeof Font> = {
    "public-sans": "public_sans",
    "noto-serif": "noto_serif",
    "source-code": "source_code",
};
  

export const CurrencyReverseMap: Record<string, keyof typeof Currency> = {
    "$": "us_dollar",
    "C$": "cad_dollar",
    "€": "euro",
    "₹": "indian_rupees",
    "£": "british_pound_sterling",
    "A$": "australian_dollar",
    "¥": "chinese_yuan",
};

export const moduleLabels: Record<keyof DisplayedModules, string> = {
    bills: "Recurring Bills",
    pots: "Savings Pots",
    budgets: "Budgets",
};
  
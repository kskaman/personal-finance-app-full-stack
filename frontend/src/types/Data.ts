import { ReactNode } from "react";

import { Balance, Budget, Category, Currency, Font, Settings } from "./models";

export interface BudgetStats {
  totalMaximum: number;
  budgets: Budget[];
}


export interface MarkerTheme {
    label: string;
    colorCode: string;
}

export interface RecurringSummary {
    paid: { count: number; total: number };
    unpaid: { count: number; total: number };
    dueSoon: { count: number; total: number };
    due: { count: number; total: number };
}

export interface DataType {
    userId: string;
    balance: Balance;
    settings: Settings;
    categories: Category[];
  }

  

  // Option Data type for Settings font and currency options
export interface SettingsRadioOption {
      value: Font | Currency;
      symbol: ReactNode;
      label: ReactNode;
  }
  

  // types/displayedModules.ts
export interface DisplayedModules {
    pots: boolean;
    bills: boolean;
    budgets: boolean;
  }
  


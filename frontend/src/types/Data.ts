import { ReactNode } from "react";

import { Balance, Budget, Category, Currency, Font, Pot, RecurringBill, Settings, Transaction } from "./models";


export interface MarkerTheme {
    name: string;
    colorCode: string;
    usedInBudgets: boolean;
    usedInPots: boolean;
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
    transactions: Transaction[];
    budgets: Budget[];
    pots: Pot[];
    recurringBills: RecurringBill[];
    categories: Category[];
    markerThemes: MarkerTheme[];
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
  


// Enums matching Prisma
export enum Font {
    public_sans = "public_sans",
    noto_serif = "noto_serif",
    source_code = "source_code",
  }
  
  export enum Currency {
    us_dollar = "us_dollar",
    cad_dollar = "cad_dollar",
    euro = "euro",
    indian_rupees = "indian_rupees",
    british_pound_sterling = "british_pound_sterling",
    australian_dollar = "australian_dollar",
    chinese_yuan = "chinese_yuan",
  }
  
  export enum CategoryType {
    standard = "standard",
    custom = "custom",
  }
  

  
// Models
export interface DisplayedModules {
  pots: { label: string;  using: boolean};
  recurringBills: { label: string;  using: boolean};
  budgets: { label: string;  using: boolean};
}

  export interface Settings {
    font: Font;
    currency: Currency;
    displayedModules: DisplayedModules;
  }
  
  export interface Balance {
    current: number;
    income: number;
    expenses: number;
  }
  
  export interface Transaction {
    id: string;
    userId: string;
    avatar?: string;
    name: string;
    category: string;
    date: string;
    theme: string;
    amount: number;
    recurring: boolean;
    recurringId?: string;
  }
  
  export interface Budget {
    id: string;
    userId: string;
    category: string;
    maximum: number;
    theme: string;
  }
  
  export interface Pot {
    id: string;
    userId: string;
    name: string;
    target: number;
    total: number;
    theme: string;
  }
  
  export interface RecurringBill {
    id: string;
    userId: string;
    avatar?: string;
    name: string;
    category: string;
    amount: number;
    lastPaid: string;
    dueDate: string;
    theme: string;
    recurring: boolean;
  }
  
  export interface Category {
    id: string;
    userId: string;
    name: string;
    usedInBudgets: boolean;
    type: CategoryType;
  }
  
  // User (as returned by backend /auth/me or /user/data)
  export interface User {
    id: string;
    name: string;
    email: string;
    isVerified: boolean;
  
    settings: Settings;
    balance: Balance;
  
    // Optionally included when calling /user/data
    transactions?: Transaction[];
    budgets?: Budget[];
    pots?: Pot[];
    recurringBills?: RecurringBill[];
    categories?: Category[];
  }
  
  // Full app data structure (used in DataProvider)
  export interface DataType {
    userId: string;
    balance: Balance;
    settings: Settings;
    transactions: Transaction[];
    budgets: Budget[];
    pots: Pot[];
    recurringBills: RecurringBill[];
    categories: Category[];
    markerThemes: string[];
  }
  
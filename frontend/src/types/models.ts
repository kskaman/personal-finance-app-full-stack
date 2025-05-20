// Enums matching Prisma
export enum Font {
    public_sans = "public-sans",
    noto_serif = "noto-serif",
    source_code = "source-code",
  }
  
  export enum Currency {
    us_dollar = "$",
    cad_dollar = "C$",
    euro = "€",
    indian_rupees = "₹",
    british_pound_sterling = "£",
    australian_dollar = "A$",
    chinese_yuan = "¥",
  }
  
  export enum CategoryType {
    standard = "standard",
    custom = "custom",
  }
  

  
// Models


  export interface Settings {
    font: Font;
    currency: Currency;
    pots: boolean;
    bills: boolean;
    budgets: boolean;
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
    date: Date;
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
    id?: string;
    name: string;
    category: string;
    amount: number;
    lastPaid?: Date;
    dueDate: string;
    theme: string;
  }
  
  export interface Category {
    id: string;
    userId: string;
    name: string;
    type: CategoryType;
  }
  
  // User (as returned by backend /user/data)
  export interface User {
    id: string;
    name?: string;
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
  

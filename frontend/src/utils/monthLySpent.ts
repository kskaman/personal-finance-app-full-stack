import { Transaction } from "../types/models";

/**
 * Turn
 *   { Groceries: Transaction[], Rent: Transaction[], … }
 * into
 *   { Groceries: 285.17, Rent: 1200.00, … }
 *
 * • “Spent” is treated as the absolute value of *negative* amounts.
 * • Positive amounts (refunds, transfers in) are ignored.
 *   –- Change the predicate if your data model is different.
 */
export const computeMonthlySpentByCategory = (
  txnMap: Record<string, Transaction[]>
): Record<string, number> => {
  return Object.entries(txnMap).reduce<Record<string, number>>(
    (acc, [category, txns]) => {
      acc[category] = txns.reduce((sum, t) => {
        // Expenses are stored as negative numbers in this schema.
        return t.amount < 0 ? sum + Math.abs(t.amount) : sum;
      }, 0);
      return acc;
    },
    {}
  );
};

import { MarkerTheme } from "../types/Data";
import { Budget, Category } from "../types/models";

export const updateUsedStatuses = (
  budgets: Budget[],
  categories: Category[],
  markerThemes: MarkerTheme[]
): { updatedCategories: Category[]; updatedMarkerThemes: MarkerTheme[] } => {
  const updatedCategories = categories.map((cat) => ({
    ...cat,
    usedInBudgets: budgets.some((budget) => budget.category === cat.name),
  }));

  const updatedMarkerThemes = markerThemes.map((theme) => ({
    ...theme,
    usedInBudgets: budgets.some(
      (budget) =>
        budget.theme.toLowerCase() === theme.colorCode.toLowerCase()
    ),
  }));

  return { updatedCategories, updatedMarkerThemes };
};

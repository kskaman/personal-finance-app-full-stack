import { MarkerTheme } from "../types/Data";
import { Budget } from "../types/models";

export const updateUsedStatuses = (
  budgets: Budget[],
  markerThemes: MarkerTheme[]
): { updatedMarkerThemes: { value: string; label: string; colorCode: string; used: boolean }[] } => {


  const updatedMarkerThemes = markerThemes.map((theme) => ({
    ...theme,
    value: theme.colorCode,
    used: budgets.some(
      (budget) =>
        budget.theme.toLowerCase() === theme.colorCode.toLowerCase()
    ),
  }));

  return { updatedMarkerThemes };
};

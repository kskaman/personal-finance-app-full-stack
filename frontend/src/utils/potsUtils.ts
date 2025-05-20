import { MarkerTheme } from "../types/Data";
import { Pot } from "../types/models";

export const updateUsedStatuses = (
  pots: Pot[],
  markerThemes: MarkerTheme[]
): { updatedMarkerThemes: { value: string;  label: string; colorCode: string;  used: boolean}[]} => {
  const updatedMarkerThemes = markerThemes.map((theme) => ({
    ...theme,
    value: theme.colorCode,
    used: pots.some(
      (pot) =>
        pot.theme.toLowerCase() === theme.colorCode.toLowerCase()
    ),
  }));

  return { updatedMarkerThemes };
};

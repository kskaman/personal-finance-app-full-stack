import { createContext } from "react";
import { MarkerTheme } from "../types/Data";
import { Category } from "../types/models";

interface CategoryMarkerContextProps {
  categories: Category[];
  markerThemes: MarkerTheme[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
}

const CategoryMarkerContext = createContext<CategoryMarkerContextProps>({
  categories: [],
  markerThemes: [],
  setCategories: () => {},
});

export default CategoryMarkerContext;

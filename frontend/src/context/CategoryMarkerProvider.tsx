import { ReactNode, useState } from "react";
import { MarkerTheme } from "../types/Data";
import CategoryMarkerContext from "./CategoryMarkerContext";
import { Category } from "../types/models";
import { defaultThemes } from "../constants/markerThemes";

interface CategoryMarkerProviderProps {
  categories: Category[];
  children: ReactNode;
}

const CategoryMarkerProvider = ({
  categories,
  children,
}: CategoryMarkerProviderProps) => {
  const [categoriesArr, setCategoriesArr] = useState<Category[]>(categories);
  const [markerThemesArr, setMarkerThemesArr] =
    useState<MarkerTheme[]>(defaultThemes);

  return (
    <CategoryMarkerContext.Provider
      value={{
        categories: categoriesArr,
        markerThemes: markerThemesArr,
        setCategories: setCategoriesArr,
        setMarkerThemes: setMarkerThemesArr,
      }}
    >
      {children}
    </CategoryMarkerContext.Provider>
  );
};

export default CategoryMarkerProvider;

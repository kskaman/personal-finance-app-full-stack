import { ReactNode, useState } from "react";
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

  return (
    <CategoryMarkerContext.Provider
      value={{
        categories: categoriesArr,
        markerThemes: defaultThemes,
        setCategories: setCategoriesArr,
      }}
    >
      {children}
    </CategoryMarkerContext.Provider>
  );
};

export default CategoryMarkerProvider;

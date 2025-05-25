import { useEffect, useState } from "react";
import { DataType } from "../types/Data";
import CategoryMarkerProvider from "./CategoryMarkerProvider";
import { SettingsProvider } from "../pages/settings/context/SettingsProvider";
import Loader from "../ui/Loader";
import { getUserData } from "../services/userService";
import { Currency, Font } from "../types/models";
import { getCategories } from "../services/categoryService";

// Interface and main component
interface DataProviderProps {
  children: React.ReactNode;
}

const DataProvider = ({ children }: DataProviderProps) => {
  const [data, setData] = useState<DataType | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // fetch user
        const user = await getUserData();
        // fetch categories separately
        const categories = await getCategories();

        const constructed: DataType = {
          userId: user.id,

          balance: user.balance,
          settings: {
            font: Font[user.settings.font as unknown as keyof typeof Font],
            currency:
              Currency[
                user.settings.currency as unknown as keyof typeof Currency
              ],
            pots: user.settings.pots,
            bills: user.settings.bills,
            budgets: user.settings.budgets,
          },
          categories: categories ?? [],
        };

        setData(constructed);
      } catch (err) {
        console.log("Error : ", err);
        setError("Could not fetch user data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (error)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100vw",
          height: "100vh",
        }}
      >
        Error: {error}
      </div>
    );

  if (loading) return <Loader />;

  if (!data) {
    return <Loader />;
  }

  return (
    <SettingsProvider
      font={data.settings.font}
      currency={data.settings.currency}
      pots={data.settings.pots}
      bills={data.settings.bills}
      budgets={data.settings.budgets}
    >
      <CategoryMarkerProvider categories={data.categories}>
        {children}
      </CategoryMarkerProvider>
    </SettingsProvider>
  );
};

export default DataProvider;

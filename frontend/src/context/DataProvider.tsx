import { useEffect, useState } from "react";
import { DataType } from "../types/Data";
import BalanceTransactionsProvider from "./BalanceTransactionsProvider";
import BudgetsProvider from "../pages/budgets/context/BudgetsProvider";
import RecurringProvider from "../pages/recurringBills/context/RecurringProvider";
import { PotsProvider } from "../pages/pots/context/PotsProvider";
import CategoryMarkerProvider from "./CategoryMarkerProvider";
import { SettingsProvider } from "../pages/settings/context/SettingsProvider";
import Loader from "../ui/Loader";
import { getUserData } from "../services/userService";

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
        const user = await getUserData();
        console.log(user);
        const constructed: DataType = {
          userId: user.id,
          balance: user.balance,
          settings: {
            font: user.settings.font,
            currency: user.settings.currency,
            pots: user.settings.pots,
            bills: user.settings.bills,
            budgets: user.settings.budgets,
          },
          transactions: user.transactions ?? [],
          budgets: user.budgets ?? [],
          pots: user.pots ?? [],
          recurringBills: user.recurringBills ?? [],
          categories: user.categories ?? [],
          markerThemes: [],
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
      <CategoryMarkerProvider
        categories={data.categories}
        markerThemes={data.markerThemes}
      >
        <BalanceTransactionsProvider
          balance={data.balance}
          transactions={data.transactions}
        >
          <BudgetsProvider budgets={data.budgets}>
            <RecurringProvider recurringBills={data.recurringBills}>
              <PotsProvider pots={data.pots}>{children}</PotsProvider>
            </RecurringProvider>
          </BudgetsProvider>
        </BalanceTransactionsProvider>
      </CategoryMarkerProvider>
    </SettingsProvider>
  );
};

export default DataProvider;

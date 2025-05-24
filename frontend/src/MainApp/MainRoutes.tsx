import { Navigate, Route, Routes } from "react-router";
import MainLayout from "./MainLayout";
import OverViewPage from "../pages/overview/OverViewPage";
import BillsPage from "../pages/recurringBills/BillsPage";
import BudgetsPage from "../pages/budgets/BudgetsPage";
import PotsPage from "../pages/pots/PotsPage";
import TransactionsPage from "../pages/transactions/TransactionsPage";
import SettingsPage from "../pages/settings/SettingsPage";
import { useContext } from "react";
import { SettingsContext } from "../pages/settings/context/SettingsContext";
import { billsLoader } from "../pages/recurringBills/billsLoader";
import { potsLoader } from "../pages/pots/potsLoader";
import { budgetsLoader } from "../pages/budgets/budgetsLoader";
import { transactionsLoader } from "../pages/transactions/transactionsLoader";
import { overviewLoader } from "../pages/overview/overviewLoader";

const MainRoutes = () => {
  const { displayedModules } = useContext(SettingsContext);

  return (
    <Routes>
      <Route path="" element={<MainLayout />}>
        <Route index element={<Navigate to="overview" />} />
        <Route
          path="overview"
          element={<OverViewPage />}
          loader={overviewLoader}
        />
        {/* Only allow access to BudgetsPage if the module is enabled */}
        {displayedModules.budgets && (
          <Route
            path="budgets"
            element={<BudgetsPage />}
            loader={budgetsLoader}
          />
        )}
        {/* Only allow access to PotsPage if the module is enabled */}
        {displayedModules.pots && (
          <Route path="pots" element={<PotsPage />} loader={potsLoader} />
        )}
        {/* Only allow access to BillsPage if the module is enabled */}
        {displayedModules.bills && (
          <Route path="bills" element={<BillsPage />} loader={billsLoader} />
        )}
        <Route
          path="transactions"
          element={<TransactionsPage />}
          loader={transactionsLoader}
        />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
};

export default MainRoutes;

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

const MainRoutes = () => {
  const { displayedModules } = useContext(SettingsContext);

  return (
    <Routes>
      <Route path="" element={<MainLayout />}>
        <Route index element={<Navigate to="overview" />} />
        <Route path="overview" element={<OverViewPage />} />
        {/* Only allow access to BudgetsPage if the module is enabled */}
        {displayedModules.budgets && (
          <Route path="budgets" element={<BudgetsPage />} />
        )}
        {/* Only allow access to PotsPage if the module is enabled */}
        {displayedModules.pots && <Route path="pots" element={<PotsPage />} />}
        {/* Only allow access to BillsPage if the module is enabled */}
        {displayedModules.bills && (
          <Route path="bills" element={<BillsPage />} />
        )}
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
};

export default MainRoutes;

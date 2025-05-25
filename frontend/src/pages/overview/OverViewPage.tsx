import SetTitle from "../../ui/SetTitle";
import { Box, Stack, Typography, useTheme } from "@mui/material";

import Balance from "./components/Balance";
import TransactionsOverview from "./components/TransactionsOverview";
import PotsOverview from "./components/PotsOverview";
import BudgetsOverview from "./components/BudgetsOverview";
import BillsOverview from "./components/BillsOverview";
import PageDiv from "../../ui/PageDiv";
import useParentWidth from "../../customHooks/useParentWidth";
import { LG_BREAK, SM_BREAK } from "../../constants/widthConstants";
import { useNavigate } from "react-router";
import EmptyStatePage from "../../ui/EmptyStatePage";
import { useLatestTx } from "../transactions/hooks/useTransactions";
import DotLoader from "../../ui/DotLoader";
import { useBudgetStats } from "../budgets/hooks/useBudgets";
import { usePotStats } from "../pots/hooks/usePots";
import { useBillStats } from "../recurringBills/hooks/useBills";
import { useContext } from "react";
import { SettingsContext } from "../settings/context/SettingsContext";
import { useBalance } from "./hooks/useBalance";

const OverViewPage = () => {
  const { containerRef, parentWidth } = useParentWidth();
  const isParentLg = parentWidth < LG_BREAK;
  const isParentSm = parentWidth < SM_BREAK;

  const theme = useTheme();

  const {
    data: balance = {
      current: 0,
      income: 0,
      expenses: 0,
    },
    isLoading: isBalanceLoading,
    isError: isBalanceError,
    refetch: balanceRefetch,
  } = useBalance();
  const {
    data: budgetStats = {
      totalMaximum: 0,
      budgets: [],
    },
    isLoading: isBudgetsStatsLoading,
    isError: isBudgetStatsError,
    refetch: budgetStatsRefetch,
  } = useBudgetStats();

  const {
    data: latestTransactions = [],
    isLoading: isLatestTxnLoading,
    isError: isLatestTxnError,
    refetch: latestTxnRefetch,
  } = useLatestTx();

  const {
    data: potStats = {
      totalSaved: 0,
      topPots: [],
    },
    isLoading: isPotsStatsLoading,
    isError: isPotsStatsError,
    refetch: potsStatsRefetch,
  } = usePotStats();

  const {
    data: recurringSummary = {
      total: 0,
      paid: { count: 0, total: 0 },
      unpaid: { count: 0, total: 0 },
      due: { count: 0, total: 0 },
      dueSoon: { count: 0, total: 0 },
    },
    isLoading: isBillsLoading,
    isError: isBillsError,
    refetch: billsRefetch,
  } = useBillStats();

  const { selectedCurrency: currencySymbol, displayedModules } =
    useContext(SettingsContext);
  const navigate = useNavigate();

  if (
    isBudgetsStatsLoading ||
    isLatestTxnLoading ||
    isPotsStatsLoading ||
    isBillsLoading ||
    isBalanceLoading
  ) {
    return <DotLoader />;
  }

  if (
    isBudgetStatsError ||
    isLatestTxnError ||
    isPotsStatsError ||
    isBillsError ||
    isBalanceError
  ) {
    return (
      <EmptyStatePage
        message="Unable to fetch bills"
        subText="Check your connection and retry."
        buttonLabel="Retry"
        onButtonClick={() => {
          budgetStatsRefetch();
          latestTxnRefetch();
          potsStatsRefetch();
          billsRefetch();
          balanceRefetch();
        }}
      />
    );
  }

  // Decide if there is any data at all

  // If absolutely everything is empty, show a single empty-state layout:
  if (latestTransactions.length === 0) {
    return (
      <>
        <SetTitle title="Overview" />
        <EmptyStatePage
          message="No Data Yet"
          subText={`You haven't added any balances, transactions. Let's get started!`}
          buttonLabel="Go to Transactions Page"
          onButtonClick={() => {
            navigate("/transactions");
          }}
        />
      </>
    );
  }

  return (
    <>
      <SetTitle title="OverView" />
      <Box ref={containerRef}>
        <PageDiv>
          <Stack direction="column" gap="32px">
            <Typography
              width="100%"
              height="56px"
              fontSize="32px"
              fontWeight="bold"
              color={theme.palette.primary.main}
            >
              Overview
            </Typography>

            <Balance
              isParentSm={isParentSm}
              balance={balance}
              currencySymbol={currencySymbol}
            />
            <Stack
              direction={isParentLg ? "column" : "row"}
              gap="24px"
              width="100%"
            >
              <Stack
                direction="column"
                gap="24px"
                width={isParentLg ? "100%" : "50%"}
              >
                {displayedModules.pots && potStats.topPots.length !== 0 && (
                  <PotsOverview
                    potStats={potStats}
                    currencySymbol={currencySymbol}
                  />
                )}
                {
                  <TransactionsOverview
                    currencySymbol={currencySymbol}
                    latestTransactions={latestTransactions}
                  />
                }
              </Stack>
              <Stack
                direction="column"
                gap="24px"
                width={isParentLg ? "100%" : "50%"}
              >
                {displayedModules.budgets &&
                  budgetStats.budgets.length !== 0 && (
                    <BudgetsOverview
                      currencySymbol={currencySymbol}
                      stats={budgetStats}
                    />
                  )}
                {displayedModules.bills && (
                  <BillsOverview
                    currencySymbol={currencySymbol}
                    recurringSummary={recurringSummary}
                  />
                )}
              </Stack>
            </Stack>
          </Stack>
        </PageDiv>
      </Box>
    </>
  );
};

export default OverViewPage;

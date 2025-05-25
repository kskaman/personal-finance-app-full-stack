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

const OverViewPage = () => {
  const { containerRef, parentWidth } = useParentWidth();
  const isParentLg = parentWidth < LG_BREAK;
  const isParentSm = parentWidth < SM_BREAK;

  const theme = useTheme();

  const {
    data: latestTransactions = [],
    isLoading,
    isError,
    refetch,
  } = useLatestTx();

  const navigate = useNavigate();

  if (isLoading) {
    return <DotLoader />;
  }

  if (isError) {
    return (
      <EmptyStatePage
        message="Unable to fetch bills"
        subText="Check your connection and retry."
        buttonLabel="Retry"
        onButtonClick={() => {
          refetch();
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

            <Balance isParentSm={isParentSm} />
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
                {<PotsOverview />}
                {<TransactionsOverview />}
              </Stack>
              <Stack
                direction="column"
                gap="24px"
                width={isParentLg ? "100%" : "50%"}
              >
                {<BudgetsOverview />}
                {<BillsOverview />}
              </Stack>
            </Stack>
          </Stack>
        </PageDiv>
      </Box>
    </>
  );
};

export default OverViewPage;

import { Stack, Typography, useTheme } from "@mui/material";
import CaretRightIcon from "../../../Icons/CaretRightIcon";
import SubContainer from "../../../ui/SubContainer";
import { useContext } from "react";
import { formatNumber } from "../../../utils/utilityFunctions";
import { Link } from "react-router";
import { SettingsContext } from "../../settings/context/SettingsContext";
import { useBillStats } from "../../recurringBills/hooks/useBills";

const BillsOverview = () => {
  const theme = useTheme();
  const { data: recurringSummary, isError } = useBillStats();
  console.log(recurringSummary);
  const currencySymbol = useContext(SettingsContext).selectedCurrency;

  if (isError || !recurringSummary) return null;

  const summaryData = {
    paid: {
      label: "Paid Bills",
      borderColor: theme.palette.others.green,
      count: recurringSummary.paid.count,
      total: recurringSummary.paid.total,
    },
    unpaid: {
      label: "Total Upcoming",
      borderColor: theme.palette.others.yellow,
      count: recurringSummary.unpaid.count,
      total: recurringSummary.unpaid.total,
    },
    dueSoon: {
      label: "Due Soon",
      borderColor: theme.palette.others.cyan,
      count: recurringSummary.dueSoon.count,
      total: recurringSummary.dueSoon.total,
    },
    due: {
      label: "Due",
      borderColor: theme.palette.others.red,
      count: recurringSummary.due.count,
      total: recurringSummary.due.total,
    },
  };
  const showDue = recurringSummary.due.count !== 0;

  return (
    <SubContainer>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography
          fontWeight="bold"
          fontSize="20px"
          color={theme.palette.primary.main}
        >
          Recurring Bills
        </Typography>
        <Link
          to="/app/bills"
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: "4px",
            textDecoration: "none",
          }}
        >
          <Typography
            fontSize="14px"
            color={theme.palette.primary.light}
            sx={{
              whiteSpace: "nowrap",
              ":hover": {
                color: theme.palette.primary.main,
              },
            }}
          >
            See Details
          </Typography>
          <CaretRightIcon color={theme.palette.primary.light} />
        </Link>
      </Stack>
      <Stack gap="12px">
        {Object.entries(summaryData)
          .filter(([key]) => key !== "due" || showDue)
          .map(([key, summary]) => {
            const isDue = key === "due";

            return (
              <Stack
                key={key}
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                padding="20px 16px"
                borderRadius="8px"
                borderLeft={`4px solid ${summary.borderColor}`}
                bgcolor={theme.palette.background.default}
              >
                <Typography
                  fontSize="14px"
                  fontWeight={isDue ? "bold" : "normal"}
                  color={
                    isDue
                      ? theme.palette.others.red
                      : theme.palette.primary.light
                  }
                >
                  {summary.label}
                </Typography>
                <Typography
                  fontSize="14px"
                  fontWeight="bold"
                  color={
                    isDue
                      ? theme.palette.others.red
                      : theme.palette.primary.main
                  }
                >
                  ${summary.count}(
                  {`${currencySymbol}${formatNumber(summary.total)}`})
                </Typography>
              </Stack>
            );
          })}
      </Stack>
    </SubContainer>
  );
};

export default BillsOverview;

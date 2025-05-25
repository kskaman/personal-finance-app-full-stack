import { Typography, Stack, useTheme } from "@mui/material";
import { formatNumber } from "../../../utils/utilityFunctions";
import { useContext } from "react";
import { SettingsContext } from "../../settings/context/SettingsContext";
import { useBalance } from "../hooks/useBalance";

const Balance = ({ isParentSm }: { isParentSm: boolean }) => {
  const theme = useTheme();

  const { data: balance = { current: 0, income: 0, expenses: 0 }, isError } =
    useBalance();

  const currencySymbol = useContext(SettingsContext).selectedCurrency;

  if (isError) return null;

  return (
    <>
      <Stack
        width="100%"
        direction={isParentSm ? "column" : "row"}
        flexWrap="wrap"
        gap="24px"
        justifyContent="flex-start"
        alignItems="center"
      >
        <Stack
          flex={1}
          width="100%"
          direction="column"
          gap="6px"
          padding="24px"
          borderRadius="12px"
          bgcolor={theme.palette.primary.main}
        >
          <Typography fontSize="12px" color={theme.palette.text.primary}>
            Current Balance
          </Typography>
          <Typography fontSize="32px" color={theme.palette.text.primary}>
            {balance.current < 0
              ? `-${currencySymbol}${formatNumber(Math.abs(balance.current))}`
              : `${currencySymbol}${formatNumber(Math.abs(balance.current))}`}
          </Typography>
        </Stack>
        <Stack
          flex={1}
          width="100%"
          direction="column"
          gap="6px"
          padding="24px"
          borderRadius="12px"
          bgcolor={theme.palette.text.primary}
        >
          <Typography fontSize="12px" color={theme.palette.primary.light}>
            Income
          </Typography>
          <Typography fontSize="32px" color={theme.palette.primary.main}>
            {balance.income < 0
              ? `-${currencySymbol}${formatNumber(Math.abs(balance.income))}`
              : `${currencySymbol}${formatNumber(Math.abs(balance.income))}`}
          </Typography>
        </Stack>
        <Stack
          flex={1}
          width="100%"
          direction="column"
          gap="6px"
          padding="24px"
          borderRadius="12px"
          bgcolor={theme.palette.text.primary}
        >
          <Typography fontSize="12px" color={theme.palette.primary.light}>
            Expenses
          </Typography>
          <Typography fontSize="32px" color={theme.palette.primary.main}>
            {`${currencySymbol}${formatNumber(balance.expenses)}`}
          </Typography>
        </Stack>
      </Stack>
    </>
  );
};

export default Balance;

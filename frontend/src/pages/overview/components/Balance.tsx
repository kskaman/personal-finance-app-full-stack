import { Typography, Stack, useTheme } from "@mui/material";
import { formatNumber } from "../../../utils/utilityFunctions";
import type { Balance } from "../../../types/models";

const Balance = ({
  isParentSm,
  balance,
  currencySymbol,
}: {
  isParentSm: boolean;
  balance: Balance;
  currencySymbol: string;
}) => {
  const theme = useTheme();

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
          <Typography fontSize="32px" color={theme.palette.text.primary} noWrap>
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
          <Typography fontSize="32px" color={theme.palette.primary.main} noWrap>
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
          <Typography fontSize="32px" color={theme.palette.primary.main} noWrap>
            {`${currencySymbol}${formatNumber(balance.expenses)}`}
          </Typography>
        </Stack>
      </Stack>
    </>
  );
};

export default Balance;

import { Box, Stack, Typography, useTheme } from "@mui/material";
import Grid from "@mui/material/Grid2";
import CaretRightIcon from "../../../Icons/CaretRightIcon";
import SubContainer from "../../../ui/SubContainer";
import BudgetsPieChart from "../../budgets/components/BudgetsPieChart";
import { formatNumber } from "../../../utils/utilityFunctions";
import useParentWidth from "../../../customHooks/useParentWidth";
import { Link } from "react-router";
import { Budget } from "../../../types/models";

const BudgetsOverview = ({
  stats,
  currencySymbol,
}: {
  stats: { totalMaximum: number; budgets: Budget[] };
  currencySymbol: string;
}) => {
  const theme = useTheme();

  const topBudgets = stats.budgets.slice(0, 4);

  const colorsArr = stats.budgets.map((budget) => budget.theme);

  const { containerRef, parentWidth } = useParentWidth();

  const isParentWidth = parentWidth < 600;

  return (
    <Box ref={containerRef}>
      <SubContainer>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography
            fontWeight="bold"
            fontSize="20px"
            color={theme.palette.primary.main}
          >
            My Budgets
          </Typography>
          <Link
            to="/app/budgets"
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
        <Stack
          direction={isParentWidth ? "column" : "row"}
          gap="32px"
          justifyContent={isParentWidth ? "flex-start" : "space-evenly"}
        >
          <Stack alignItems="center" justifyContent="center">
            <BudgetsPieChart
              spendings={stats.budgets.map((b) => b.spent)}
              limit={stats.totalMaximum}
              colors={colorsArr}
            />
          </Stack>

          <Grid
            container
            rowSpacing="24px"
            columnSpacing="24px"
            columns={isParentWidth ? 2 : 1}
            width={isParentWidth ? "100%" : "40%"}
          >
            {topBudgets.map((budget) => (
              <Grid
                key={budget.category}
                size={1}
                maxHeight={isParentWidth ? "100%" : "20%"}
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: "16px",
                }}
              >
                {/* Colored Bar */}
                <Box
                  height="100%"
                  width="3px"
                  borderRadius="8px"
                  bgcolor={budget.theme}
                />

                {/* Pot Details */}
                <Stack direction="column">
                  <Typography
                    fontSize="12px"
                    color={theme.palette.primary.light}
                  >
                    {budget.category}
                  </Typography>
                  <Typography
                    fontSize="14px"
                    fontWeight="bold"
                    color={theme.palette.primary.main}
                  >
                    {`${currencySymbol}${formatNumber(budget.maximum)}`}
                  </Typography>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Stack>
      </SubContainer>
    </Box>
  );
};

export default BudgetsOverview;

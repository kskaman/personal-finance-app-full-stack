import { Box, Stack, Typography, useTheme } from "@mui/material";
import Grid from "@mui/material/Grid2";
import PotIcon from "../../../Icons/PotIcon";
import CaretRightIcon from "../../../Icons/CaretRightIcon";
import { formatNumber } from "../../../utils/utilityFunctions";
import SubContainer from "../../../ui/SubContainer";
import useParentWidth from "../../../customHooks/useParentWidth";
import { SM_BREAK } from "../../../constants/widthConstants";
import { Link } from "react-router";

const PotsOverview = ({
  potStats,
  currencySymbol,
}: {
  potStats: {
    totalSaved: number;
    topPots: {
      name: string;
      total: number;
      theme: string;
    }[];
  };
  currencySymbol: string;
}) => {
  const theme = useTheme();

  const { containerRef, parentWidth } = useParentWidth();

  const isParentWidth = parentWidth < SM_BREAK;

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
            Pots
          </Typography>
          <Link
            to="/app/pots"
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
        <Stack direction={isParentWidth ? "column" : "row"} gap="20px">
          <Stack
            flex={1}
            direction="row"
            padding="16px"
            alignItems="center"
            gap="16px"
            height="110px"
            bgcolor={theme.palette.background.default}
            borderRadius="12px"
          >
            <PotIcon color={theme.palette.others.green} />
            <Stack direction="column" justifyContent="space-between">
              <Typography fontSize="14px" color={theme.palette.primary.light}>
                Total Saved
              </Typography>
              <Typography fontSize="32px" color={theme.palette.primary.main}>
                {`${currencySymbol}${formatNumber(potStats.totalSaved)}`}
              </Typography>
            </Stack>
          </Stack>
          <Grid
            container
            flex={1}
            rowSpacing="24px"
            columnSpacing="24px"
            columns={2}
          >
            {potStats.topPots.map((pot, index) => (
              <Grid
                key={index}
                maxHeight={isParentWidth ? "100%" : "45%"}
                size={1}
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
                  bgcolor={pot.theme}
                />

                {/* Pot Details */}
                <Stack direction="column">
                  <Typography
                    fontSize="12px"
                    color={theme.palette.primary.light}
                  >
                    {pot.name}
                  </Typography>
                  <Typography
                    fontSize="14px"
                    fontWeight="bold"
                    color={theme.palette.primary.main}
                  >
                    {`${currencySymbol}${formatNumber(pot.total)}`}
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

export default PotsOverview;

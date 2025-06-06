import { Divider, List, ListItem, Typography, useTheme } from "@mui/material";
import SubContainer from "../../../ui/SubContainer";
import { formatNumber } from "../../../utils/utilityFunctions";
import { useContext } from "react";
import { SettingsContext } from "../../settings/context/SettingsContext";
import { useBillStats } from "../hooks/useBills";
import { summaryData } from "../../../constants/billsSummaryLabels";

const Summary = () => {
  const theme = useTheme();

  const { data: stats } = useBillStats();

  const recurringSummary = {
    due: stats.due,
    unpaid: stats.unpaid,
    dueSoon: stats.dueSoon,
    paid: stats.paid,
  };

  const showDue = recurringSummary.due.count !== 0;

  const currencySymbol = useContext(SettingsContext).selectedCurrency;

  return (
    <>
      <SubContainer gap="20px" width="100%" padding={{ xs: "20px" }}>
        <Typography
          fontSize="16px"
          fontWeight="bold"
          color={theme.palette.primary.main}
        >
          Summary
        </Typography>
        <List>
          {Object.entries(recurringSummary)
            .filter(([key]) => key !== "due" || showDue)
            .map(([key, summary], index) => {
              const typedKey = key as keyof typeof summaryData;
              const isDue = key === "due";
              return (
                <div key={index}>
                  <ListItem
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      margin: "16px 0",
                      padding: 0,
                    }}
                  >
                    <Typography
                      fontSize={isDue ? "14px" : "12px"}
                      fontWeight={isDue ? "bold" : "normal"}
                      color={
                        isDue
                          ? theme.palette.others.red
                          : theme.palette.primary.light
                      }
                    >
                      {summaryData[typedKey].label}
                    </Typography>
                    <Typography
                      fontSize={isDue ? "14px" : "12px"}
                      fontWeight="bold"
                      color={
                        key === "dueSoon" || isDue
                          ? theme.palette.others.red
                          : theme.palette.primary.main
                      }
                    >
                      {`${summary.count} (${currencySymbol}${formatNumber(
                        summary.total
                      )})`}
                    </Typography>
                  </ListItem>

                  {index < 3 && <Divider key={key} />}
                </div>
              );
            })}
        </List>
      </SubContainer>
    </>
  );
};

export default Summary;

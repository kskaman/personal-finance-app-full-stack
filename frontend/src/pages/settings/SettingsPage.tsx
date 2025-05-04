import { Box, Stack, Typography, useTheme } from "@mui/material";
import PageDiv from "../../ui/PageDiv";
import Button from "../../ui/Button";
import SetTitle from "../../ui/SetTitle";
import LogoutIcon from "../../Icons/LogoutIcon";
import SubContainer from "../../ui/SubContainer";

import SettingsOptionGroup from "./components/SettingsOptionGroup";
import useParentWidth from "../../customHooks/useParentWidth";
import { useContext } from "react";
import CategorySettings from "./components/CategorySettings";
import DisplayModulesGroup from "./components/DisplayModulesGroup";
import UserAccountInfo from "./components/UserAccountInfo";
import { useNavigate } from "react-router";
import DeleteAccount from "./components/DeleteAccount";

import { logoutUser } from "../../services/settingsService";
import { SettingsContext } from "./context/SettingsContext";
import { Currency, Font } from "../../types/models";
import { DisplayedModules, SettingsRadioOption } from "../../types/Data";
import { useAuth } from "../../auth/hooks/useAuth";

const SettingsPage = () => {
  const theme = useTheme();
  const { parentWidth, containerRef } = useParentWidth();
  const {
    selectedFont,
    handleFontSelect,
    selectedCurrency,
    handleCurrencySelect,
    displayedModules,
    handleTogglePots,
    handleToggleBills,
    handleToggleBudgets,
  } = useContext(SettingsContext);

  const navigate = useNavigate();

  const { setUser } = useAuth();

  // Handler to toggle the "using" property for a given module.
  const handleModuleToggle = (moduleKey: keyof DisplayedModules) => {
    const current = displayedModules[moduleKey];
    const updated = !current;

    switch (moduleKey) {
      case "pots":
        handleTogglePots(updated);
        break;
      case "bills":
        handleToggleBills(updated);
        break;
      case "budgets":
        handleToggleBudgets(updated);
        break;
      default:
        break;
    }
  };

  const fontOptions: SettingsRadioOption[] = [
    {
      value: Font.source_code,
      symbol: (
        <Typography
          fontSize="14px"
          color={theme.palette.primary.main}
          fontFamily="source-code"
        >
          Aa
        </Typography>
      ),
      label: (
        <Typography
          fontFamily="source-code"
          fontSize="14px"
          color={theme.palette.primary.main}
        >
          Source Code
        </Typography>
      ),
    },
    {
      value: Font.noto_serif,
      symbol: (
        <Typography
          fontSize="14px"
          color={theme.palette.primary.main}
          fontFamily="noto-serif"
        >
          Aa
        </Typography>
      ),
      label: (
        <Typography
          fontSize="14px"
          fontFamily="noto-serif"
          color={theme.palette.primary.main}
        >
          Noto Serif
        </Typography>
      ),
    },
    {
      value: Font.public_sans,
      symbol: (
        <Typography
          fontSize="14px"
          color={theme.palette.primary.main}
          fontFamily="public-sans"
        >
          Aa
        </Typography>
      ),
      label: (
        <Typography
          fontFamily="public-sans"
          fontSize="14px"
          color={theme.palette.primary.main}
        >
          Public Sans
        </Typography>
      ),
    },
  ];

  const currencyOptions: SettingsRadioOption[] = [
    {
      value: Currency.us_dollar,
      symbol: (
        <Typography color={theme.palette.primary.main} fontSize="14px">
          $
        </Typography>
      ),
      label: (
        <Typography fontSize="14px" color={theme.palette.primary.main}>
          U.S. Dollar
        </Typography>
      ),
    },
    {
      value: Currency.cad_dollar,
      symbol: (
        <Typography fontSize="14px" color={theme.palette.primary.main}>
          C$
        </Typography>
      ),
      label: (
        <Typography fontSize="14px" color={theme.palette.primary.main}>
          Canadian Dollar
        </Typography>
      ),
    },
    {
      value: Currency.euro,
      symbol: (
        <Typography color={theme.palette.primary.main} fontSize="14px">
          €
        </Typography>
      ),
      label: (
        <Typography fontSize="14px" color={theme.palette.primary.main}>
          Euro
        </Typography>
      ),
    },
    {
      value: Currency.indian_rupees,
      symbol: (
        <Typography color={theme.palette.primary.main} fontSize="14px">
          ₹
        </Typography>
      ),
      label: (
        <Typography fontSize="14px" color={theme.palette.primary.main}>
          Indian Rupees
        </Typography>
      ),
    },
    {
      value: Currency.british_pound_sterling,
      symbol: (
        <Typography color={theme.palette.primary.main} fontSize="14px">
          £
        </Typography>
      ),
      label: (
        <Typography fontSize="14px" color={theme.palette.primary.main}>
          British Pound Sterling
        </Typography>
      ),
    },
    {
      value: Currency.australian_dollar,
      symbol: (
        <Typography color={theme.palette.primary.main} fontSize="14px">
          A$
        </Typography>
      ),
      label: (
        <Typography fontSize="14px" color={theme.palette.primary.main}>
          Australian Dollar
        </Typography>
      ),
    },
    {
      value: Currency.chinese_yuan,
      symbol: (
        <Typography color={theme.palette.primary.main} fontSize="14px">
          ¥
        </Typography>
      ),
      label: (
        <Typography fontSize="14px" color={theme.palette.primary.main}>
          Chinese Yuan
        </Typography>
      ),
    },
  ];

  return (
    <>
      <SetTitle title="Settings" />
      <Box ref={containerRef}></Box>
      <PageDiv>
        <Stack gap="32px">
          <Stack direction="row" gap="32px">
            <Typography
              width="100%"
              height="56px"
              fontSize="32px"
              fontWeight="bold"
              color={theme.palette.primary.main}
            >
              Settings
            </Typography>
            <Button
              height="53px"
              padding="16px"
              backgroundColor={theme.palette.primary.main}
              color={theme.palette.text.primary}
              onClick={async () => {
                await logoutUser();
                setUser(null);
                navigate("/auth/login", { replace: true });
              }}
              hoverColor={theme.palette.text.primary}
              hoverBgColor={theme.palette.primary.light}
            >
              <Stack direction="row" gap={1} alignItems="center">
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "24px",
                    height: "24px",
                  }}
                >
                  <LogoutIcon color="inherit" />
                </Box>
                <Typography
                  noWrap
                  display={parentWidth < 450 ? "none" : "auto"}
                  fontSize="14px"
                  fontWeight="bold"
                >
                  Log Out
                </Typography>
              </Stack>
            </Button>
          </Stack>

          {/* User Account Info */}
          <UserAccountInfo />

          <Stack gap="20px">
            {/* Font Option */}
            <SubContainer>
              <SettingsOptionGroup
                heading="Font Options"
                options={fontOptions}
                selectedValue={selectedFont}
                onChange={(e) => handleFontSelect(e.target.value as Font)}
                parentWidth={parentWidth}
              />
            </SubContainer>

            <SubContainer>
              <SettingsOptionGroup
                heading="Currency Symbol"
                options={currencyOptions}
                selectedValue={selectedCurrency}
                onChange={(e) =>
                  handleCurrencySelect(e.target.value as Currency)
                }
                parentWidth={parentWidth}
              />
            </SubContainer>

            {/* Category Option container */}
            <CategorySettings parentWidth={parentWidth} />

            {/* Display Modules Group */}
            <SubContainer>
              <DisplayModulesGroup
                displayOptions={displayedModules}
                onChange={handleModuleToggle}
                parentWidth={parentWidth}
              />
            </SubContainer>
          </Stack>

          {/* Delete Account Button */}
          <Box marginLeft="auto">
            <DeleteAccount />
          </Box>
        </Stack>
      </PageDiv>
    </>
  );
};

export default SettingsPage;

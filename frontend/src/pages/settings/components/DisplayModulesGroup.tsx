import {
  FormControl,
  FormControlLabel,
  Checkbox,
  Stack,
  Typography,
  lighten,
  useTheme,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { MD_BREAK } from "../../../data/widthConstants";
import useModal from "../../../customHooks/useModal";
import { useState } from "react";
import DisplayModuleToggleModal from "./DisplayModuleToggleModal";
import { DisplayedModules } from "../../../types/Data";
import { moduleLabels } from "../../../constants/moduleLabels";

interface DisplayModulesGroupProps {
  displayOptions: DisplayedModules;
  onChange: (value: keyof DisplayedModules) => void;
  parentWidth: number;
}

const DisplayModulesGroup = ({
  displayOptions,
  onChange,
  parentWidth,
}: DisplayModulesGroupProps) => {
  const theme = useTheme();
  const isMobile = parentWidth < MD_BREAK;
  const gridTemplateColumns = isMobile
    ? "1fr"
    : "repeat(auto-fit, minmax(250px, 1fr))";

  const [selectedModuleKey, setSelectedModuleKey] = useState<
    keyof DisplayedModules | null
  >(null);

  const { isOpen, openModal, closeModal } = useModal();

  // When a tile is clicked, check if it's currently enabled
  // If enabled (using is true), then we show the modal before unchecking
  // Otherwise, if it's not enabled, then toggle directly.
  const handleTileClick = (key: keyof DisplayedModules) => {
    if (displayOptions[key]) {
      setSelectedModuleKey(key);
      openModal();
    } else {
      // Directly toggle if user is checking the module
      onChange(key);
    }
  };

  // When modal "Proceed" is clicked, call onChange for the selected module
  const handleModalProceed = () => {
    if (selectedModuleKey) {
      onChange(selectedModuleKey);
      setSelectedModuleKey(null);
    }
  };

  return (
    <Stack gap="20px">
      <Typography
        fontSize="16px"
        fontWeight="bold"
        color={theme.palette.primary.main}
      >
        Display Features
      </Typography>
      <FormControl component="fieldset">
        <Stack
          direction="row"
          gap="8px"
          sx={{
            display: "grid",
            gridTemplateColumns,
          }}
        >
          {Object.keys(moduleLabels).map((key) => {
            const k = key as keyof DisplayedModules;
            return (
              <Grid key={k}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  width="100%"
                  bgcolor={theme.palette.primary.contrastText}
                  borderRadius="8px"
                  padding={1}
                  sx={{
                    cursor: "pointer",
                    "&:hover": {
                      backgroundColor: lighten(
                        theme.palette.background.default,
                        0.6
                      ),
                    },
                  }}
                  onClick={() => handleTileClick(key as keyof DisplayedModules)}
                >
                  <Typography color={theme.palette.primary.light}>
                    {key}
                  </Typography>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={displayOptions[k]}
                        disableRipple
                        color="primary"
                      />
                    }
                    label=""
                  />
                </Stack>
              </Grid>
            );
          })}
        </Stack>
      </FormControl>

      {isOpen && (
        <DisplayModuleToggleModal
          open={isOpen}
          onClose={() => {
            closeModal();
            setSelectedModuleKey(null);
          }}
          handleProceed={handleModalProceed}
          label={
            selectedModuleKey ? (moduleLabels[selectedModuleKey] as string) : ""
          }
        />
      )}
    </Stack>
  );
};

export default DisplayModulesGroup;

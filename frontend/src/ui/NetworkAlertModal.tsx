import { Stack, Typography, useTheme } from "@mui/material";
import ActionModal from "./ActionModal";

interface NetworkAlertModalProps {
  open: boolean;
  onClose: () => void;
}

const NetworkAlertModal = ({ open, onClose }: NetworkAlertModalProps) => {
  const theme = useTheme();

  return (
    <ActionModal open={open} onClose={onClose} heading="Network Error">
      <Stack gap="16px">
        <Typography fontSize="16px" color={theme.palette.text.secondary}>
          Unable to save data. Please check your internet connection or try
          again later.
        </Typography>
      </Stack>
    </ActionModal>
  );
};

export default NetworkAlertModal;

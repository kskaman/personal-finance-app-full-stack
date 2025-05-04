import { Box, lighten, Stack, Typography, useTheme } from "@mui/material";
import { useNavigate } from "react-router";
import { useContext } from "react";
import Button from "../../../ui/Button";
import DeleteIcon from "../../../Icons/DeleteIcon";
import DeleteModal from "../../../ui/DeleteModal";
import useModal from "../../../customHooks/useModal";
import AuthContext from "../../../auth/context/AuthContext";
import { deleteAccount } from "../../../services/authService";

const DeleteAccount = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, setUser } = useContext(AuthContext);

  // Confirmation modal
  const {
    isOpen: isConfirmOpen,
    openModal: openConfirm,
    closeModal: closeConfirm,
  } = useModal();

  // Delete after confirmation
  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();
      setUser(null);
      navigate("/auth/login", { replace: true });
    } catch (err) {
      console.error("Error deleting account", err);
      alert("Failed to delete account.");
    } finally {
      closeConfirm();
    }
  };

  return (
    <>
      {/* Delete button */}
      <Button
        height="53px"
        padding="16px"
        backgroundColor={theme.palette.others.red}
        color={theme.palette.text.primary}
        onClick={openConfirm}
        hoverColor={theme.palette.text.primary}
        hoverBgColor={lighten(theme.palette.others.red, 0.2)}
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
            <DeleteIcon color="inherit" />
          </Box>
          <Typography noWrap fontSize="14px" fontWeight="bold">
            Delete&nbsp;Account
          </Typography>
        </Stack>
      </Button>

      {/* Confirm‑delete for real users */}
      {isConfirmOpen && (
        <DeleteModal
          open={isConfirmOpen}
          onClose={closeConfirm}
          handleDelete={handleDeleteAccount}
          label={user?.name ?? "Account"}
          warningText={`Are you sure you want to delete your account? 
            This action cannot be reversed. All data will be removed and 
            you will be redirected to the sign‑in page.`}
          type="account"
        />
      )}
    </>
  );
};

export default DeleteAccount;

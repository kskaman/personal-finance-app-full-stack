import { useState } from "react";
import {
  Stack,
  Typography,
  IconButton,
  lighten,
  useTheme,
} from "@mui/material";
import EditIcon from "../../../Icons/EditIcon";
import Button from "../../../ui/Button";
import SubContainer from "../../../ui/SubContainer";
import ChangePasswordModal from "./ChangePasswordModal";
import ModalTextField from "../../../ui/ModalTextField";
import { updateName } from "../../../services/userService";
import { useAuth } from "../../../auth/hooks/useAuth";

const UserAccountInfo = () => {
  const theme = useTheme();
  const { user, setUser } = useAuth();
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [editedName, setEditedName] = useState<string>(user?.name || "");
  const [isPasswordModalOpen, setIsPasswordModalOpen] =
    useState<boolean>(false);

  const handleNameSave = async () => {
    if (!user) return;
    try {
      const newUser = await updateName(editedName.trim());
      console.log(newUser.name);
      setUser(newUser);

      setIsEditingName(false);
    } catch (err) {
      console.error("Name update failed", err);
      // optionally show toast
    }
  };

  if (!user) return null;

  return (
    <SubContainer>
      <Typography
        fontSize="16px"
        fontWeight="bold"
        color={theme.palette.primary.main}
      >
        User Information
      </Typography>
      <Stack gap="20px">
        {/* Inline editable Name */}
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography fontSize="14px" color={theme.palette.primary.main}>
            Name :
          </Typography>
          {isEditingName ? (
            <>
              <ModalTextField
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                label={""}
                adornmentTextFlag={false}
              />
              <Button
                onClick={handleNameSave}
                height="40px"
                padding="8px"
                backgroundColor={theme.palette.primary.main}
                color={theme.palette.text.primary}
                hoverColor={theme.palette.primary.light}
                hoverBgColor={lighten(theme.palette.primary.main, 0.2)}
              >
                Save
              </Button>
            </>
          ) : (
            <>
              <Typography fontSize={"14px"} color={theme.palette.primary.light}>
                {user.name}
              </Typography>
              <IconButton onClick={() => setIsEditingName(true)}>
                <EditIcon />
              </IconButton>
            </>
          )}
        </Stack>

        {/* Email (read-only) */}
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography fontSize="14px" color={theme.palette.primary.main}>
            Email :
          </Typography>
          <Typography fontSize="14px" color={theme.palette.primary.light}>
            {user.email}
          </Typography>
        </Stack>

        {/* Trigger password change modal */}
        <Button
          onClick={() => setIsPasswordModalOpen(true)}
          height="40px"
          padding="8px"
          backgroundColor={theme.palette.primary.main}
          color={theme.palette.text.primary}
          hoverColor={theme.palette.text.primary}
          hoverBgColor={lighten(theme.palette.primary.main, 0.2)}
        >
          <Typography
            fontSize="14px"
            fontWeight="bold"
            color={theme.palette.text.primary}
          >
            Change Password
          </Typography>
        </Button>
      </Stack>

      {isPasswordModalOpen && (
        <ChangePasswordModal
          open={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
        />
      )}
    </SubContainer>
  );
};

export default UserAccountInfo;

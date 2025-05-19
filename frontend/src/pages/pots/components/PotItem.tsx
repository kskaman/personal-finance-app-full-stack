import { Box, Stack, Typography, useTheme } from "@mui/material";

import SubContainer from "../../../ui/SubContainer";
import Button from "../../../ui/Button";
import PotsProgressBar from "./PotsProgressBar";
import OptionsButton from "../../../ui/OptionsButton";
import { Pot } from "../../../types/models";

interface Props {
  pot: Pot;
  onDelete: () => void;
  onEdit: () => void;
  onAddMoney: () => void;
  onWithdrawMoney: () => void;
}

const PotItem = ({
  pot,
  onDelete,
  onEdit,
  onAddMoney,
  onWithdrawMoney,
}: Props) => {
  const theme = useTheme();
  return (
    <SubContainer gap="32px">
      <Stack direction="row" alignItems="center" gap="24px">
        <Box
          width="20px"
          height="20px"
          borderRadius="50%"
          bgcolor={pot.theme}
        ></Box>
        <Typography
          role="heading"
          fontSize="20px"
          fontWeight="bold"
          color={theme.palette.primary.main}
        >
          {pot.name}
        </Typography>
        <OptionsButton type="pot" onEdit={onEdit} onDelete={onDelete} />
      </Stack>

      <PotsProgressBar
        value={pot.total}
        target={pot.target}
        color={pot.theme}
        bgColor={theme.palette.background.default}
      />

      <Stack direction="row" gap="16px" height="53px">
        <Button
          flex={1}
          height="100%"
          color={theme.palette.primary.main}
          backgroundColor={theme.palette.background.default}
          onClick={onAddMoney}
          hoverBgColor="inherit"
          hoverColor={theme.palette.primary.main}
        >
          <Typography fontSize="14px" fontWeight="bold" noWrap>
            + Add Money
          </Typography>
        </Button>
        <Button
          flex={1}
          height="100%"
          color={theme.palette.primary.main}
          backgroundColor={theme.palette.background.default}
          onClick={onWithdrawMoney}
          hoverBgColor="inherit"
          hoverColor={theme.palette.primary.main}
        >
          <Typography fontSize="14px" fontWeight="bold" noWrap>
            Withdraw
          </Typography>
        </Button>
      </Stack>
    </SubContainer>
  );
};

export default PotItem;

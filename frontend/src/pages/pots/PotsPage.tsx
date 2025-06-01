import { Box, Stack, Typography, useTheme } from "@mui/material";
import Grid from "@mui/material/Grid2";
import SetTitle from "../../ui/SetTitle";
import PageDiv from "../../ui/PageDiv";
import { useMemo, useState } from "react";
import PotItem from "./components/PotItem";
import Button from "../../ui/Button";
import useParentWidth from "../../customHooks/useParentWidth";
import { MD_BREAK } from "../../constants/widthConstants";
import useModal from "../../customHooks/useModal";
import DeleteModal from "../../ui/DeleteModal";
import AddEditPotModal from "./components/AddEditPotModal";
import PotMoneyModal from "./components/PotMoneyModal";
import { updateUsedStatuses } from "../../utils/potsUtils";
import EmptyStatePage from "../../ui/EmptyStatePage";
import { Balance, Pot } from "../../types/models";
import {
  useCreatePot,
  useDeletePot,
  usePots,
  usePotTransaction,
  useUpdatePot,
} from "./hooks/usePots";
import DotLoader from "../../ui/DotLoader";
import { useBalance, useUpdateBalance } from "../overview/hooks/useBalance";
import { defaultThemes } from "../../constants/markerThemes";

const PotsPage = () => {
  const theme = useTheme();
  const { containerRef, parentWidth } = useParentWidth();

  const { data: pots = [], isLoading, isError, refetch } = usePots();
  const createPotMutation = useCreatePot();
  const updatePotMutation = useUpdatePot();
  const deletePotMutation = useDeletePot();
  const potTxnMutation = usePotTransaction();

  const { data: balanceData } = useBalance();
  const updateBalanceMutation = useUpdateBalance();

  const updatedThemeOptions = useMemo(() => {
    return updateUsedStatuses(pots, defaultThemes).updatedMarkerThemes;
  }, [pots]);

  const {
    isOpen: isDeleteModal,
    openModal: openDeleteModal,
    closeModal: closeDeleteModal,
  } = useModal();

  const {
    isOpen: isAddEditModalOpen,
    openModal: openAddEditModal,
    closeModal: closeAddEditModal,
  } = useModal();

  const {
    isOpen: isPotMoneyModalOpen,
    openModal: openPotMoneyModal,
    closeModal: closePotMoneyModal,
  } = useModal();

  const [selectedPot, setSelectedPot] = useState<Pot | null>(null);
  const [mode, setMode] = useState<"add" | "edit" | null>(null);
  const [potTxnType, setPotTxnType] = useState<"add" | "withdraw" | null>(null);

  const handlePotDelete = () => {
    if (!selectedPot) return;

    deletePotMutation.mutate(selectedPot.id, {
      onSuccess: () => {
        if (!balanceData) return;
        const newBalance: Balance = {
          current: balanceData.current + selectedPot.total,
          income: balanceData.income,
          expenses: balanceData.expenses,
        };
        updateBalanceMutation.mutate(newBalance);
        setSelectedPot(null);
      },
    });
  };

  const handleAddPot = ({
    potName,
    target,
    markerTheme,
  }: {
    potName: string;
    target: string;
    markerTheme: string;
  }) => {
    createPotMutation.mutate({
      name: potName,
      target: parseFloat(target),
      theme: markerTheme,
    });
  };

  const handleEditPot = ({
    potName,
    target,
    markerTheme,
  }: {
    potName: string;
    target: string;
    markerTheme: string;
  }) => {
    if (!selectedPot) return;

    updatePotMutation.mutate(
      {
        id: selectedPot.id,
        data: { name: potName, target: parseFloat(target), theme: markerTheme },
      },
      {
        onSuccess: () => setSelectedPot(null),
      }
    );
  };

  const handleUpdatePotAmount = (amount: number) => {
    if (!selectedPot || !potTxnType) return;

    potTxnMutation.mutate(
      {
        id: selectedPot.id,
        data: { type: potTxnType, amount: amount },
      },
      {
        onSuccess: () => {
          if (!balanceData) return;
          const newBalance: Balance = {
            current:
              potTxnType === "add"
                ? balanceData.current - amount
                : balanceData.current + amount,
            income: balanceData.income,
            expenses: balanceData.expenses,
          };
          updateBalanceMutation.mutate(newBalance);
          setSelectedPot(null);
        },
      }
    );
  };

  const potNamesUsed = useMemo(
    () => pots.map((p: Pot) => p.name.toLowerCase()),
    [pots]
  );

  // Loading UI
  if (isLoading) return <DotLoader />;

  //Error UI
  if (isError) {
    return (
      <EmptyStatePage
        message="Unable to fetch pots"
        subText="Check your connection."
        buttonLabel="Retry"
        onButtonClick={refetch}
      />
    );
  }

  if (pots.length === 0) {
    return (
      <>
        <EmptyStatePage
          message="No Pots Yet"
          subText="Create your first pot to set aside money for a goal or expense."
          buttonLabel={parentWidth < 450 ? "+" : "+ Create a Pot"}
          onButtonClick={() => {
            setMode("add");
            openAddEditModal();
          }}
        />
        {isAddEditModalOpen && (
          <AddEditPotModal
            open={isAddEditModalOpen}
            onClose={() => {
              closeAddEditModal();
              setSelectedPot(null);
              setMode(null);
            }}
            updatePots={
              mode === "edit"
                ? handleEditPot
                : mode === "add"
                ? handleAddPot
                : () => {}
            }
            mode={mode}
            potNamesUsed={potNamesUsed.filter(
              (potName: string) => potName !== selectedPot?.name
            )}
            themeOptions={updatedThemeOptions}
          />
        )}
      </>
    );
  }

  return (
    <>
      <SetTitle title="Pots" />
      <Box ref={containerRef}>
        <PageDiv>
          <Stack gap="24px">
            <Stack direction="row" gap="32px">
              <Typography
                width="100%"
                height="56px"
                fontSize="32px"
                fontWeight="bold"
                color={theme.palette.primary.main}
              >
                Pots
              </Typography>
              <Button
                height="53px"
                padding="16px"
                backgroundColor={theme.palette.primary.main}
                color={theme.palette.text.primary}
                onClick={() => {
                  setMode("add");
                  openAddEditModal();
                }}
                hoverColor={theme.palette.text.primary}
                hoverBgColor={theme.palette.primary.light}
              >
                <Typography noWrap fontSize="14px" fontWeight="bold">
                  {parentWidth < 450 ? "+" : "+ Add New Pot"}
                </Typography>
              </Button>
            </Stack>
            <Grid
              container
              spacing="24px"
              columns={parentWidth <= MD_BREAK ? 1 : 2}
            >
              {pots.map((pot: Pot) => {
                return (
                  <Grid key={pot.name} size={1}>
                    <PotItem
                      pot={pot}
                      onDelete={() => {
                        setSelectedPot(pot);
                        openDeleteModal();
                      }}
                      onEdit={() => {
                        setSelectedPot(pot);
                        setMode("edit");
                        openAddEditModal();
                      }}
                      onAddMoney={() => {
                        setSelectedPot(pot);
                        setPotTxnType("add");
                        openPotMoneyModal();
                      }}
                      onWithdrawMoney={() => {
                        setSelectedPot(pot);
                        setPotTxnType("withdraw");
                        openPotMoneyModal();
                      }}
                    />
                  </Grid>
                );
              })}
            </Grid>
          </Stack>
        </PageDiv>

        {isDeleteModal && (
          <DeleteModal
            open={isDeleteModal}
            onClose={() => {
              setSelectedPot(null);
              closeDeleteModal();
            }}
            handleDelete={() => handlePotDelete()}
            label={selectedPot?.name || ""}
            warningText={`Are you sure you want to delete this pot? The money in the pot 
              will be added to current balance. This action cannot be
          reversed and all the data inside it will be removed forever.`}
            type={"pot"}
          />
        )}

        {isAddEditModalOpen && selectedPot && (
          <AddEditPotModal
            open={isAddEditModalOpen}
            onClose={() => {
              closeAddEditModal();
              setSelectedPot(null);
              setMode(null);
            }}
            updatePots={
              mode === "edit"
                ? handleEditPot
                : mode === "add"
                ? handleAddPot
                : () => {}
            }
            mode={mode}
            potNamesUsed={potNamesUsed.filter(
              (potName: string) =>
                potName.toLowerCase() !== selectedPot?.name.toLowerCase()
            )}
            potName={selectedPot?.name}
            targetVal={selectedPot?.target}
            markerTheme={selectedPot?.theme}
            themeOptions={updatedThemeOptions}
          />
        )}

        {isPotMoneyModalOpen && selectedPot && balanceData && (
          <PotMoneyModal
            open={isPotMoneyModalOpen}
            onClose={() => {
              closePotMoneyModal();
              setSelectedPot(null);
              setPotTxnType(null);
            }}
            type={potTxnType}
            potName={selectedPot.name}
            potTotal={selectedPot.total}
            potTarget={selectedPot.target}
            updatePotAmount={(amount) => handleUpdatePotAmount(amount)}
            maxLimit={balanceData?.current}
          />
        )}
      </Box>
    </>
  );
};

export default PotsPage;

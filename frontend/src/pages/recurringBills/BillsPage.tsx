import { Box, Stack, Typography, useTheme } from "@mui/material";
import SetTitle from "../../ui/SetTitle";
import PageDiv from "../../ui/PageDiv";
import { useCallback, useMemo, useState } from "react";
import Total from "./components/Total";
import Summary from "./components/Summary";
import BillsTable from "./components/BillsTable";
import SubContainer from "../../ui/SubContainer";
import useParentWidth from "../../customHooks/useParentWidth";
import { SM_BREAK, XL_BREAK } from "../../constants/widthConstants.ts";
import useModal from "../../customHooks/useModal";

import Button from "../../ui/Button";
import { getRandomColor } from "../../utils/utilityFunctions";
import EmptyStatePage from "../../ui/EmptyStatePage";
import Filter from "../../ui/Filter";
import { RecurringBill } from "../../types/models";
import {
  useBills,
  useCreateBill,
  useDeleteBill,
  useUpdateBill,
  useBillStats,
} from "./hooks/useBills.ts";
import DotLoader from "../../ui/DotLoader";

import DeleteModal from "../../ui/DeleteModal.tsx";
import AddEditBillModal, {
  BillFormValues,
} from "./components/AddEditBillModal";

const BillsPage = () => {
  const theme = useTheme();
  const { containerRef, parentWidth } = useParentWidth();

  // React Query data
  const {
    data: bills = [],
    isLoading: billsLoading,
    isError: billsError,
    refetch,
  } = useBills();
  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsError,
  } = useBillStats();

  // mutations
  const addBillMutation = useCreateBill();
  const editBillMutation = useUpdateBill();
  const delBillMutation = useDeleteBill();

  // Modal management hooks.
  const {
    isOpen: isDeleteModalOpen,
    openModal: openDeleteModal,
    closeModal: closeDeleteModal,
  } = useModal();

  const {
    isOpen: isEditModalOpen,
    openModal: openEditModal,
    closeModal: closeEditModal,
  } = useModal();

  const {
    isOpen: isAddModalOpen,
    openModal: openAddModal,
    closeModal: closeAddModal,
  } = useModal();

  // Local state for the selected bill (for edit or delete)
  const [selectedBill, setSelectedBill] = useState<RecurringBill | null>(null);
  const [searchText, setSearchText] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("Latest");

  // Delete handler.
  const handleAddBill = useCallback(
    (formData: BillFormValues) => {
      addBillMutation.mutate({
        name: formData.name,
        category: formData.category,
        amount: -parseFloat(formData.amount),
        dueDate: formData.dueDate,
        theme: getRandomColor(),
      });
    },
    [addBillMutation]
  );

  // Edit bill handler
  const handleEditBill = useCallback(
    (formData: BillFormValues, billId?: string) => {
      if (!billId) return;
      editBillMutation.mutate({
        id: billId,
        data: {
          name: formData.name,
          category: formData.category,
          dueDate: formData.dueDate,
          amount: -parseFloat(formData.amount),
        },
      });
    },
    [editBillMutation]
  );

  // Delete bill handler
  const handleBillDelete = useCallback(
    (billId?: string) => {
      if (!billId) return;
      delBillMutation.mutate(billId);
    },
    [delBillMutation]
  );

  const filteredBills = useMemo(() => {
    const result = bills.filter((bill: RecurringBill) =>
      searchText
        ? bill.name.toLowerCase().includes(searchText.toLowerCase().trim())
        : true
    );

    return result.sort((a: RecurringBill, b: RecurringBill) => {
      switch (sortBy) {
        case "Latest":
          return Number(a.dueDate) - Number(b.dueDate);
        case "Oldest":
          return Number(b.dueDate) - Number(a.dueDate);
        case "A to Z":
          return a.name.localeCompare(b.name);
        case "Z to A":
          return b.name.localeCompare(a.name);
        case "Highest":
          return a.amount - b.amount;
        case "Lowest":
          return b.amount - a.amount;
        default:
          return 0;
      }
    });
  }, [bills, searchText, sortBy]);

  if (billsLoading || statsLoading) {
    return <DotLoader />;
  }

  if (billsError || statsError)
    return (
      <EmptyStatePage
        message="Unable to fetch bills"
        subText="Check your connection and retry."
        buttonLabel="Retry"
        onButtonClick={() => refetch()}
      />
    );

  if (stats.total === 0) {
    return (
      <>
        <Box ref={containerRef}>
          <EmptyStatePage
            message="No Bills Yet"
            subText="Track your recurring expenses by adding your first bill."
            buttonLabel={parentWidth < 450 ? "+" : "+ Create a Bill"}
            onButtonClick={() => {
              openAddModal();
            }}
          />
          {/* Add Bill Modal (AddEditBillModal in add mode) */}
          {isAddModalOpen && (
            <AddEditBillModal
              open={isAddModalOpen}
              onClose={closeAddModal}
              onSubmit={(formData: BillFormValues) => {
                handleAddBill(formData);
                closeAddModal();
              }}
            />
          )}
        </Box>
      </>
    );
  }

  return (
    <>
      <SetTitle title="Recurring Bills" />
      <Box ref={containerRef}>
        <PageDiv>
          <Stack direction="column" gap="32px">
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography
                width="100%"
                height="56px"
                fontSize="32px"
                fontWeight="bold"
                color={theme.palette.primary.main}
              >
                Recurring Bills
              </Typography>
              <Button
                height="53px"
                padding="16px"
                backgroundColor={theme.palette.primary.main}
                color={theme.palette.text.primary}
                onClick={openAddModal}
                hoverColor={theme.palette.text.primary}
                hoverBgColor={theme.palette.primary.light}
              >
                <Typography noWrap fontSize="14px" fontWeight="bold">
                  {parentWidth < 450 ? "+" : "+ Add New Bill"}
                </Typography>
              </Button>
            </Stack>
            <Stack
              direction={parentWidth < XL_BREAK ? "column" : "row"}
              gap="24px"
            >
              <Stack
                flex={1}
                gap="24px"
                width="100%"
                minWidth="200px"
                direction={
                  parentWidth > XL_BREAK
                    ? "column"
                    : parentWidth > SM_BREAK
                    ? "row"
                    : "column"
                }
              >
                <Total parentWidth={parentWidth} totalBill={stats.total} />
                <Summary />
              </Stack>
              <SubContainer flex={2}>
                <Stack gap="24px">
                  <Filter
                    parentWidth={parentWidth}
                    searchName={searchText}
                    setSearchName={setSearchText}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                  />
                  <BillsTable
                    parentWidth={parentWidth}
                    bills={filteredBills}
                    setDeleteModalOpen={(bill: RecurringBill) => {
                      setSelectedBill(bill);
                      openDeleteModal();
                    }}
                    setEditModalOpen={(bill: RecurringBill) => {
                      setSelectedBill(bill);
                      openEditModal();
                    }}
                  />
                </Stack>
              </SubContainer>
            </Stack>
          </Stack>
        </PageDiv>

        {/* Delete Modal */}
        {selectedBill && isDeleteModalOpen && (
          <DeleteModal
            open={isDeleteModalOpen}
            onClose={() => {
              setSelectedBill(null);
              closeDeleteModal();
            }}
            handleDelete={() => handleBillDelete(selectedBill.id)}
            label={"Recurring Bill"}
            type="bill"
          />
        )}

        {/* Edit Bill Modal (AddEditBillModal in edit mode) */}
        {selectedBill && isEditModalOpen && (
          <AddEditBillModal
            open={isEditModalOpen}
            onClose={() => {
              setSelectedBill(null);
              closeEditModal();
            }}
            onSubmit={(formData: BillFormValues) => {
              handleEditBill(formData, selectedBill.id);
              closeEditModal();
            }}
            billData={{
              name: selectedBill.name,
              category: selectedBill.category,
              amount: Math.abs(selectedBill.amount),
              dueDate: selectedBill.dueDate,
            }}
          />
        )}

        {/* Add Bill Modal (AddEditBillModal in add mode) */}
        {isAddModalOpen && (
          <AddEditBillModal
            open={isAddModalOpen}
            onClose={closeAddModal}
            onSubmit={(formData: BillFormValues) => {
              handleAddBill(formData);
              closeAddModal();
            }}
          />
        )}
      </Box>
    </>
  );
};

export default BillsPage;

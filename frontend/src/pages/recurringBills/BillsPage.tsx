import { Box, Stack, Typography, useTheme } from "@mui/material";
import SetTitle from "../../ui/SetTitle";
import PageDiv from "../../ui/PageDiv";
import { useContext, useState } from "react";
import Total from "./components/Total";
import Summary from "./components/Summary";
import BillsTable from "./components/BillsTable";
import SubContainer from "../../ui/SubContainer";
import useParentWidth from "../../customHooks/useParentWidth";
import { SM_BREAK, XL_BREAK } from "../../data/widthConstants";
import DeleteModal from "../../ui/DeleteModal";
import useModal from "../../customHooks/useModal";
import AddEditBillModal, {
  BillFormValues,
} from "./components/AddEditBillModal.tsx";
import Button from "../../ui/Button";
import { getRandomColor } from "../../utils/utilityFunctions";
import { BalanceTransactionsActionContext } from "../../context/BalanceTransactionsContext";
import EmptyStatePage from "../../ui/EmptyStatePage";
import Filter from "../../ui/Filter";
import { RecurringBill, Transaction } from "../../types/models";
import {
  useBills,
  useCreateBill,
  useDeleteBill,
  useUpdateBill,
  useBillStats,
} from "./hooks/useBills.ts";
import { useSearchParams } from "react-router";
import DotLoader from "../../ui/DotLoader";

const buildParams = (params: URLSearchParams, key: string, value: string) => {
  const copy = new URLSearchParams(params.toString());
  copy.set(key, value);
  return copy;
};

const BillsPage = () => {
  const theme = useTheme();
  const { containerRef, parentWidth } = useParentWidth();

  // URL params for search and sort
  const [params, setParams] = useSearchParams();
  const searchName = params.get("search") ?? "";
  const sortBy = params.get("sort") ?? "Latest";

  // React Query data
  const { data: bills = [], isLoading, isError, refetch } = useBills(params);
  const { data: stats } = useBillStats();

  // mutations
  const addBillMutation = useCreateBill();
  const editBillMutation = useUpdateBill();
  const delBillMutation = useDeleteBill();

  // If bill changes should propagate to transactions:
  const { setTransactions } = useContext(BalanceTransactionsActionContext);

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

  // Delete handler.
  const handleBillDelete = (billId: string | undefined) => {
    if (!billId) return;
    delBillMutation.mutate(billId);
  };

  // Function to add a new recurring bill.
  const handleAddBill = (formData: BillFormValues) => {
    addBillMutation.mutate({
      name: formData.name,
      category: formData.category,
      amount: -parseFloat(formData.amount),
      dueDate: formData.dueDate,
      theme: getRandomColor(),
    });
  };

  // Function to edit an existing recurring bill.
  // Name and category changes will propagate across all related transactions,
  // while changes to Amount and Due Date affect only future transactions.
  const handleEditBill = (
    formData: BillFormValues,
    billId: string | undefined
  ) => {
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

    // Update all transactions linked to this recurring bill (for name and category changes).
    setTransactions((prevTxns: Transaction[]) =>
      prevTxns.map((txn) =>
        txn.recurring && txn.recurringId === billId
          ? { ...txn, name: formData.name, category: formData.category }
          : txn
      )
    );
  };

  const updateParam = (key: string, value: string) => {
    setParams(buildParams(params, key, value), { replace: true });
  };

  if (isLoading) {
    return <DotLoader />;
  }

  if (isError)
    return (
      <EmptyStatePage
        message="Unable to fetch bills"
        subText="Check your connection and retry."
        buttonLabel="Retry"
        onButtonClick={() => refetch()}
      />
    );

  if (bills.length === 0) {
    return (
      <>
        <EmptyStatePage
          message="No Bills Yet"
          subText="Track your recurring expenses by adding your first bill."
          buttonLabel="Create a Bill"
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
                    searchName={searchName}
                    setSearchName={(name: string) =>
                      updateParam("search", name)
                    }
                    sortBy={sortBy}
                    setSortBy={(val: string) => updateParam("sort", val)}
                  />
                  <BillsTable
                    parentWidth={parentWidth}
                    bills={bills}
                    setDeleteModalOpen={(bill: RecurringBill) => {
                      setSelectedBill(bill);
                      openDeleteModal();
                    }}
                    setEditModalOpen={(bill: RecurringBill) => {
                      setSelectedBill(bill);
                      console.log(selectedBill);
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
